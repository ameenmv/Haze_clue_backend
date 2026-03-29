import { Type } from 'class-transformer';
import {
    IsBoolean,
    IsInt,
    IsNotEmpty,
    IsOptional,
    IsString,
    Min,
    ValidateNested,
} from 'class-validator';

class MonitoringSettingsDto {
  @IsBoolean()
  @IsOptional()
  attentionTracking?: boolean;

  @IsBoolean()
  @IsOptional()
  alerts?: boolean;

  @IsBoolean()
  @IsOptional()
  recording?: boolean;
}

export class CreateSessionDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  className?: string;

  @IsString()
  @IsOptional()
  subject?: string;

  @IsInt()
  @Min(0)
  @IsOptional()
  duration?: number;

  @IsInt()
  @Min(0)
  @IsOptional()
  students?: number;

  @IsString()
  @IsOptional()
  notes?: string;

  @ValidateNested()
  @Type(() => MonitoringSettingsDto)
  @IsOptional()
  monitoringSettings?: MonitoringSettingsDto;
}
