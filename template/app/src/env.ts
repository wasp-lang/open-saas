import { defineEnvValidationSchema } from 'wasp/env'

import { authEnvSchema } from './auth/env'
import { stripeEnvSchema } from './payment/stripe/env'
import { lemonSqueezyEnvSchema } from './payment/lemonSqueezy/env'
import { polarEnvSchema } from './payment/polar/env'
import { demoAiAppEnvSchema } from './demo-ai-app/env'
import { fileUploadEnvSchema } from './file-upload/env'
import { plausibleEnvSchema, googleAnalyticsEnvSchema } from './analytics/env'

export const serverEnvValidationSchema = defineEnvValidationSchema(
  authEnvSchema
    .merge(stripeEnvSchema)
    .merge(lemonSqueezyEnvSchema)
    .merge(polarEnvSchema)
    .merge(demoAiAppEnvSchema)
    .merge(fileUploadEnvSchema)
    .merge(plausibleEnvSchema)
    .merge(googleAnalyticsEnvSchema)
)
