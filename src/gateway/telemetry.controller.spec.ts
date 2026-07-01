import { Test, TestingModule } from '@nestjs/testing';
import { TelemetryController } from './telemetry.controller';
import { PusherService } from '../pusher/pusher.service';
import { getModelToken } from '@nestjs/mongoose';
import { Telemetry } from './schemas/telemetry.schema';

describe('TelemetryController', () => {
  let controller: TelemetryController;
  let pusherService: PusherService;
  let telemetryModel: any;

  beforeEach(async () => {
    telemetryModel = {
      create: jest.fn().mockImplementation((dto) => Promise.resolve({ id: 'some-id', ...dto, recordedAt: new Date() })),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [TelemetryController],
      providers: [
        {
          provide: PusherService,
          useValue: {
            trigger: jest.fn(),
          },
        },
        {
          provide: getModelToken(Telemetry.name),
          useValue: telemetryModel,
        },
      ],
    }).compile();

    controller = module.get<TelemetryController>(TelemetryController);
    pusherService = module.get<PusherService>(PusherService);
    
    // Mock global fetch to avoid actual HTTP requests during testing
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ smoothed_output: 0.85 }),
      } as Response)
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should save telemetry data and broadcast via Pusher (Standard)', async () => {
    const payload = { deviceId: 'test-device', attention: 60 };
    
    const result = await controller.receiveTelemetryData(payload);
    
    expect(result.success).toBe(true);
    expect(telemetryModel.create).toHaveBeenCalledWith(expect.objectContaining({
      deviceId: 'test-device',
      attention: 60,
    }));
    expect(pusherService.trigger).toHaveBeenCalledWith('device_test-device', 'device:data', expect.any(Object));
  });

  it('should forward rawEegWindow to AI API and use new attention score', async () => {
    const dummyWindow = Array(14).fill(Array(512).fill(0.1));
    const payload = { deviceId: 'test-device', attention: 0, rawEegWindow: dummyWindow };
    
    const result = await controller.receiveTelemetryData(payload);
    
    expect(global.fetch).toHaveBeenCalled();
    // It should have overwritten attention with Math.round(0.85 * 100) = 85
    expect(telemetryModel.create).toHaveBeenCalledWith(expect.objectContaining({
      deviceId: 'test-device',
      attention: 85,
    }));
    expect(result.success).toBe(true);
  });
});
