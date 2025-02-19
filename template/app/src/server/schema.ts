import * as z from 'zod';
import { HttpError } from 'wasp/server';

export function ensureValidArgsOrThrowHttpError<Schema extends z.ZodType<any, any, any>>(
  args: unknown,
  schema: Schema
): z.infer<Schema> {
  const argsParsingResult = schema.safeParse(args);
  if (!argsParsingResult.success) {
    throw new HttpError(400, argsParsingResult.error.errors[0].message);
  }
  return argsParsingResult.data;
}
