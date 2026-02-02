import { Module } from '@nestjs/common';
import { RequestsService } from './requests.service';
import { RequestsController } from './requests.controller';
import { FirebaseModule } from 'src/firebase/firebase.module';

@Module({
  providers: [RequestsService],
  controllers: [RequestsController],
  exports: [RequestsService],
  imports: [FirebaseModule],
})
export class RequestsModule {}
