import baseConfig from "@meztli/eslint-config/base"
import nextjsConfig from "@meztli/eslint-config/nextjs"
import reactConfig from "@meztli/eslint-config/react"

/** @type {import('typescript-eslint').Config} */
export default [
    {
        ignores: [".next/**"],
    },
    ...baseConfig,
    ...reactConfig,
    ...nextjsConfig,
]
