import { Injectable } from '@nestjs/common';
import { DevicesService } from '../devices/devices.service';
import { SessionsService } from '../sessions/sessions.service';

@Injectable()
export class DashboardService {
  constructor(
    private readonly sessionsService: SessionsService,
    private readonly devicesService: DevicesService,
  ) {}

  async getStats(userId: string) {
    const [totalSessions, activeSessions, connectedDevices] =
      await Promise.all([
        this.sessionsService.countByUser(userId),
        this.sessionsService.countByUser(userId, 'active'),
        this.devicesService.countByUser(userId, 'connected'),
      ]);

    return {
      connectedDevices,
      totalSessions,
      activeSessions,
      avgAttention: null, // will come from real EEG data later
      reportsGenerated: 0, // will come from reports service later
    };
  }
}
