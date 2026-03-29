import {
    IsIn,
    IsNotEmpty,
    IsString,
} from 'class-validator';

export class CreateDeviceDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsIn(['EEG', 'BCI'])
  type: string;

  @IsString()
  @IsNotEmpty()
  serialNumber: string;
}
