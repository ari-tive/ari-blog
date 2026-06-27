import { collection, getDocs, query, where, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Post } from "@/lib/types";
import { notFound } from "next/navigation";
import BlogPostClient from "@/components/BlogPostClient";

export const dynamic = "force-dynamic";

async function getPost(slug: string): Promise<Post | null> {
  try {
    const q = query(
      collection(db, "posts"),
      where("slug", "==", slug),
      limit(1)
    );
    const snap = await getDocs(q);
    if (snap.empty) return null;
    return { id: snap.docs[0].id, ...snap.docs[0].data() } as Post;
  } catch {
    return null;
  }
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();
  return <BlogPostClient post={post} />;
}
