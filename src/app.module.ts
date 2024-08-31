import { Module } from '@nestjs/common';
import { PrismaModule } from '@infrastructure/prisma/prisma.module';
import { DepartmentModule } from '@application/department/department.module';
import { EmployeeModule } from '@application/employee/employee.module';

@Module({
    imports: [PrismaModule, DepartmentModule, EmployeeModule],
})
export class AppModule {}
