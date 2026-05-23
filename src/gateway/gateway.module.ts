import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { Telemetry, TelemetrySchema } from './schemas/telemetry.schema';
import { TelemetryController } from './telemetry.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Telemetry.name, schema: TelemetrySchema },
    ]),
  ],
  controllers: [TelemetryController],
  providers: [],
  exports: [MongooseModule],
})
export class GatewayModule {}

