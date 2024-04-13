# Meztli

A template project that provides a fully self contained playground for experiments with - | NextJS | ReactNative | Expo | DockerCompose | MinIO/S3 | MySQL | TailwindCSS | tRPC | Drizzle |

## Overview

```text
.vscode
  └─ Recommended extensions and settings for VSCode users
apps
  ├─ expo
  |   ├─ Expo SDK 49
  |   ├─ React Native using React 18
  |   ├─ Navigation using Expo Router
  |   ├─ Tailwind using NativeWind
  |   └─ Typesafe API calls using tRPC
  └─ next.js
      ├─ Next.js 14
      ├─ React 18
      ├─ Tailwind CSS
      └─ E2E Typesafe API Server & Client
packages
  ├─ api
  |   └─ tRPC v11 router definition
  ├─ constants
  |   └─ Shared values that can be used across apps
  ├─ db
  |   └─ Typesafe db calls using Drizzle & local MySQL instance
  ├─ s3
  |   └─ Typesafe s3 calls to local MinIO instance
  ├─ ui
  |   └─ Start of a UI package for the webapp using shadcn-ui
  └─ validators
      └─ Shared Zod schemas for common models
tooling
  ├─ eslint
  |   └─ shared, fine-grained, eslint presets
  ├─ prettier
  |   └─ shared prettier configuration
  ├─ tailwind
  |   └─ shared tailwind configuration
  └─ typescript
      └─ shared tsconfig you can extend from
```

<!-- prettier-ignore -->
|   |   |
| - | - |
| Note: | In this template, we use `@meztli` as a placeholder for package names. As a user, you might want to replace it with your own organization or project name. You can use find-and-replace to change all the instances of `@meztli` to something like `@my-company` or `@project-name`. |

## Quick Start

To get it running, follow the steps below:

### 1. Setup dependencies

1. Install dependencies
    ```sh
    yarn
    ```
2. Configure environment variables. (Use `.env.example` for reference)
    ```sh
    cp .env.example .env
    ```
3. Start the local database and simple storage service
    ```sh
    docker-compose up
    ```
4. Push the Drizzle schema to the database
    ```sh
    yarn db:push
    ```

<!-- prettier-ignore -->
|   |   |
| - | - |
| Note: | The `apps/expo/.gitignore` file is generated by the expo-cli and may require you to change access permissions by running `chmod 644 apps/expo/.gitignore` from the root directory|

### 2. Configure Expo `dev`-script

#### For iOS Simulator

