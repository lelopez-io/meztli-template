import { useRef, useState } from "react"
import {
    Image,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    Text,
    TextInput,
    View,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import Constants from "expo-constants"
import * as FileSystem from "expo-file-system"
import * as ImagePicker from "expo-image-picker"
import { Stack } from "expo-router"
import {
    ActionSheetProvider,
    useActionSheet,
} from "@expo/react-native-action-sheet"
import { FlashList } from "@shopify/flash-list"

import title from "@meztli/constants"

import type { RouterOutputs } from "~/utils/api"
import { api, getBaseUrl } from "~/utils/api"

function PostCard(props: {
    post: RouterOutputs["post"]["all"][number]
    onDelete: () => void
}) {
    const localhostSrc = (url: string) => {
        const debuggerHost = Constants.expoConfig?.hostUri
        const localhost = debuggerHost?.split(":")[0]
        if (!localhost) {
            return url
        }
        return url.replace("http://127.0.0.1:9000", `http://${localhost}:9000`)
    }

    return (
        <View className="overflow-hidden rounded-lg bg-muted">
            <View className="relative aspect-video w-full">
                <Image
                    src={localhostSrc(props.post.coverImage)}
                    alt={props.post.title}
                    className="size-full object-cover object-center"
                />
            </View>

            <View className="flex flex-row  p-4">
                <View className="flex-grow">
                    <Text className=" text-xl font-semibold text-primary">
                        {props.post.title}
                    </Text>
                    <Text className="mt-2 text-foreground">
                        {props.post.content}
                    </Text>
                </View>
                <Pressable onPress={props.onDelete}>
                    <Text className="font-bold uppercase text-primary">
                        Delete
                    </Text>
                </Pressable>
            </View>
        </View>
    )
}

function CreatePost() {
    const isSubmitting = useRef(false)
    const [imageFile, setImageFile] =
        useState<ImagePicker.ImagePickerAsset | null>(null)
    const [title, setTitle] = useState("")
    const [content, setContent] = useState("")

    const utils = api.useUtils()
    const { showActionSheetWithOptions } = useActionSheet()
    const { mutate, error } = api.post.create.useMutation({
        async onSuccess() {
            Keyboard.dismiss()
            setImageFile(null)
            setTitle("")
            setContent("")
            await utils.post.all.invalidate()
        },
    })

    const handleImage = (image: ImagePicker.ImagePickerAsset) => {
        let path = image.uri
        if (Platform.OS === "ios") {
            path = "~" + path.substring(path.indexOf("/Documents"))
        }
        if (!image.fileName) image.fileName = path.split("/").pop()
        setImageFile(image)
    }

    const chooseImage = async () => {
        // No permissions request is necessary for launching the image library
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.All,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        })

        if (!result.canceled && result.assets[0]) {
            handleImage(result.assets[0])
        }
    }

    const takePhoto = async () => {
        // Permissions request is necessary for launching the camera
        const { status } = await ImagePicker.requestCameraPermissionsAsync()
        if (status !== ImagePicker.PermissionStatus.GRANTED) {
            console.error("Camera permissions not granted")
            return
        }

        let result
        try {
            result = await ImagePicker.launchCameraAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [4, 3],
                quality: 1,
            })
        } catch (error) {
            if (
                error instanceof Error &&
                error.message === "Camera not available on simulator"
            ) {
                void chooseImage()
                return
            }

            throw error
        }

        if (!result.canceled && result.assets[0]) {
            handleImage(result.assets[0])
        }
    }

    const showImageOptions = () => {
        const options = ["Take photo", "Choose photo", "Cancel"]
        const cancelButtonIndex = 2

        showActionSheetWithOptions(
            {
                options,
                cancelButtonIndex,
            },
            (selectedIndex: number | undefined) => {
                switch (selectedIndex) {
                    case 0:
                        // Take Photo
                        void takePhoto()
                        break

                    case 1:
                        // Choose Image
                        void chooseImage()
                        break

                    case cancelButtonIndex:
                    // Canceled
                }
            },
        )
    }

    return (
        <View className="mt-4 flex gap-2">
            <Pressable
                disabled={isSubmitting.current}
                className="items-center rounded-md border border-input bg-background px-3 "
                onPress={showImageOptions}
            >
                <Text className="text-lg leading-[1.25] text-foreground">
                    {imageFile ? imageFile.fileName : "Choose Image"}
                </Text>
            </Pressable>
            <TextInput
                className=" items-center rounded-md border border-input bg-background px-3 text-lg leading-[1.25] text-foreground"
                value={title}
                onChangeText={setTitle}
                placeholder="Title"
            />
            {error?.data?.zodError?.fieldErrors.title && (
                <Text className="mb-2 text-destructive">
                    {error.data.zodError.fieldErrors.title}
                </Text>
            )}
            <TextInput
                className="items-center rounded-md border border-input bg-background px-3  text-lg leading-[1.25] text-foreground"
                value={content}
                onChangeText={setContent}
                placeholder="Content"
            />
            {error?.data?.zodError?.fieldErrors.content && (
                <Text className="mb-2 text-destructive">
                    {error.data.zodError.fieldErrors.content}
                </Text>
            )}
            <Pressable
                className="flex items-center rounded bg-primary p-2"
                onPress={async () => {
                    try {
                        if (isSubmitting.current) {
                            return
                        }
                        isSubmitting.current = true
                        if (!imageFile) {
                            throw new Error("Please select an image")
                        }
                        const response = await FileSystem.uploadAsync(
                            `${getBaseUrl()}/api/s3`,
                            imageFile.uri,
                            {
                                httpMethod: "POST",
                                uploadType:
                                    FileSystem.FileSystemUploadType.MULTIPART,
                                fieldName: "file",
                            },
                        )
                        const upload = JSON.parse(response.body) as {
                            status: number
                            path: string
                        }
                        if (upload.status !== 201) {
                            throw new Error("Failed to upload image")
                        }
                        mutate({
                            coverImage: upload.path,
                            title,
                            content,
                        })
                    } catch (err) {
                        if (err instanceof Error) {
                            switch (err.message) {
                                case "Please select an image":
                                    console.error(err.message)
                            }
                        }
                        console.error(err)
                    } finally {
                        isSubmitting.current = false
                    }
                }}
            >
                <Text className="text-primary-foreground">Create</Text>
            </Pressable>
            {error?.data?.code === "UNAUTHORIZED" && (
                <Text className="mt-2 text-destructive">
                    You need to be logged in to create a post
                </Text>
            )}
        </View>
    )
}

