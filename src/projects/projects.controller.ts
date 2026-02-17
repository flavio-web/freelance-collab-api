/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { Body, Controller, Delete, Get, Param, Post, Put, Req, UseGuards } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { FirebaseAuthGuard } from 'src/auth/firebase-auth.guard';

@Controller('projects')
@UseGuards(FirebaseAuthGuard)
export class ProjectsController {
  constructor(private service: ProjectsService) {}

  @Post()
  async create(@Req() req, @Body() dto: CreateProjectDto) {
    return {
      status: true,
      message: 'Proyecto creado',
      data: await this.service.create(dto, req.user.uid),
    };
  }

  @Get()
  async findAllByCategory(@Req() req) {
    return {
      status: true,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      data: await this.service.findAllByCategory(req?.category ?? undefined),
    };
  }

  @Get()
  async findAllHability() {
    return {
      status: true,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      data: await this.service.findAllHability(),
    };
  }
  @Get()
  async findAll() {
    return {
      status: true,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      data: await this.service.findAllHability(),
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req) {
    return {
      status: true,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      data: await this.service.findOne(id, req.user.uid),
    };
  }

  @Put(':id')
  async update(@Param('id') id: string, @Req() req, @Body() dto: UpdateProjectDto) {
    return {
      status: true,
      message: 'Proyecto actualizado',
      data: await this.service.update(id, dto, req.user.uid),
    };
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req) {
    await this.service.remove(id, req.user.uid);
    return {
      status: true,
      message: 'Proyecto eliminado',
    };
  }
}
