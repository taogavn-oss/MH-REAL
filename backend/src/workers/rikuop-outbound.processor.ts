import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { PrismaService } from '../infrastructure/prisma/prisma.service.js';

@Processor('rikuop_outbound')
export class RikuopOutboundProcessor extends WorkerHost {
  private readonly logger = new Logger(RikuopOutboundProcessor.name);

  constructor(private readonly prisma: PrismaService) { super(); }

  async process(job: Job<any, any, string>): Promise<any> {
    const { logId } = job.data;
    
    const log = await this.prisma.rikuopSyncLog.findUnique({ where: { id: logId } });
    if (!log || log.status === 'success') return;

    this.logger.log(`Syncing event ${logId} to RikuOp Vendor API`);

    try {
      // Mock HTTP request to RikuOp
      const mockResponse = { success: true, ref_id: `vend-${Date.now()}` };
      
      await this.prisma.rikuopSyncLog.update({
        where: { id: logId },
        data: {
          status: 'success' as any,
          response_payload: mockResponse,
        }
      });
      
      this.logger.log(`Successfully synced event ${logId} to RikuOp`);
    } catch (error: any) {
      this.logger.error(`Failed to sync event ${logId} to RikuOp`, error);
      throw error;
    }
  }

  @OnWorkerEvent('failed')
  async onFailed(job: Job, error: Error) {
    if (job.name === 'sync-rikuop') {
      const { logId } = job.data;
      
      const log = await this.prisma.rikuopSyncLog.findUnique({ where: { id: logId } });
      if (log) {
        await this.prisma.rikuopSyncLog.update({
          where: { id: logId },
          data: {
            error_message: error.message,
            status: (job.attemptsMade >= job.opts.attempts! ? 'failed' : 'pending') as any
          }
        });
      }
    }
  }
}
