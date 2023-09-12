import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException } from "@nestjs/common";

import { isPhoneNumber } from "class-validator";

@Injectable()
export class ParsePhonePipe implements PipeTransform {
    transform(value: string, metadata: ArgumentMetadata) {
        if (!value.startsWith("+")) value = "+" + value;
        if (!isPhoneNumber(value))
            throw new BadRequestException({
                type: metadata.type,
                param: metadata.data,
                message: `The ${metadata.data} field is not a valid phone number`,
            });
        return value;
    }
}
