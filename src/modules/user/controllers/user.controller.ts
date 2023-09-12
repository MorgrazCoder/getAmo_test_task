import { Controller, Get, Query } from "@nestjs/common";
import { UserService } from "@modules/user/services";

import { ParseEmailPipe, ParsePhonePipe } from "@common/pipes";

@Controller("user")
export class UserController {
    constructor(private readonly userService: UserService) {}

    @Get("/get-contact")
    async getCurrentUser(
        @Query("name") name: string,
        @Query("email", ParseEmailPipe) email: string,
        @Query("phone", ParsePhonePipe) phone: string
    ) {
        try {
            return await this.userService.contact(email, phone, name);
        } catch (error: any) {
            if (!(error?.response?.data?.status == 401)) throw error;
            console.log(error?.response?.data?.status);
            await this.userService.refreshTokens();
            return await this.userService.contact(email, phone, name);
        }
    }
}
