import { Type } from 'class-transformer';
import { IsNumber, Max, Min } from 'class-validator';

export class PaginationDto {
    @IsNumber()
    @Min(1)
    @Type(() => Number)
    page: number;

    @IsNumber()
    @Min(1)
    @Max(100)
    @Type(() => Number)
    limit: number;
}