export default function Index() {
    const utils = api.useUtils()

    const postQuery = api.post.all.useQuery()

    const deletePostMutation = api.post.delete.useMutation({
        onSettled: () => utils.post.all.invalidate().then(),
    })

    return (
        <ActionSheetProvider>
            <SafeAreaView className="bg-background">
                {/* Changes page title visible on the header */}
                <Stack.Screen options={{ title: "Home Page" }} />
                <KeyboardAvoidingView
                    className="h-full w-full bg-background px-4 pb-8"
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    keyboardVerticalOffset={Platform.OS === "ios" ? 112 : 0}
                >
                    <Text className="pb-2 text-center text-5xl font-bold text-foreground">
                        <Text className={title.className}>{title.content}</Text>
                    </Text>

                    <Pressable
                        onPress={() => void utils.post.all.invalidate()}
                        className="mb-6 flex items-center rounded-lg bg-primary p-2"
                    >
                        <Text className="text-primary-foreground">
                            Refresh posts
                        </Text>
                    </Pressable>

                    <FlashList
                        data={postQuery.data}
                        estimatedItemSize={20}
                        ItemSeparatorComponent={() => <View className="h-2" />}
                        renderItem={(p) => (
                            <PostCard
                                post={p.item}
                                onDelete={() =>
                                    deletePostMutation.mutate(p.item.id)
                                }
                            />
                        )}
                    />

                    <CreatePost />
                </KeyboardAvoidingView>
            </SafeAreaView>
        </ActionSheetProvider>
    )
}
