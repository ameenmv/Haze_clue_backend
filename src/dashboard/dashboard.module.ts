import { Module } from '@nestjs/common';
import { DevicesModule } from '../devices/devices.module';
import { SessionsModule } from '../sessions/sessions.module';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';

@Module({
  imports: [SessionsModule, DevicesModule],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
