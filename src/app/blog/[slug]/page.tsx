import BlogPostPageClient from "@/components/BlogPostPageClient";

export const dynamic = "force-dynamic";

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <BlogPostPageClient slug={slug} />;
}
