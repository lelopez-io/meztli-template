import baseConfig from "@meztli/eslint-config/base"
import reactConfig from "@meztli/eslint-config/react"

/** @type {import('typescript-eslint').Config} */
export default [
    {
        ignores: [],
    },
    ...baseConfig,
    ...reactConfig,
]
