import { Controller, Get, Query } from "@nestjs/common";
import { AmoCrmService } from "@modules/amo-crm/services";

@Controller("amo-crm")
export class AmoCrmController {
    constructor(private readonly amoCrmService: AmoCrmService) {}

    @Get("/auth")
    getAuthCode(@Query("code") authCode: string) {
        return this.amoCrmService.authorize(authCode);
    }

    @Get("/check-connection")
    checkConnection() {
        return "ok";
    }
}
