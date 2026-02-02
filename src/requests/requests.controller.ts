import { Body, Controller, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { FirebaseAuthGuard } from 'src/auth/firebase-auth.guard';
import { RequestsService } from './requests.service';
import { CreateRequestDto } from './dto/create-request.dto';
import { RequestStatus } from './enum/request-status.enum';

@UseGuards(FirebaseAuthGuard)
@Controller('requests')
export class RequestsController {
  constructor(private readonly requestsService: RequestsService) {}

  @Post()
  create(@Req() req, @Body() dto: CreateRequestDto) {
    return this.requestsService.create(req.user.uid, dto);
  }

  @Patch(':id/accept')
  accept(@Req() req, @Param('id') id: string) {
    return this.requestsService.accept(req.user.uid, id);
  }

  @Patch(':id/reject')
  reject(@Req() req, @Param('id') id: string) {
    return this.requestsService.reject(req.user.uid, id);
  }

  @Get('projects/:projectId/requests')
  getByProject(
    @Req() req,
    @Param('projectId') projectId: string,
    @Query('estado') estado?: RequestStatus,
  ) {
    return this.requestsService.getByProject(req.user.uid, projectId, estado);
  }
}
