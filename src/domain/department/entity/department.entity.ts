import { DomainException } from 'src/domain/__shared__/domain-exception';

export type DepartmentProperty = Pick<
    Department,
    'departmentNo' | 'departmentName'
>;

export class Department {
    private _departmentNo: string;
    get departmentNo() {
        return this._departmentNo;
    }
    set departmentNo(value) {
        const regex = /^(?=.*[a-z])[a-z0-9]{4,4}$/;
        if (
            value === null ||
            value === undefined ||
            regex.test(value) === false
        )
            throw new DomainException(
                `Department: departmentNo is not allow ${value}`,
            );
        this._departmentNo = value;
    }
    private _departmentName: string;
    get departmentName() {
        return this._departmentName;
    }
    set departmentName(value) {
        const regex = /^(?=.*[a-zA-Z0-9가-힣\-\s])[a-zA-Z0-9가-힣\-\s]{2,50}$/;
        if (
            value === null ||
            value === undefined ||
            regex.test(value) === false
        )
            throw new DomainException(
                `Department: departmentName is not allow ${value}`,
            );
        this._departmentName = value;
    }
    constructor(args: DepartmentProperty) {
        const { departmentNo, departmentName } = args;
        this._departmentNo = departmentNo;
        this._departmentName = departmentName;
    }
    update(args: Partial<Omit<DepartmentProperty, 'departmentNo'>>): void {
        const { departmentName } = args;
        if (departmentName) {
            this.departmentName = departmentName;
        }
    }
}
