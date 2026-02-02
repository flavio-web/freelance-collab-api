import { IsNotEmpty, IsString } from 'class-validator';

export class CreateRequestDto {
  @IsString({ message: 'El id del proyecto debe ser de tipo cadena de texto' })
  @IsNotEmpty({ message: 'El id del proyecto es obligatorio' })
  projectId: string;
}
