import { Department } from '@domain/department/entity';

export class DepartmentDto {
    readonly departmentNo: string;
    readonly departmentName: string;
    constructor(entity: Department) {
        this.departmentNo = entity.departmentNo;
        this.departmentName = entity.departmentName;
    }
}
