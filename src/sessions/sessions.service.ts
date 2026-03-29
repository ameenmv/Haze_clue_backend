import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateSessionDto } from './dto/create-session.dto';
import { UpdateSessionDto } from './dto/update-session.dto';
import { Session, SessionDocument } from './schemas/session.schema';

@Injectable()
export class SessionsService {
  constructor(
    @InjectModel(Session.name)
    private readonly sessionModel: Model<SessionDocument>,
  ) {}

  // ── List (paginated) ───────────────────────────────────────
  async findAll(
    userId: string,
    page = 1,
    limit = 10,
  ): Promise<{
    data: SessionDocument[];
    meta: {
      current_page: number;
      last_page: number;
      per_page: number;
      total: number;
    };
  }> {
    const skip = (page - 1) * limit;
    const filter = { user: new Types.ObjectId(userId) };

    const [data, total] = await Promise.all([
      this.sessionModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.sessionModel.countDocuments(filter).exec(),
    ]);

    return {
      data,
      meta: {
        current_page: page,
        last_page: Math.ceil(total / limit) || 1,
        per_page: limit,
        total,
      },
    };
  }

  // ── Find one ───────────────────────────────────────────────
  async findOne(userId: string, id: string): Promise<SessionDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Session not found');
    }

    const session = await this.sessionModel
      .findOne({ _id: id, user: new Types.ObjectId(userId) })
      .exec();

    if (!session) throw new NotFoundException('Session not found');
    return session;
  }

  // ── Create ─────────────────────────────────────────────────
  async create(
    userId: string,
    dto: CreateSessionDto,
  ): Promise<SessionDocument> {
    return this.sessionModel.create({
      ...dto,
      user: new Types.ObjectId(userId),
    });
  }

  // ── Update ─────────────────────────────────────────────────
  async update(
    userId: string,
    id: string,
    dto: UpdateSessionDto,
  ): Promise<SessionDocument> {
    const session = await this.findOne(userId, id);

    Object.assign(session, dto);
    return session.save();
  }

  // ── Remove ─────────────────────────────────────────────────
  async remove(userId: string, id: string): Promise<void> {
    const session = await this.findOne(userId, id);
    await session.deleteOne();
  }

  // ── Start session ──────────────────────────────────────────
  async start(userId: string, id: string): Promise<SessionDocument> {
    const session = await this.findOne(userId, id);

    if (session.status === 'active') {
      throw new BadRequestException('Session is already active');
    }
    if (session.status === 'completed') {
      throw new BadRequestException('Session is already completed');
    }

    session.status = 'active';
    session.startedAt = new Date();
    return session.save();
  }

  // ── End session ────────────────────────────────────────────
  async end(userId: string, id: string): Promise<SessionDocument> {
    const session = await this.findOne(userId, id);

    if (session.status !== 'active') {
      throw new BadRequestException('Session is not active');
    }

    session.status = 'completed';
    session.endedAt = new Date();
    return session.save();
  }

  // ── Count (for dashboard) ─────────────────────────────────
  async countByUser(
    userId: string,
    status?: string,
  ): Promise<number> {
    const filter: any = { user: new Types.ObjectId(userId) };
    if (status) filter.status = status;
    return this.sessionModel.countDocuments(filter).exec();
  }
}
