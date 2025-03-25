import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProfileService } from './profile/profile.service';
import { ProfileController } from './profile/profile.controller';
import { AuthTokenService } from './auth_token/auth_token.service';

@Module({
  imports: [],
  controllers: [AppController, ProfileController],
  providers: [AppService, ProfileService, AuthTokenService],
})
export class AppModule {}
