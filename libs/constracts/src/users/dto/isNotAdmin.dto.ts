import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';

export function IsNotAdmin(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isNotAdmin',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        validate(value: any, args: ValidationArguments) {
          // Chặn giá trị "Admin" (case-insensitive)
          if (typeof value === 'string') {
            return value.toLowerCase() !== 'admin';
          }
          return true; // nếu không phải string, bỏ qua
        },
        defaultMessage(args: ValidationArguments) {
          return `"${args.property}" không thể là "Admin"`;
        },
      },
    });
  };
}
