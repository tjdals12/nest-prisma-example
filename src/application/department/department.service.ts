import {
    BadRequestException,
    Injectable,
    InternalServerErrorException,
    NotFoundException,
} from '@nestjs/common';
import { CreateDepartmentDto, UpdateDepartmentDto } from './dto/request.dto';
import { DepartmentDto } from './dto/repsonse.dto';
import { PrismaService } from '@infrastructure/prisma/prisma.service';
import { Department } from '@domain/department/entity';
import { DomainException } from '@domain/__shared__/domain-exception';
import { PaginationDto } from '@core/dto/request.dto';
import { PaginatedDto } from '@core/dto/response.dto';

@Injectable()
export class DepartmentService {
    constructor(private prismaService: PrismaService) {}

    async create(dto: CreateDepartmentDto): Promise<DepartmentDto> {
        try {
            const { departmentNo, departmentName } = dto;
            let department = new Department({
                departmentNo,
                departmentName,
            });
            const model =
                await this.prismaService.departments.createBy(department);
            department = model.toEntity();
            return new DepartmentDto(department);
        } catch (e) {
            if (e instanceof DomainException)
                throw new BadRequestException(e.message);
            throw new InternalServerErrorException(e.message);
        }
    }

    async update(
        departmentNo: string,
        dto: UpdateDepartmentDto,
    ): Promise<DepartmentDto> {
        const model = await this.prismaService.departments.findUnique({
            where: { dept_no: departmentNo },
        });
        if (model === null)
            throw new NotFoundException(
                `Department: not found ${departmentNo}`,
            );
        try {
            const { departmentName } = dto;
            const department = model.toEntity();
            department.update({
                departmentName,
            });
            await this.prismaService.departments.updateBy(department);
            return department;
        } catch (e) {
            if (e instanceof DomainException)
                throw new BadRequestException(e.message);
            throw new InternalServerErrorException(e.message);
        }
    }

    async findOne(departmentNo: string): Promise<DepartmentDto> {
        const model = await this.prismaService.departments.findUnique({
            where: { dept_no: departmentNo },
        });
        if (model === null)
            throw new NotFoundException(
                `Department: not found ${departmentNo}`,
            );
        const department = model.toEntity();
        return new DepartmentDto(department);
    }

    async findMany(dto: PaginationDto): Promise<PaginatedDto<DepartmentDto>> {
        const { page, limit } = dto;
        const count = await this.prismaService.departments.count();
        const models = await this.prismaService.departments.findMany({
            skip: (page - 1) * limit,
            take: limit,
        });
        const departments = models.map((model) => model.toEntity());
        return new PaginatedDto({
            currentPage: page,
            totalPage: Math.ceil(count / limit),
            currentCount: departments.length,
            totalCount: count,
            list: departments.map(
                (department) => new DepartmentDto(department),
            ),
        });
    }
}
