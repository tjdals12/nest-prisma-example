import { Employee } from '@domain/employee/entity';
import { Name } from '@domain/employee/vo';
import { Prisma } from '@prisma/client';

export const employeeExtension = Prisma.defineExtension((prisma) => {
    const _prisma = prisma.$extends({
        result: {
            employees: {
                toEntity: {
                    compute(model) {
                        return () =>
                            new Employee({
                                type: 'restore',
                                employeeNo: model.emp_no,
                                name: new Name({
                                    firstName: model.first_name,
                                    lastName: model.last_name,
                                }),
                                gender: model.gender,
                                birthDate: model.birth_date,
                                hireDate: model.hire_date,
                            });
                    },
                },
            },
        },
        model: {
            employees: {
                createBy: async (entity: Employee) => {
                    const { name, gender, birthDate, hireDate } = entity;
                    const { firstName, lastName } = name;
                    return _prisma.employees.create({
                        data: {
                            first_name: firstName,
                            last_name: lastName,
                            gender,
                            birth_date: birthDate,
                            hire_date: hireDate,
                        },
                    });
                },
                updateBy: async (entity: Employee) => {
                    const { employeeNo, name, gender, birthDate, hireDate } =
                        entity;
                    const { firstName, lastName } = name;
                    return _prisma.employees.update({
                        where: { emp_no: employeeNo },
                        data: {
                            first_name: firstName,
                            last_name: lastName,
                            gender,
                            birth_date: birthDate,
                            hire_date: hireDate,
                        },
                    });
                },
            },
        },
    });
    return _prisma;
});
