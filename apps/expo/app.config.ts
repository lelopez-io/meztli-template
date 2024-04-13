import type { ConfigContext, ExpoConfig } from "expo/config"

export default ({ config }: ConfigContext): ExpoConfig => ({
    ...config,
    name: "expo",
    slug: "expo",
    scheme: "expo",
    version: "0.1.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "automatic",
    splash: {
        image: "./assets/icon.png",
        resizeMode: "contain",
        backgroundColor: "#0D1C26",
    },
    updates: {
        fallbackToCacheTimeout: 0,
    },
    assetBundlePatterns: ["**/*"],
    ios: {
        bundleIdentifier: "your.bundle.identifier",
        supportsTablet: true,
    },
    android: {
        package: "your.bundle.identifier",
        adaptiveIcon: {
            foregroundImage: "./assets/icon.png",
            backgroundColor: "#0D1C26",
        },
    },
    // extra: {
    //   eas: {
    //     projectId: "your-eas-project-id",
    //   },
    // },
    experiments: {
        tsconfigPaths: true,
        typedRoutes: true,
    },
    plugins: [
        "expo-router",
        [
            "expo-image-picker",
            {
                photosPermission:
                    "The app accesses your photos to let you share them with your friends.",
                cameraPermission:
                    "The app accesses your camera to let you share photos with your friends.",
            },
        ],
    ],
})
