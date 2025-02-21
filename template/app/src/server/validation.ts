import { HttpError } from 'wasp/server';
import * as z from 'zod';

export function ensureArgsSchemaOrThrowHttpError<Schema extends z.ZodType>(
  schema: Schema,
  rawArgs: unknown
): z.infer<Schema> {
  const parseResult = schema.safeParse(rawArgs);
  if (!parseResult.success) {
    console.error(parseResult.error);
    throw new HttpError(400, 'Operation arguments validation failed', { errors: parseResult.error.errors });
  } else {
    return parseResult.data;
  }
}
