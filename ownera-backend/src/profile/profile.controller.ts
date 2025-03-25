import { Controller, Get, Post, Body } from '@nestjs/common';
import { ProfileService } from './profile.service';


@Controller('profile')
export class ProfileController {
    constructor(private readonly profileService: ProfileService) { }

    @Post('create-user')
    async createUser() {
        const user = await this.profileService.createUser();
        return user;
    }

    @Get('get-user')
    async getUser(@Body('userId') userId: string) {
        const user = await this.profileService.getUser(userId);
        return user;
    }
}
