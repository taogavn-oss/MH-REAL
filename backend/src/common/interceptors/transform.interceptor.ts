import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Request } from 'express';
import { v4 as uuidv4 } from 'uuid';

export interface Response<T> {
  success: boolean;
  data: T;
  meta: any;
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, Response<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<Response<T>> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<Request>();
    
    // Assign a requestId if it doesn't exist
    if (!(request as any).requestId) {
      (request as any).requestId = uuidv4();
    }
    const requestId = (request as any).requestId;

    return next.handle().pipe(
      map(data => {
        // If the data already contains meta/data structure (e.g., pagination), merge it
        if (data && typeof data === 'object' && 'meta' in data && 'data' in data) {
          return {
            success: true,
            data: data.data,
            meta: {
              ...data.meta,
              timestamp: new Date().toISOString(),
              requestId,
            }
          };
        }
        
        // Wrap normal responses
        return {
          success: true,
          data,
          meta: {
            timestamp: new Date().toISOString(),
            requestId,
          }
        };
      }),
    );
  }
}
