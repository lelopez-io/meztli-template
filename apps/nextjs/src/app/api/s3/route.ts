import { stat } from "fs"
import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"

import { upload } from "@meztli/s3"

/**
 * Configure basic CORS headers
 * You should extend this to match your needs
 */
const setCorsHeaders = (res: Response) => {
    res.headers.set("Access-Control-Allow-Origin", "*")
    res.headers.set("Access-Control-Request-Method", "*")
    res.headers.set("Access-Control-Allow-Methods", "OPTIONS, GET, POST")
    res.headers.set("Access-Control-Allow-Headers", "*")

    return res
}

export const OPTIONS = () => {
    const response = new Response(null, {
        status: 204,
    })
    return setCorsHeaders(response)
}

export const POST = async (req: NextRequest) => {
    const formData = await req.formData()

    const file = formData.get("file") as File | undefined
    if (!file) {
        return NextResponse.json(
            { error: "No files received." },
            { status: 400 },
        )
    }

    try {
        const { status, path } = await upload(file)
        if (status !== 200) {
            return setCorsHeaders(
                NextResponse.json(
                    { Message: "Failed to upload file", status },
                    { status: 500 },
                ),
            )
        }
        return setCorsHeaders(
            NextResponse.json({
                Message: "File successfully uploaded",
                path,
                status: 201,
            }),
        )
    } catch (error) {
        console.error(error)
        return setCorsHeaders(
            NextResponse.json({
                Message: "Failed to upload file",
                status: 500,
            }),
        )
    }
}
