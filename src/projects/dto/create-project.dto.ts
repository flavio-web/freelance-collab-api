import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { ProjectCategory, ProjectStatus } from '../enums/project.enums';

export class CreateProjectDto {
  @IsString({ message: 'El titulo debe ser de tipo cadena de texto' })
  @IsNotEmpty({ message: 'El titulo es obligatorio' })
  @MinLength(5, { message: 'El titulo debe tener al menos 5 caracteres' })
  @MaxLength(100, { message: 'El titulo debe tener máximo 100 caracteres' })
  titulo: string;

  @IsString({ message: 'La descripcion debe ser de tipo cadena de texto' })
  @IsNotEmpty({ message: 'La descripción es obligatorio' })
  @MinLength(10, { message: 'La descripción debe tener al menos 10 caracteres' })
  @MaxLength(500, { message: 'La descripción debe tener máximo 500 caracteres' })
  descripcion: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  requerimientos: string[];

  @IsNotEmpty({ message: 'El número máximo de colaboradores es obligatorio' })
  @IsNumber()
  @Min(1)
  maxColaboradores: number;

  @IsNotEmpty({ message: 'El estado es obligatorio' })
  @IsEnum(ProjectStatus)
  estado: ProjectStatus;

  @IsNotEmpty({ message: 'La categoría es obligatoria' })
  @IsEnum(ProjectCategory)
  categoria: ProjectCategory;
}
