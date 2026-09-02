import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../infrastructure/prisma/prisma.service.js';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService, private readonly prisma: PrismaService) {}

  async login(loginId: string, pass: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [
          { email: loginId },
          { employee_code: loginId }
        ]
      },
      include: { role: true },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isMatch = await bcrypt.compare(pass, user.password_hash);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.status !== 'active') {
      throw new UnauthorizedException('User account is inactive');
    }

    const payload = {
      sub: user.id,
      employeeCode: user.employee_code,
      roleCode: user.role.code,
      roleId: user.role.id,
    };

    await this.prisma.user.update({
      where: { id: user.id },
      data: { last_login_at: new Date() },
    });

    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
