import { Test, TestingModule } from '@nestjs/testing';
import { DevicesService } from '../devices/devices.service';
import { SessionsService } from '../sessions/sessions.service';
import { DashboardService } from './dashboard.service';

describe('DashboardService', () => {
  let service: DashboardService;
  let sessionsService: Partial<SessionsService>;
  let devicesService: Partial<DevicesService>;

  beforeEach(async () => {
    sessionsService = {
      countByUser: jest.fn(),
    };

    devicesService = {
      countByUser: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DashboardService,
        { provide: SessionsService, useValue: sessionsService },
        { provide: DevicesService, useValue: devicesService },
      ],
    }).compile();

    service = module.get<DashboardService>(DashboardService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getStats', () => {
    it('should return aggregated stats', async () => {
      (sessionsService.countByUser as jest.Mock)
        .mockResolvedValueOnce(10) // total sessions
        .mockResolvedValueOnce(2); // active sessions
      (devicesService.countByUser as jest.Mock).mockResolvedValue(3); // connected devices

      const result = await service.getStats('507f1f77bcf86cd799439012');

      expect(result).toEqual({
        connectedDevices: 3,
        totalSessions: 10,
        activeSessions: 2,
        avgAttention: null,
        reportsGenerated: 0,
      });
    });

    it('should return zeros when empty', async () => {
      (sessionsService.countByUser as jest.Mock).mockResolvedValue(0);
      (devicesService.countByUser as jest.Mock).mockResolvedValue(0);

      const result = await service.getStats('507f1f77bcf86cd799439012');

      expect(result.connectedDevices).toBe(0);
      expect(result.totalSessions).toBe(0);
      expect(result.activeSessions).toBe(0);
    });

    it('should call services with correct userId', async () => {
      (sessionsService.countByUser as jest.Mock).mockResolvedValue(0);
      (devicesService.countByUser as jest.Mock).mockResolvedValue(0);

      await service.getStats('user-123');

      expect(sessionsService.countByUser).toHaveBeenCalledWith('user-123');
      expect(sessionsService.countByUser).toHaveBeenCalledWith(
        'user-123',
        'active',
      );
      expect(devicesService.countByUser).toHaveBeenCalledWith(
        'user-123',
        'connected',
      );
    });
  });
});
