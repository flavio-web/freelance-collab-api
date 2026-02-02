import { Module } from '@nestjs/common';
import { ProjectsController } from './projects.controller';
import { ProjectsService } from './projects.service';
import { FirebaseModule } from 'src/firebase/firebase.module';

@Module({
  controllers: [ProjectsController],
  providers: [ProjectsService],
  exports: [ProjectsService],
  imports: [FirebaseModule],
})
export class ProjectsModule {}
