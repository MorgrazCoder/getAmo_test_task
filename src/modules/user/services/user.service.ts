import { AmoCrmService } from "@modules/amo-crm/services";
import { Injectable } from "@nestjs/common";

@Injectable()
export class UserService {
    constructor(private readonly amoCrmService: AmoCrmService) {}
    public async contact(email: string, phone: string, name: string) {
        return this.amoCrmService.contacts(email, phone, name);
    }
    public async refreshTokens() {
        return this.amoCrmService.refreshTokens();
    }
}
