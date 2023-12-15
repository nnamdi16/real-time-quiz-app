import { RegisterUserDto } from 'src/api/user/user.dto';

export const registerPayload = (): RegisterUserDto => {
  return {
    email: 'jane@example.com',
    password: 'haJhsjk@#4jaiijsk',
    username: 'John#1234',
  };
};
export const userData = (): any => {
  return {
    email: 'jane@example.com',
    password: '$2b$10$1is2GJ2qPDxtD4trQTnZ2eFwhs47Jg27OWVHkOZIesKmO8PO41hXS',
    username: 'John#1234',
    createdBy: null,
    updatedBy: null,
    id: '3100fccc-c3ff-49eb-8f46-fdb6deca3c72',
    createdDate: '2023-12-15T07:16:44.279Z',
    updatedDate: '2023-12-15T07:16:44.279Z',
  };
};
