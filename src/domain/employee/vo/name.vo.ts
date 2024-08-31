export type NameProperty = Pick<Name, 'firstName' | 'lastName'>;

export class Name {
    readonly firstName: string;
    readonly lastName: string;
    constructor(args: NameProperty) {
        const { firstName, lastName } = args;
        this.firstName = firstName;
        this.lastName = lastName;
    }
    equals(name: Name): boolean {
        return (
            this.firstName === name.firstName && this.lastName === name.lastName
        );
    }
}
