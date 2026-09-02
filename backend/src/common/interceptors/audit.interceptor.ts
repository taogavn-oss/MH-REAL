import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { PrismaService } from '../../infrastructure/prisma/prisma.service.js';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private readonly prisma: PrismaService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const { method, url, user, body } = req;
    
    // Only audit mutating requests
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
      const actorId = user?.userId || null;
      const actorRole = user?.roleCode || null;
      const entityType = this.extractEntityType(url);
      
      // Keep before_data empty for now as it would require querying the DB before the request.
      // In a real system, we might query the DB here if it's an update/delete.
      
      return next.handle().pipe(
        tap(async (data) => {
          try {
            await this.prisma.auditLog.create({
              data: {
                actor_id: actorId,
                actor_role: actorRole,
                action: method,
                entity_type: entityType,
                after_data: method !== 'DELETE' ? body : null,
                ip_address: req.ip,
                user_agent: req.headers['user-agent'],
              },
            });
          } catch (e) {
            console.error('Failed to write audit log', e);
          }
        }),
      );
    }

    return next.handle();
  }

  private extractEntityType(url: string): string {
    const parts = url.split('/').filter(Boolean);
    // basic heuristic for api/v1/entity/...
    if (parts.length >= 3 && parts[0] === 'api' && parts[1] === 'v1') {
      return parts[2];
    }
    return 'unknown';
  }
}
