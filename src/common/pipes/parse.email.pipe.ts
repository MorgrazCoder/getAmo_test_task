import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException } from "@nestjs/common";

import { isEmail } from "class-validator";

@Injectable()
export class ParseEmailPipe implements PipeTransform {
    transform(value: string, metadata: ArgumentMetadata) {
        if (!isEmail(value))
            throw new BadRequestException({
                type: metadata.type,
                param: metadata.data,
                message: `The ${metadata.data} field is not a valid email`,
            });
        return value;
    }
}
