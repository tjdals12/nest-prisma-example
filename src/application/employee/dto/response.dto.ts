import { Employee } from '@domain/employee/entity';

export class EmployeeDto {
    readonly employeeNo: number;
    readonly firstName: string;
    readonly lastName: string;
    readonly birthDate: Date;
    readonly hireDate: Date;
    constructor(entity: Employee) {
        this.employeeNo = entity.employeeNo;
        const name = entity.name;
        this.firstName = name.firstName;
        this.lastName = name.lastName;
        this.birthDate = entity.birthDate;
        this.hireDate = entity.hireDate;
    }
}
