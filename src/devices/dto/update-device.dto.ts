import { PartialType } from '@nestjs/mapped-types';
import { IsIn, IsOptional, IsString } from 'class-validator';
import { CreateDeviceDto } from './create-device.dto';

export class UpdateDeviceDto extends PartialType(CreateDeviceDto) {
  @IsString()
  @IsIn(['connected', 'disconnected', 'error'])
  @IsOptional()
  status?: string;
}
