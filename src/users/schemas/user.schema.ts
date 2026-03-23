import { Prop, Schema, SchemaFactory, raw } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, trim: true })
  fullName: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ trim: true })
  phone?: string;

  @Prop()
  avatar?: string;

  @Prop({ default: 0 })
  status: number; // 0 = unverified, 1 = active

  @Prop(
    raw({
      code: { type: String },
      expiresAt: { type: Date },
    }),
  )
  otp?: Record<string, any>;

  @Prop(
    raw({
      token: { type: String },
      expiresAt: { type: Date },
    }),
  )
  resetToken?: Record<string, any>;

  @Prop()
  deletedAt?: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

// ── Indexes ──────────────────────────────────────────────────
UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ 'resetToken.token': 1 }, { sparse: true });

// ── Exclude password & otp from JSON by default ─────────────
UserSchema.set('toJSON', {
  transform: (_doc: any, ret: any) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    delete ret.password;
    delete ret.otp;
    delete ret.resetToken;
    return ret;
  },
});
