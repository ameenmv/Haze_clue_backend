import {
    ConflictException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateDeviceDto } from './dto/create-device.dto';
import { UpdateDeviceDto } from './dto/update-device.dto';
import { Device, DeviceDocument } from './schemas/device.schema';

@Injectable()
export class DevicesService {
  constructor(
    @InjectModel(Device.name)
    private readonly deviceModel: Model<DeviceDocument>,
  ) {}

  // ── List user devices (Paginated) ──────────────────────────
  async findAll(
    userId: string,
    page = 1,
    limit = 10,
    search?: string,
  ): Promise<{
    data: DeviceDocument[];
    meta: {
      current_page: number;
      last_page: number;
      per_page: number;
      total: number;
    };
  }> {
    const skip = (page - 1) * limit;
    const filter: any = { user: new Types.ObjectId(userId) };

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { serialNumber: { $regex: search, $options: 'i' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.deviceModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.deviceModel.countDocuments(filter).exec(),
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
  async findOne(userId: string, id: string): Promise<DeviceDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Device not found');
    }

    const device = await this.deviceModel
      .findOne({ _id: id, user: new Types.ObjectId(userId) })
      .exec();

    if (!device) throw new NotFoundException('Device not found');
    return device;
  }

  // ── Create ─────────────────────────────────────────────────
  async create(
    userId: string,
    dto: CreateDeviceDto,
  ): Promise<DeviceDocument> {
    // Check for duplicate serial number per user
    const existing = await this.deviceModel
      .findOne({
        user: new Types.ObjectId(userId),
        serialNumber: dto.serialNumber,
      })
      .exec();

    if (existing) {
      throw new ConflictException(
        'A device with this serial number already exists',
      );
    }

    return this.deviceModel.create({
      ...dto,
      user: new Types.ObjectId(userId),
    });
  }

  // ── Update ─────────────────────────────────────────────────
  async update(
    userId: string,
    id: string,
    dto: UpdateDeviceDto,
  ): Promise<DeviceDocument> {
    const device = await this.findOne(userId, id);
    Object.assign(device, dto);
    return device.save();
  }

  // ── Remove ─────────────────────────────────────────────────
  async remove(userId: string, id: string): Promise<void> {
    const device = await this.findOne(userId, id);
    await device.deleteOne();
  }

  // ── Count (for dashboard) ─────────────────────────────────
  async countByUser(
    userId: string,
    status?: string,
  ): Promise<number> {
    const filter: any = { user: new Types.ObjectId(userId) };
    if (status) filter.status = status;
    return this.deviceModel.countDocuments(filter).exec();
  }

  // ── Scan Network (Simulation) ─────────────────────────────
  async scanNetwork(): Promise<any[]> {
    // Generate a random number of devices (1 to 3)
    const count = Math.floor(Math.random() * 3) + 1;
    const devices = [];
    const models = ['NeuroSky MindWave - EEG', 'OpenBCI Cyton - EEG', 'Emotiv EPOC X - EEG', 'Muse 2 - BCI'];

    for (let i = 0; i < count; i++) {
      const modelName = models[Math.floor(Math.random() * models.length)];
      const randomIp = `192.168.1.${Math.floor(Math.random() * 200) + 10}`;
      const randomSerial = `SN-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      
      devices.push({
        id: Math.random().toString(36).substring(2, 9),
        name: modelName,
        ip: randomIp,
        type: modelName.includes('BCI') ? 'BCI' : 'EEG',
        serialNumber: randomSerial,
        signal: Math.floor(Math.random() * 40) + 60, // 60-100
      });
    }

    return devices;
  }
}
