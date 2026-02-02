import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { FirebaseModule } from 'src/firebase/firebase.module';
import { FirebaseAuthGuard } from './firebase-auth.guard';

@Module({
  controllers: [AuthController],
  providers: [AuthService, FirebaseAuthGuard],
  exports: [AuthService, FirebaseAuthGuard],
  imports: [FirebaseModule],
})
export class AuthModule {}
