import {
    Body,
    Controller,
    Get,
    HttpStatus,
    Param,
    Patch,
    Post,
    Query,
} from '@nestjs/common';
import { DepartmentDto } from './dto/repsonse.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import {
    ApiBadRequestResponse,
    ApiInternalServerErrorResponse,
    ApiPaginatedResponse,
    ApiResponse,
} from '@core/decorators/api.decorator';
import { DepartmentService } from './department.service';
import { PaginationDto } from '@core/dto/request.dto';
import { PaginatedDto } from '@core/dto/response.dto';

@ApiTags('department')
@Controller({
    path: 'departments',
    version: '1',
})
export class DepartmentController {
    constructor(private departmentService: DepartmentService) {}

    @Post()
    @ApiOperation({ summary: '부서 추가', description: '부서 추가' })
    @ApiResponse({ status: HttpStatus.CREATED, type: DepartmentDto })
    @ApiBadRequestResponse()
    @ApiInternalServerErrorResponse()
    async create(@Body() dto): Promise<DepartmentDto> {
        return this.departmentService.create(dto);
    }

    @Patch('/:departmentNo')
    @ApiOperation({ summary: '부서 수정', description: '부서 수정' })
    @ApiResponse({ status: HttpStatus.OK, type: DepartmentDto })
    @ApiBadRequestResponse()
    @ApiInternalServerErrorResponse()
    async update(
        @Param('departmentId') departmentNo: string,
        @Body() dto,
    ): Promise<DepartmentDto> {
        return this.departmentService.update(departmentNo, dto);
    }

    @Get('/:departmentNo')
    @ApiOperation({ summary: '부서 조회', description: '부서 조회' })
    @ApiResponse({ status: HttpStatus.OK, type: DepartmentDto })
    @ApiBadRequestResponse()
    @ApiInternalServerErrorResponse()
    async findOne(
        @Param('departmentNo') departmentNo: string,
    ): Promise<DepartmentDto> {
        return this.departmentService.findOne(departmentNo);
    }

    @Get()
    @ApiOperation({ summary: '부서 목록 조회', description: '부서 목록 조회' })
    @ApiPaginatedResponse({ status: HttpStatus.OK, type: DepartmentDto })
    @ApiBadRequestResponse()
    @ApiInternalServerErrorResponse()
    async findMany(
        @Query() dto: PaginationDto,
    ): Promise<PaginatedDto<DepartmentDto>> {
        return this.departmentService.findMany(dto);
    }
}
