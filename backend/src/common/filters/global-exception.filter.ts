import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const requestId = (request as any).requestId || uuidv4();

    const status = 
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message = 
      exception instanceof HttpException
        ? exception.getResponse()
        : 'Internal server error';

    this.logger.error(`[${requestId}] ${request.method} ${request.url}`, exception instanceof Error ? exception.stack : String(exception));

    response.status(status).json({
      success: false,
      error: {
        code: status,
        message: typeof message === 'object' && message !== null && 'message' in message 
                 ? (message as any).message 
                 : message,
      },
      meta: {
        timestamp: new Date().toISOString(),
        requestId,
      },
    });
  }
}
