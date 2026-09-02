import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'fallback-secret-key-for-dev',
    });
  }

  async validate(payload: any) {
    return { 
      userId: payload.sub, 
      employeeCode: payload.employeeCode,
      roleCode: payload.roleCode,
      roleId: payload.roleId
    };
  }
}
