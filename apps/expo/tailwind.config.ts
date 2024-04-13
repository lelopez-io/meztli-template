import type { Config } from "tailwindcss"
// @ts-expect-error - no types
import nativewind from "nativewind/preset"

import baseConfig from "@meztli/tailwind-config/native"

export default {
    content: [
        "./src/**/*.{ts,tsx}",
        "../../packages/constants/**/*.{ts,tsx,js,jsx}",
    ],
    presets: [baseConfig, nativewind],
} satisfies Config
