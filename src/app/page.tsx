import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Post } from "@/lib/types";
import HomepageContent from "@/components/HomepageContent";

export const dynamic = "force-dynamic";

async function getPosts(): Promise<Post[]> {
  try {
    const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Post));
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const posts = await getPosts();
  return <HomepageContent posts={posts} />;
}
