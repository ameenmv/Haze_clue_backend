import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { User } from '../../users/schemas/user.schema';

export type DeviceDocument = HydratedDocument<Device>;

@Schema({ timestamps: true })
export class Device {
  @Prop({ type: Types.ObjectId, ref: User.name, required: true, index: true })
  user: Types.ObjectId;

  @Prop({ required: true, trim: true })
  name: string;

  @Prop({
    type: String,
    enum: ['EEG', 'BCI'],
    required: true,
  })
  type: string;

  @Prop({ required: true, trim: true })
  serialNumber: string;

  @Prop({
    type: String,
    enum: ['connected', 'disconnected', 'error'],
    default: 'disconnected',
  })
  status: string;

  @Prop()
  lastSeen?: Date;
}

export const DeviceSchema = SchemaFactory.createForClass(Device);

// ── Indexes ──────────────────────────────────────────────────
DeviceSchema.index({ user: 1, serialNumber: 1 }, { unique: true });
DeviceSchema.index({ user: 1, status: 1 });

// ── JSON transform ──────────────────────────────────────────
DeviceSchema.set('toJSON', {
  transform: (_doc: any, ret: any) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});
