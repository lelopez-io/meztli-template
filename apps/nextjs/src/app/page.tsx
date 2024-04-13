import { Suspense } from "react"

import title from "@meztli/constants"

import { api } from "~/trpc/server"
import { CreatePostForm, PostCardSkeleton, PostList } from "./_components/posts"

export default function HomePage() {
    // You can await this here if you don't want to show Suspense fallback below
    const posts = api.post.all()

    return (
        <main className="container h-screen py-16">
            <div className="flex flex-col items-center justify-center gap-4">
                <h1 className="text-5xl font-extrabold tracking-tight sm:text-[5rem]">
                    <span className={title.className}>{title.content}</span>{" "}
                </h1>
                <CreatePostForm />
                <div className="w-full max-w-2xl overflow-y-scroll">
                    <Suspense
                        fallback={
                            <div className="flex w-full flex-col gap-4">
                                <PostCardSkeleton />
                                <PostCardSkeleton />
                                <PostCardSkeleton />
                            </div>
                        }
                    >
                        <PostList posts={posts} />
                    </Suspense>
                </div>
            </div>
        </main>
    )
}
