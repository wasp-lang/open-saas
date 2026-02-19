import { defineEnvValidationSchema } from 'wasp/env'
import { authEnvSchema } from './auth/env'
import { stripeEnvSchema } from './payment/env'
// import { lemonSqueezyEnvSchema } from './payment/env'
// import { polarEnvSchema } from './payment/env'
import { demoAiAppEnvSchema } from './demo-ai-app/env'
import { fileUploadEnvSchema } from './file-upload/env'
import { plausibleEnvSchema } from './analytics/env'
// import { googleAnalyticsEnvSchema } from './analytics/env'

export const serverEnvValidationSchema = defineEnvValidationSchema(
  authEnvSchema
    .merge(stripeEnvSchema)
    // .merge(lemonSqueezyEnvSchema)
    // .merge(polarEnvSchema)
    .merge(demoAiAppEnvSchema)
    .merge(fileUploadEnvSchema)
    .merge(plausibleEnvSchema)
    // .merge(googleAnalyticsEnvSchema)
)
