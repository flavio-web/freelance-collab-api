import { IsEmail, IsNotEmpty, IsString, MinLength, IsArray, IsOptional } from 'class-validator';

export class RegisterDto {
  @IsEmail({}, { message: 'El correo electrónico no es válido' })
  email: string;

  @MinLength(6, {
    message: 'La contraseña debe tener al menos 6 caracteres',
  })
  password: string;

  @IsString({ message: 'El nombre debe ser texto' })
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  nombre: string;

  @IsString({ message: 'El apellido debe ser texto' })
  @IsNotEmpty({ message: 'El apellido es obligatorio' })
  apellido: string;

  @IsOptional()
  @IsString({ message: 'El teléfono debe ser texto' })
  telefono?: string;

  @IsOptional()
  @IsArray({ message: 'Los títulos deben ser una lista de textos' })
  titulos?: string[];

  @IsOptional()
  @IsArray({ message: 'Las tecnologías deben ser una lista de textos' })
  tecnologias?: string[];
}
