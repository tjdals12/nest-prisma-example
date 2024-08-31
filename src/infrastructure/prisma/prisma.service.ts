import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { departmentExtension } from './extensions/department.extensions';
import { employeeExtension } from './extensions/employee.extensions';

const getExtendedPrismaClient = () => {
    const prisma = new PrismaClient()
        .$extends(departmentExtension)
        .$extends(employeeExtension);
    return prisma;
};

const ExtendedPrismaClient = class {
    constructor() {
        return getExtendedPrismaClient();
    }
} as new () => ReturnType<typeof getExtendedPrismaClient>;

@Injectable()
export class PrismaService
    extends ExtendedPrismaClient
    implements OnModuleInit
{
    onModuleInit() {
        this.$connect();
    }
}
