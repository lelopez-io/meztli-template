"use client"

import { use, useRef, useState } from "react"
import Image from "next/image"

import type { RouterOutputs } from "@meztli/api"
import { cn } from "@meztli/ui"
import { Button } from "@meztli/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormMessage,
    useForm,
} from "@meztli/ui/form"
import { Input } from "@meztli/ui/input"
import { toast } from "@meztli/ui/toast"
import { CreatePostSchema } from "@meztli/validators"

import { api } from "~/trpc/react"

export function CreatePostForm() {
    const isSubmitting = useRef(false)
    const [imageFile, setImageFile] = useState<File | null>(null)
    const form = useForm({
        schema: CreatePostSchema,
        defaultValues: {
            content: "",
            title: "",
        },
    })

    const utils = api.useUtils()
    const createPost = api.post.create.useMutation({
        onSuccess: async () => {
            setImageFile(null)
            form.reset()
            await utils.post.invalidate()
        },
        onError: (err) => {
            toast.error(
                err.data?.code === "UNAUTHORIZED"
                    ? "You must be logged in to post"
                    : "Failed to create post",
            )
        },
    })

    return (
        <Form {...form}>
            <form
                className="flex w-full max-w-2xl flex-col gap-4"
                onSubmit={form.handleSubmit(async ({ title, content }) => {
                    try {
                        if (isSubmitting.current) {
                            return
                        }
                        isSubmitting.current = true
                        if (!imageFile) {
                            throw new Error("Please select an image")
                        }
                        const formData = new FormData()
                        formData.append("file", imageFile)
                        const response = await fetch("/api/s3", {
                            method: "POST",
                            body: formData,
                        })
                        const upload = (await response.json()) as {
                            status: number
                            path: string
                        }
                        if (upload.status !== 201) {
                            throw new Error("Failed to upload image")
                        }
                        createPost.mutate({
                            coverImage: upload.path,
                            title,
                            content,
                        })
                    } catch (err) {
                        if (err instanceof Error) {
                            switch (err.message) {
                                case "Please select an image":
                                    toast.error("Please select an image")
                            }
                        }
                        console.error(err)
                        toast.error("Failed to create post")
                    } finally {
                        isSubmitting.current = false
                    }
                })}
            >
                <FormField
                    control={form.control}
                    name="coverImage"
                    render={({ field }) => (
                        <FormItem>
                            <FormControl>
                                <Input
                                    {...field}
                                    placeholder="Title"
                                    type="file"
                                    accept="image/png, image/jpeg, image/jpg"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0]
                                        if (file) {
                                            console.log(file)
                                            setImageFile(file)
                                        }
                                        field.onChange(e)
                                    }}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                        <FormItem>
                            <FormControl>
                                <Input {...field} placeholder="Title" />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="content"
                    render={({ field }) => (
                        <FormItem>
                            <FormControl>
                                <Input {...field} placeholder="Content" />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button disabled={isSubmitting.current}>Create</Button>
            </form>
        </Form>
    )
}

export function PostList(props: {
    posts: Promise<RouterOutputs["post"]["all"]>
}) {
    // TODO: Make `useSuspenseQuery` work without having to pass a promise from RSC
    const initialData = use(props.posts)
    const { data: posts } = api.post.all.useQuery(undefined, {
        initialData,
    })

    if (posts.length === 0) {
        return (
            <div className="relative flex w-full flex-col gap-4">
                <PostCardSkeleton pulse={false} />
                <PostCardSkeleton pulse={false} />
                <PostCardSkeleton pulse={false} />

                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/10">
                    <p className="text-2xl font-bold text-white">
                        No posts yet
                    </p>
                </div>
            </div>
        )
    }

    return (
        <div className="flex w-full flex-col gap-4">
            {posts.map((p) => {
                return <PostCard key={p.id} post={p} />
            })}
        </div>
    )
}

export function PostCard(props: {
    post: RouterOutputs["post"]["all"][number]
}) {
    const utils = api.useUtils()
    const deletePost = api.post.delete.useMutation({
        onSuccess: async () => {
            await utils.post.invalidate()
        },
        onError: (err) => {
            toast.error(
                err.data?.code === "UNAUTHORIZED"
                    ? "You must be logged in to delete a post"
                    : "Failed to delete post",
            )
        },
    })

    return (
        <div className="overflow-hidden rounded-lg bg-muted">
            <div className="relative aspect-video w-full">
                <Image
                    src={props.post.coverImage}
                    alt={props.post.title}
                    fill={true}
                    className="size-full object-cover object-center"
                />
            </div>
            <div className="flex flex-row  p-4">
                <div className="flex-grow">
                    <h2 className="text-2xl font-bold text-primary">
                        {props.post.title}
                    </h2>
                    <p className="mt-2 text-sm">{props.post.content}</p>
                </div>
                <div>
                    <Button
                        variant="ghost"
                        className="cursor-pointer text-sm font-bold uppercase text-primary hover:bg-transparent hover:text-white"
                        onClick={() => deletePost.mutate(props.post.id)}
                    >
                        Delete
                    </Button>
                </div>
            </div>
        </div>
    )
}

export function PostCardSkeleton(props: { pulse?: boolean }) {
    const { pulse = true } = props
    return (
        <div className="flex flex-row rounded-lg bg-muted p-4">
            <div className="flex-grow">
                <h2
                    className={cn(
                        "w-1/4 rounded bg-primary text-2xl font-bold",
                        pulse && "animate-pulse",
                    )}
                >
                    &nbsp;
                </h2>
                <p
                    className={cn(
                        "mt-2 w-1/3 rounded bg-current text-sm",
                        pulse && "animate-pulse",
                    )}
                >
                    &nbsp;
                </p>
            </div>
        </div>
    )
}
