import { defineEnvValidationSchema } from 'wasp/env';
import { HttpError } from 'wasp/server';
import * as z from 'zod';
import { paymentSchema } from '../payment/env';

/**
 * Add any custom environment variables here, e.g.
 * const customSchema = {
 *   CUSTOM_ENV_VAR: z.string().min(1),
 * };
 */
const customSchema = {};
const fullSchema = {...customSchema, ...paymentSchema}

/**
 * Complete environment validation schema
 * 
 * If you need to add custom variables, add them to the customSchema object above.
 */
export const envValidationSchema = defineEnvValidationSchema(z.object(fullSchema));

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
