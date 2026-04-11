import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { SessionsService } from '../sessions/sessions.service';
import { CreateReportDto } from './dto/create-report.dto';
import { Report, ReportDocument } from './schemas/report.schema';

@Injectable()
export class ReportsService {
  constructor(
    @InjectModel(Report.name)
    private readonly reportModel: Model<ReportDocument>,
    private readonly sessionsService: SessionsService,
  ) {}

  async findAll(userId: string, page = 1, limit = 10, sessionId?: string) {
    const skip = (page - 1) * limit;
    const filter: any = { user: new Types.ObjectId(userId) };
    if (sessionId) {
      filter.session = new Types.ObjectId(sessionId);
    }

    const [data, total] = await Promise.all([
      this.reportModel
        .find(filter)
        .populate('session', 'name')
        .sort({ generatedAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.reportModel.countDocuments(filter).exec(),
    ]);

    return { data, total, page, limit };
  }

  async findOne(userId: string, id: string) {
    if (!Types.ObjectId.isValid(id)) throw new NotFoundException('Report not found');
    const report = await this.reportModel
      .findOne({ _id: id, user: new Types.ObjectId(userId) })
      .populate('session', 'name')
      .exec();
    if (!report) throw new NotFoundException('Report not found');
    return report;
  }

  async generate(userId: string, dto: CreateReportDto) {
    const session = await this.sessionsService.findOne(userId, dto.sessionId);
    
    // Create dummy data
    const report = await this.reportModel.create({
      user: new Types.ObjectId(userId),
      session: new Types.ObjectId(dto.sessionId),
      title: `${session.name || 'Session'} - ${dto.type === 'attention_analysis' ? 'Attention Analysis' : 'Session Summary'}`,
      data: {
        avgAttention: Math.floor(Math.random() * 20) + 70,
        peakAttention: Math.floor(Math.random() * 10) + 90,
        timeline: [
          { minute: 0, avgAttention: 72 },
          { minute: 1, avgAttention: 75 },
        ],
        distribution: {
          high: 60,
          medium: 25,
          low: 15,
        }
      }
    });
    
    return this.findOne(userId, report._id.toString());
  }
}
