import { Module } from "@nestjs/common";

import { HttpModule } from "@nestjs/axios";

import { AmoCrmService } from "@modules/amo-crm/services";
import { AmoCrmController } from "@modules/amo-crm/controllers";

@Module({
    imports: [HttpModule],
    controllers: [AmoCrmController],
    providers: [AmoCrmService],
    exports: [AmoCrmService],
})
export class AmoCrmModule {}
