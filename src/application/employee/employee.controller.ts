import {
    Controller,
    Get,
    HttpStatus,
    Param,
    Patch,
    Post,
    Query,
} from '@nestjs/common';
import { CreateEmployeeDto, UpdateEmployeeDto } from './dto/request.dto';
import { EmployeeDto } from './dto/response.dto';
import {
    ApiBadRequestResponse,
    ApiInternalServerErrorResponse,
    ApiPaginatedResponse,
    ApiResponse,
} from '@core/decorators/api.decorator';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { EmployeeService } from './employee.service';
import { PaginationDto } from '@core/dto/request.dto';
import { PaginatedDto } from '@core/dto/response.dto';

@ApiTags('employee')
@Controller({
    path: 'employees',
    version: '1',
})
export class EmployeeController {
    constructor(private employeeService: EmployeeService) {}

    @Post()
    @ApiOperation({ summary: '사원 추가', description: '사원 추가' })
    @ApiResponse({ status: HttpStatus.CREATED, type: EmployeeDto })
    @ApiBadRequestResponse()
    @ApiInternalServerErrorResponse()
    async create(dto: CreateEmployeeDto): Promise<EmployeeDto> {
        return this.employeeService.create(dto);
    }

    @Patch('/:employeeNo')
    @ApiOperation({ summary: '사원 수정', description: '사원 수정' })
    @ApiResponse({ status: HttpStatus.OK, type: EmployeeDto })
    @ApiBadRequestResponse()
    @ApiInternalServerErrorResponse()
    async update(
        employeeNo: number,
        dto: UpdateEmployeeDto,
    ): Promise<EmployeeDto> {
        return this.employeeService.update(employeeNo, dto);
    }

    @Get('/:employeeNo')
    @ApiOperation({ summary: '사원 조회', description: '사원 조회' })
    @ApiResponse({ status: HttpStatus.OK, type: EmployeeDto })
    @ApiBadRequestResponse()
    @ApiInternalServerErrorResponse()
    async findOne(
        @Param('employeeNo') employeeNo: number,
    ): Promise<EmployeeDto> {
        return this.employeeService.findOne(employeeNo);
    }

    @Get()
    @ApiOperation({ summary: '사원 목록 조회', description: '사원 목록 조회' })
    @ApiPaginatedResponse({ status: HttpStatus.OK, type: EmployeeDto })
    @ApiBadRequestResponse()
    @ApiInternalServerErrorResponse()
    async findMany(
        @Query() dto: PaginationDto,
    ): Promise<PaginatedDto<EmployeeDto>> {
        return this.employeeService.findMany(dto);
    }
}
