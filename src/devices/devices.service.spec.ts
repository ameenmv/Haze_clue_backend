import { ConflictException, NotFoundException } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { DevicesService } from './devices.service';
import { Device } from './schemas/device.schema';

// ── Mock device data ──────────────────────────────────
const mockDevice = {
  _id: '507f1f77bcf86cd799439021',
  user: '507f1f77bcf86cd799439012',
  name: 'Muse S',
  type: 'EEG',
  serialNumber: 'MUSE-001',
  status: 'disconnected',
  toJSON: function () {
    return { id: this._id, name: this.name, type: this.type };
  },
  save: jest.fn().mockReturnThis(),
  deleteOne: jest.fn(),
};

// ── Mock model ────────────────────────────────────────
const mockDeviceModel = {
  find: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  countDocuments: jest.fn(),
};

describe('DevicesService', () => {
  let service: DevicesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DevicesService,
        {
          provide: getModelToken(Device.name),
          useValue: mockDeviceModel,
        },
      ],
    }).compile();

    service = module.get<DevicesService>(DevicesService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ── findAll ─────────────────────────────────────────
  describe('findAll', () => {
    it('should return all user devices', async () => {
      const devices = [mockDevice];
      const chainable = {
        sort: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(devices),
      };
      mockDeviceModel.find.mockReturnValue(chainable);

      const result = await service.findAll('507f1f77bcf86cd799439012');
      expect(result).toEqual(devices);
    });
  });

  // ── findOne ─────────────────────────────────────────
  describe('findOne', () => {
    it('should throw NotFoundException for invalid ObjectId', async () => {
      await expect(
        service.findOne('507f1f77bcf86cd799439012', 'invalid-id'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when device not found', async () => {
      mockDeviceModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(
        service.findOne(
          '507f1f77bcf86cd799439012',
          '507f1f77bcf86cd799439021',
        ),
      ).rejects.toThrow(NotFoundException);
    });

    it('should return device when found', async () => {
      mockDeviceModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockDevice),
      });

      const result = await service.findOne(
        '507f1f77bcf86cd799439012',
        '507f1f77bcf86cd799439021',
      );
      expect(result).toEqual(mockDevice);
    });
  });

  // ── create ──────────────────────────────────────────
  describe('create', () => {
    it('should create and return a device', async () => {
      mockDeviceModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null), // no duplicate
      });
      mockDeviceModel.create.mockResolvedValue(mockDevice);

      const result = await service.create('507f1f77bcf86cd799439012', {
        name: 'Muse S',
        type: 'EEG',
        serialNumber: 'MUSE-001',
      });

      expect(result).toEqual(mockDevice);
    });

    it('should throw ConflictException for duplicate serial number', async () => {
      mockDeviceModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockDevice), // existing device
      });

      await expect(
        service.create('507f1f77bcf86cd799439012', {
          name: 'Muse S',
          type: 'EEG',
          serialNumber: 'MUSE-001',
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  // ── remove ──────────────────────────────────────────
  describe('remove', () => {
    it('should delete a device', async () => {
      mockDeviceModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockDevice),
      });

      await service.remove(
        '507f1f77bcf86cd799439012',
        '507f1f77bcf86cd799439021',
      );

      expect(mockDevice.deleteOne).toHaveBeenCalled();
    });
  });

  // ── countByUser ─────────────────────────────────────
  describe('countByUser', () => {
    it('should return count', async () => {
      mockDeviceModel.countDocuments.mockReturnValue({
        exec: jest.fn().mockResolvedValue(3),
      });

      const result = await service.countByUser('507f1f77bcf86cd799439012');
      expect(result).toBe(3);
    });

    it('should filter by status', async () => {
      mockDeviceModel.countDocuments.mockReturnValue({
        exec: jest.fn().mockResolvedValue(1),
      });

      const result = await service.countByUser(
        '507f1f77bcf86cd799439012',
        'connected',
      );
      expect(result).toBe(1);
      expect(mockDeviceModel.countDocuments).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'connected' }),
      );
    });
  });
});
