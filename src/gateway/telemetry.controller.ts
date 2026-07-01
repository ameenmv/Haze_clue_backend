import { Controller, Post, Body, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PusherService } from '../pusher/pusher.service';
import { Telemetry, TelemetryDocument } from './schemas/telemetry.schema';

@Controller('telemetry')
export class TelemetryController {
  private readonly logger = new Logger(TelemetryController.name);

  constructor(
    private readonly pusherService: PusherService,
    @InjectModel(Telemetry.name) private readonly telemetryModel: Model<TelemetryDocument>,
  ) {}

  @Post()
  async receiveTelemetryData(
    @Body() data: {
      deviceId: string;
      sessionId?: string;
      attention: number;
      meditation?: number;
      delta?: number;
      theta?: number;
      alpha?: number;
      beta?: number;
      gamma?: number;
      rawEegWindow?: number[][]; // 14x512 matrix
    },
  ) {
    let finalAttention = data.attention;

    // If raw EEG window is provided, send it to the AI microservice for inference
    if (data.rawEegWindow) {
      try {
        const aiUrl = process.env.AI_MICROSERVICE_URL || 'http://127.0.0.1:8000';
        const aiResponse = await fetch(`${aiUrl}/api/inference`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ data: data.rawEegWindow }),
        });
        
        if (aiResponse.ok) {
          const result = await aiResponse.json();
          // The AI returns a smoothed probability between 0 and 1, we convert to percentage
          finalAttention = Math.round(result.smoothed_output * 100);
          this.logger.debug(`AI Inference successful: new attention=${finalAttention}%`);
        } else {
          this.logger.error(`AI Inference failed: ${aiResponse.statusText}`);
        }
      } catch (error) {
        this.logger.error(`Failed to connect to AI Microservice: ${error.message}`);
      }
    }
    // 1. Persist the telemetry data point
    const telemetryRecord = await this.telemetryModel.create({
      deviceId: data.deviceId,
      session: data.sessionId || undefined,
      attention: finalAttention,
      meditation: data.meditation,
      delta: data.delta,
      theta: data.theta,
      alpha: data.alpha,
      beta: data.beta,
      gamma: data.gamma,
      recordedAt: new Date(),
    });

    this.logger.debug(`Telemetry received from device ${data.deviceId}: attention=${finalAttention}`);

    // 2. Broadcast to session-specific room if sessionId provided, otherwise to device channel
    const payload = {
      deviceId: data.deviceId,
      attention: finalAttention,
      meditation: data.meditation,
      timestamp: telemetryRecord.recordedAt.toISOString(),
    };

    if (data.sessionId) {
      // Route to specific session room
      this.pusherService.trigger(`session_${data.sessionId}`, 'device:data', payload);
    } else {
      // Fallback: broadcast to device-specific channel
      this.pusherService.trigger(`device_${data.deviceId}`, 'device:data', payload);
    }

    return { success: true, message: 'Telemetry data received and broadcasted' };
  }
}
