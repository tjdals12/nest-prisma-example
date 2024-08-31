import { PartialType } from '@nestjs/swagger';
import {
    IsDate,
    IsIn,
    IsNotEmpty,
    IsString,
    MaxLength,
    MinLength,
} from 'class-validator';

export class CreateEmployeeDto {
    @IsString()
    @IsNotEmpty()
    @MinLength(1)
    @MaxLength(50)
    firstName: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(1)
    @MaxLength(50)
    lastName: string;

    @IsIn(['M', 'F'])
    gender: 'M' | 'F';

    @IsDate()
    birthDate: Date;

    @IsDate()
    hireDate: Date;
}

export class UpdateEmployeeDto extends PartialType(CreateEmployeeDto) {}
