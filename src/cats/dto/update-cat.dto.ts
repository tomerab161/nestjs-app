import { createZodDto } from 'nestjs-zod';
import { CreateCatSchema } from './create-cat.dto';

export class UpdateCatDto extends createZodDto(CreateCatSchema.partial()) {}
