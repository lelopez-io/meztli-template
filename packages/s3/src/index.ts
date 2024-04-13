import { S3Client } from "@aws-sdk/client-s3"
import { Upload } from "@aws-sdk/lib-storage"

import config, { env } from "./config"

const s3 = new S3Client(config)

export const upload = async (file: File) => {
    const filename = file.name.replaceAll(" ", "_")
    const key = `${Date.now().toString()}-${filename}`
    const upload = await new Upload({
        client: s3,
        params: {
            ACL: "public-read",
            Bucket: env.S3_BUCKET,
            Key: key,
            ContentType: file.type,
            Body: file,
        },
    }).done()

    return {
        status: upload.$metadata.httpStatusCode,
        path: `${config.endpoint}/${env.S3_BUCKET}/${key}`,
    }
}
