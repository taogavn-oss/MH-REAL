import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service.js';

@Injectable()
export class ScopeGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    
    if (!user) return false;
    
    // HQ can access everything
    if (user.roleCode === 'HQ') {
      return true;
    }

    const { storeId, areaId } = request.params;
    
    // Check Store Access for SM / SUB_SM
    if (storeId && (user.roleCode === 'SM' || user.roleCode === 'SUB_SM')) {
      const assignment = await this.prisma.storeManagerAssignment.findUnique({
        where: {
          store_id_user_id: {
            store_id: storeId,
            user_id: user.userId,
          },
        },
      });
      if (!assignment) {
        throw new ForbiddenException('You do not have access to this store.');
      }
    }

    // Check Area Access for AM
    if (areaId && user.roleCode === 'AM') {
      const assignment = await this.prisma.areaManagerAssignment.findUnique({
        where: {
          area_id_am_user_id: {
            area_id: areaId,
            am_user_id: user.userId,
          },
        },
      });
      if (!assignment) {
        throw new ForbiddenException('You do not have access to this area.');
      }
    }

    return true;
  }
}
