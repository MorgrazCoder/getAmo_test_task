import { ConfigModule } from "@nestjs/config";

import { UserModule } from "@modules/user/user.module";
import { AmoCrmModule } from "@modules/amo-crm/amo.crm.module";
import { CacheModule } from "@nestjs/cache-manager";

export const modules = [
    ConfigModule.forRoot({
        isGlobal: true,
    }),
    CacheModule.register({
        isGlobal: true,
    }),
    UserModule,
    AmoCrmModule,
];
