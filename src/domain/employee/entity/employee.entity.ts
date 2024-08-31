import * as moment from 'moment';
import { DomainException } from '@domain/__shared__/domain-exception';
import { Name } from '../vo';

export type EmployeeProperty = Pick<
    Employee,
    'employeeNo' | 'name' | 'gender' | 'birthDate' | 'hireDate'
>;

export type EmployeeCreateProperty = { type: 'create' } & Omit<
    EmployeeProperty,
    'employeeNo'
> &
    Pick<Partial<EmployeeProperty>, 'employeeNo'>;

export type EmployeeRestoreProperty = { type: 'restore' } & EmployeeProperty;

export type Gender = 'M' | 'F';

export class Employee {
    private _employeeNo: number;
    get employeeNo() {
        return this._employeeNo;
    }
    set employeeNo(value: number) {
        if (value === undefined || value === null)
            throw new DomainException(
                `Employee: employeeNo is not allow ${value}`,
            );
        this._employeeNo = value;
    }

    private _name: Name;
    get name() {
        return this._name;
    }
    set name(value: Name) {
        if (!value)
            throw new DomainException(`Employee: name is not allow ${value}`);
        this._name = value;
    }

    private _gender: Gender;
    get gender() {
        return this._gender;
    }
    set gender(value: Gender) {
        if (!value)
            throw new DomainException(`Employee: gender is not allow ${value}`);
        this._gender = value;
    }

    private _birthDate: Date;
    get birthDate() {
        return this._birthDate;
    }
    set birthDate(value: Date) {
        if (!value || !moment(value).isBefore('9999-12-31'))
            throw new DomainException(
                `Employee: birthDate is not allow ${value.toISOString()}`,
            );
        this._birthDate = value;
    }

    private _hireDate: Date;
    get hireDate() {
        return this._hireDate;
    }
    set hireDate(value: Date) {
        if (!value || !moment(value).isBefore('9999-12-31'))
            throw new DomainException(
                `Employee: hireDate is not allow ${value.toISOString()}`,
            );
        this._hireDate = value;
    }

    constructor(args: EmployeeCreateProperty | EmployeeRestoreProperty) {
        const { employeeNo, name } = args;
        this.employeeNo = employeeNo;
        this.name = name;
    }
    update(args: Partial<Omit<EmployeeProperty, 'employeeNo'>>): void {
        const { name, gender, birthDate, hireDate } = args;
        if (name) {
            this.name = name;
        }
        if (gender) {
            this.gender = gender;
        }
        if (birthDate) {
            this.birthDate = birthDate;
        }
        if (hireDate) {
            this.hireDate = hireDate;
        }
    }
}
