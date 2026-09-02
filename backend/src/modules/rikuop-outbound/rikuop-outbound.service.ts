import { Injectable, Logger } from '@nestjs/common';
import { RikuOpDirection } from '@prisma/client';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

import { PrismaService } from '../../infrastructure/prisma/prisma.service.js';

@Injectable()
export class RikuopOutboundService {
  private readonly logger = new Logger(RikuopOutboundService.name);

  constructor(@InjectQueue('rikuop_outbound') private rikuopQueue: Queue, private readonly prisma: PrismaService) {}

  // Called when a candidate changes state (e.g. booked, passed, failed)
  async enqueueOutboundSync(entityType: string, entityId: string, payload: any) {
    const logEntry = await this.prisma.rikuopSyncLog.create({
      data: {
        direction: 'outbound' as RikuOpDirection,
        entity_type: entityType,
        entity_id: entityId,
        request_payload: payload,
        status: 'pending' as any,
      }
    });

    await this.rikuopQueue.add('sync-rikuop', { logId: logEntry.id }, {
      attempts: 5,
      backoff: {
        type: 'exponential',
        delay: 10000,
      }
    });

    this.logger.log(`Enqueued RikuOp sync for ${entityType} ${entityId}`);
    return logEntry;
  }
}
