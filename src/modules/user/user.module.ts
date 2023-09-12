import { Module } from "@nestjs/common";

import { UserController } from "@modules/user/controllers";

import { UserService } from "@modules/user/services";

import { AmoCrmModule } from "@modules/amo-crm/amo.crm.module";

@Module({
    imports: [AmoCrmModule],
    controllers: [UserController],
    providers: [UserService],
})
export class UserModule {}
