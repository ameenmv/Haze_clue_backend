import { Prop, Schema, SchemaFactory, raw } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Session } from '../../sessions/schemas/session.schema';
import { User } from '../../users/schemas/user.schema';

export type ReportDocument = HydratedDocument<Report>;

@Schema({ timestamps: true })
export class Report {
  @Prop({ type: Types.ObjectId, ref: User.name, required: true, index: true })
  user: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    ref: Session.name,
    required: true,
    index: true,
  })
  session: Types.ObjectId;

  @Prop({ required: true, trim: true })
  title: string;

  @Prop(
    raw({
      avgAttention: { type: Number, default: 0 },
      peakAttention: { type: Number, default: 0 },
      timeline: {
        type: [
          {
            timestamp: { type: Date },
            value: { type: Number },
          },
        ],
        default: [],
      },
      distribution: {
        type: {
          high: { type: Number, default: 0 },
          medium: { type: Number, default: 0 },
          low: { type: Number, default: 0 },
        },
        default: { high: 0, medium: 0, low: 0 },
      },
    }),
  )
  data: Record<string, any>;

  @Prop({ default: () => new Date() })
  generatedAt: Date;
}

export const ReportSchema = SchemaFactory.createForClass(Report);

// ── Indexes ──────────────────────────────────────────────────
ReportSchema.index({ user: 1, generatedAt: -1 });
ReportSchema.index({ session: 1 });

// ── JSON transform ──────────────────────────────────────────
ReportSchema.set('toJSON', {
  transform: (_doc: any, ret: any) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});
