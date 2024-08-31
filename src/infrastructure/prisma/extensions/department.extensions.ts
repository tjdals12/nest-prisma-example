import { Prisma } from '@prisma/client';
import { Department } from '@domain/department/entity';

export const departmentExtension = Prisma.defineExtension((prisma) => {
    const _prisma = prisma
        .$extends({
            result: {
                departments: {
                    toEntity: {
                        compute(model) {
                            return () =>
                                new Department({
                                    departmentNo: model.dept_no,
                                    departmentName: model.dept_name,
                                });
                        },
                    },
                },
            },
        })
        .$extends({
            model: {
                departments: {
                    createBy: async (entity: Department) => {
                        return _prisma.departments.create({
                            data: {
                                dept_no: entity.departmentNo,
                                dept_name: entity.departmentName,
                            },
                        });
                    },
                    updateBy: async (entity: Department) => {
                        return _prisma.departments.update({
                            where: { dept_no: entity.departmentNo },
                            data: {
                                dept_name: entity.departmentName,
                            },
                        });
                    },
                },
            },
        });
    return _prisma;
});