1. Make sure you have XCode and XCommand Line Tools installed [as shown on expo docs](https://docs.expo.dev/workflow/ios-simulator).
    <!-- prettier-ignore -->
    |   |   |
    | - | - |
    | Note: | If you just installed XCode, or if you have updated it, you need to open the simulator manually once. Run `npx expo start` in the root dir, and then enter `I` to launch Expo Go. After the manual launch, you can run `yarn dev` in the root directory. |
2. Change the `dev` script at `apps/expo/package.json` to open the Android emulator.

    ```diff
    +  "dev": "expo start --ios",
    ```

3. Run `yarn dev` at the project root folder.
    <!-- prettier-ignore -->
    |   |   |
    | - | - |
    | Tip: | Open the Expo Go developer menu with `cmd + d`.Note that "Connect Hardware Keyboard" must be enabled (toggle this with `cmd + shift + k`).  |

#### For Android Simulator

1. Install Android Studio tools [as shown on expo docs](https://docs.expo.dev/workflow/android-studio-emulator).

2. Change the `dev` script at `apps/expo/package.json` to open the Android emulator.

    ```diff
    +  "dev": "expo start --android",
    ```

3. Run `yarn dev` at the project root folder.

### 3a. When it's time to add a new UI component

Run the `ui-add` script to add a new UI component using the interactive `shadcn/ui` CLI:

```bash
yarn ui-add
```

When the component(s) has been installed, you should be good to go and start using it in your app.

### 3b. When it's time to add a new package

To add a new package, simply run `yarn turbo gen init` in the monorepo root. This will prompt you for a package name as well as if you want to install any dependencies to the new package (of course you can also do this yourself later).

The generator sets up the `package.json`, `tsconfig.json` and a `index.ts`, as well as configures all the necessary configurations for tooling around your package such as formatting, linting and typechecking. When the package is created, you're ready to go build out the package.

### 4. Clean Slate

If you want to clear you DB and S3

```sh
docker-compose down -v
docker-compose up
yarn db:push
yarn dev
```

## Deployment

#### Prerequisites

The Next.js application with tRPC must be deployed in order for the Expo app to communicate with the server in a production environment.

### Expo

Deploying your Expo application works slightly differently compared to Next.js on the web. Instead of "deploying" your app online, you need to submit production builds of your app to app stores, like [Apple App Store](https://www.apple.com/app-store) and [Google Play](https://play.google.com/store/apps). You can read the full [guide to distributing your app](https://docs.expo.dev/distribution/introduction), including best practices, in the Expo docs.

1. Make sure to modify the `getBaseUrl` function to point to your backend's production URL in the `app/expo/src/utils/api.tsx` file.

2. Let's start by setting up [EAS Build](https://docs.expo.dev/build/introduction), which is short for Expo Application Services. The build service helps you create builds of your app, without requiring a full native development setup. The commands below are a summary of [Creating your first build](https://docs.expo.dev/build/setup).

    ```bash
    # Install the EAS CLI
    yarn global add eas-cli

    # Log in with your Expo account
    eas login

    # Configure your Expo app
    cd apps/expo
    eas build:configure
    ```

3. After the initial setup, you can create your first build. You can build for Android and iOS platforms and use different [`eas.json` build profiles](https://docs.expo.dev/build-reference/eas-json) to create production builds or development, or test builds. Let's make a production build for iOS.

    ```bash
    eas build --platform ios --profile production
    ```

    <!-- prettier-ignore -->
    |   |   |
    | - | - |
    | Note: | If you don't specify the `--profile` flag, EAS uses the `production` profile by default.  |

4. Now that you have your first production build, you can submit this to the stores. [EAS Submit](https://docs.expo.dev/submit/introduction) can help you send the build to the stores.

    ```bash
    eas submit --platform ios --latest
    ```

    <!-- prettier-ignore -->
    |   |   |
    | - | - |
    | Note: | You can also combine build and submit in a single command, using `eas build ... --auto-submit`.  |

5. Before you can get your app in the hands of your users, you'll have to provide additional information to the app stores. This includes screenshots, app information, privacy policies, etc. _While still in preview_, [EAS Metadata](https://docs.expo.dev/eas/metadata) can help you with most of this information.

6. Once everything is approved, your users can finally enjoy your app. Let's say you spotted a small typo; you'll have to create a new build, submit it to the stores, and wait for approval before you can resolve this issue. In these cases, you can use EAS Update to quickly send a small bugfix to your users without going through this long process. Let's start by setting up EAS Update.

    The steps below summarize the [Getting started with EAS Update](https://docs.expo.dev/eas-update/getting-started/#configure-your-project) guide.

    ```bash
    # Add the `expo-updates` library to your Expo app
    cd apps/expo
    npx expo install expo-updates

    # Configure EAS Update
    eas update:configure
    ```

7. Before we can send out updates to your app, you have to create a new build and submit it to the app stores. For every change that includes native APIs, you have to rebuild the app and submit the update to the app stores. See steps 2 and 3.

8. Now that everything is ready for updates, let's create a new update for `production` builds. With the `--auto` flag, EAS Update uses your current git branch name and commit message for this update. See [How EAS Update works](https://docs.expo.dev/eas-update/how-eas-update-works/#publishing-an-update) for more information.

    ```bash
    cd apps/expo
    eas update --auto
    ```

    <!-- prettier-ignore -->
    |   |   |
    | - | - |
    | Note: | Your OTA (Over The Air) updates must always follow the app store's rules. You can't change your app's primary functionality without getting app store approval. But this is a fast way to update your app for minor changes and bug fixes.  |

9. Done! Now that you have created your production build, submitted it to the stores, and installed EAS Update, you are ready for anything!

## References

The stack originates from [create-t3-app](https://github.com/t3-oss/create-t3-app) but is modified to not rely on PlanetScale out of the box and instead provides a local database and s3 instances for minimal setup. There are also a quite a few opinionated changes I've made that better suite my typical workflow and the tools I'm most efficient with.
