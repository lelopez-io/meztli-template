import type { S3ClientConfig } from "@aws-sdk/client-s3"
import { createEnv } from "@t3-oss/env-core"
import * as z from "zod"

export const env = createEnv({
    server: {
        S3_HOST: z.string(),
        S3_PORT: z.string(),
        S3_USERNAME: z.string(),
        S3_PASSWORD: z.string(),
        S3_BUCKET: z.string(),
        S3_REGION: z.string(),
    },
    runtimeEnv: process.env,
    emptyStringAsUndefined: true,
})

export default {
    endpoint: `http://${env.S3_HOST}:${env.S3_PORT}`,
    credentials: {
        accessKeyId: env.S3_USERNAME,
        secretAccessKey: env.S3_PASSWORD,
    },
    region: env.S3_REGION,
} satisfies S3ClientConfig
