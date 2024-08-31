import { PrismaService } from '@infrastructure/prisma/prisma.service';
import {
    BadRequestException,
    Injectable,
    InternalServerErrorException,
    NotFoundException,
} from '@nestjs/common';
import { CreateEmployeeDto, UpdateEmployeeDto } from './dto/request.dto';
import { EmployeeDto } from './dto/response.dto';
import { Employee } from '@domain/employee/entity';
import { Name } from '@domain/employee/vo';
import { DomainException } from '@domain/__shared__/domain-exception';
import { PaginationDto } from '@core/dto/request.dto';
import { PaginatedDto } from '@core/dto/response.dto';

@Injectable()
export class EmployeeService {
    constructor(private prismaService: PrismaService) {}

    async create(dto: CreateEmployeeDto): Promise<EmployeeDto> {
        try {
            const { firstName, lastName, gender, birthDate, hireDate } = dto;
            const name = new Name({ firstName, lastName });
            let employee = new Employee({
                type: 'create',
                name,
                gender,
                birthDate,
                hireDate,
            });
            employee = (
                await this.prismaService.employees.createBy(employee)
            ).toEntity();
            return new EmployeeDto(employee);
        } catch (e) {
            if (e instanceof DomainException)
                throw new BadRequestException(e.message);
            throw new InternalServerErrorException(e.message);
        }
    }

    async update(
        employeeNo: number,
        dto: UpdateEmployeeDto,
    ): Promise<EmployeeDto> {
        const model = await this.prismaService.employees.findUnique({
            where: { emp_no: employeeNo },
        });
        if (model === null)
            throw new NotFoundException(`Employee: not found ${employeeNo}`);
        try {
            const { firstName, lastName, gender, birthDate, hireDate } = dto;
            const employee = model.toEntity();
            const updateArgs: Parameters<typeof employee.update>[0] = {
                gender,
                birthDate,
                hireDate,
            };
            if (firstName || lastName) {
                const currentName = employee.name;
                updateArgs.name = new Name({
                    firstName: firstName ?? currentName.firstName,
                    lastName: lastName ?? currentName.lastName,
                });
            }
            employee.update(updateArgs);
            await this.prismaService.employees.updateBy(employee);
            return new EmployeeDto(employee);
        } catch (e) {
            if (e instanceof DomainException)
                throw new BadRequestException(e.message);
            throw new InternalServerErrorException(e.message);
        }
    }

    async findOne(employeeNo: number): Promise<EmployeeDto> {
        const model = await this.prismaService.employees.findUnique({
            where: { emp_no: employeeNo },
        });
        if (model === null)
            throw new NotFoundException(`Employee: not found ${employeeNo}`);
        const employee = model.toEntity();
        return new EmployeeDto(employee);
    }

    async findMany(dto: PaginationDto): Promise<PaginatedDto<EmployeeDto>> {
        const { page, limit } = dto;
        const count = await this.prismaService.employees.count();
        const models = await this.prismaService.employees.findMany({
            skip: (page - 1) * limit,
            take: limit,
        });
        const employees = models.map((model) => model.toEntity());
        return new PaginatedDto({
            currentPage: page,
            totalPage: Math.ceil(count / limit),
            currentCount: employees.length,
            totalCount: count,
            list: employees.map((employee) => new EmployeeDto(employee)),
        });
    }
}
