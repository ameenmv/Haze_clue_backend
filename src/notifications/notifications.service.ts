import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Notification, NotificationDocument } from './schemas/notification.schema';
import { PusherService } from '../pusher/pusher.service';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectModel(Notification.name) private notificationModel: Model<NotificationDocument>,
    private readonly pusherService: PusherService,
  ) {}

  async createNotification(userId: string, title: string, message: string, type: string = 'info', link?: string) {
    const notif = new this.notificationModel({
      user: new Types.ObjectId(userId),
      title,
      message,
      type,
      link,
    });
    const saved = await notif.save();

    // Emit the notification real-time via websockets
    this.pusherService.trigger(`private-user-${userId}`, 'notification', saved);

    return saved;
  }

  async getForUser(userId: string, limit: number = 20) {
    return this.notificationModel
      .find({ user: new Types.ObjectId(userId) })
      .sort({ createdAt: -1 })
      .limit(limit)
      .exec();
  }

  async markAsRead(userId: string, notificationId: string) {
    return this.notificationModel.findOneAndUpdate(
      { _id: new Types.ObjectId(notificationId), user: new Types.ObjectId(userId) },
      { read: true },
      { new: true }
    ).exec();
  }

  async markAllAsRead(userId: string) {
    return this.notificationModel.updateMany(
      { user: new Types.ObjectId(userId), read: false },
      { read: true }
    ).exec();
  }
}
