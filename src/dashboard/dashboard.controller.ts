import { Controller, Get, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { DashboardService } from './dashboard.service';

@Controller('dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  // ── GET /dashboard/stats ───────────────────────────────────
  @Get('stats')
  async getStats(@CurrentUser() userId: string) {
    return this.dashboardService.getStats(userId);
  }
}
