import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const CreateCatSchema = z.object({
  name: z.string().min(1).describe('The name of the cat'),
  age: z.number().int().min(0).describe('The age of the cat, in years'),
});

export class CreateCatDto extends createZodDto(CreateCatSchema) {}
