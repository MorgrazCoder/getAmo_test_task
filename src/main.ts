import { NestFactory } from "@nestjs/core";
import { AppModule } from "src/app.module";

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    await app.listen(process.env.PORT);
    console.log(`Server has been stated on port:${process.env.PORT}`);
}
bootstrap();
