import { Controller, Post, Body, Req, UseGuards } from '@nestjs/common';
import { PusherService } from './pusher.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import type { Request } from 'express';

@Controller('pusher')
export class PusherController {
  constructor(private readonly pusherService: PusherService) {}

  @UseGuards(JwtAuthGuard)
  @Post('auth')
  authenticate(@Req() req: Request, @Body('socket_id') socketId: string, @Body('channel_name') channelName: string) {
    const auth = this.pusherService.pusher.authorizeChannel(socketId, channelName);
    return auth;
  }
}
