import { NextRequest, NextResponse } from "next/server";

const MAX_SIZE = 5 * 1024 * 1024;

function sanitizeFilename(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9._-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function POST(req: NextRequest) {
  const token = process.env.GITHUB_PAT;
  const owner = process.env.GITHUB_IMAGE_REPO_OWNER;
  const repo = process.env.GITHUB_IMAGE_REPO_NAME;

  if (!token || !owner || !repo) {
    return NextResponse.json(
      { error: "Server not configured for image uploads" },
      { status: 500 }
    );
  }

  const formData = await req.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  if (file.size > MAX_SIZE) {
    return NextResponse.json(
      { error: "File too large — 5MB limit" },
      { status: 400 }
    );
  }

  const timestamp = Date.now();
  const safe = sanitizeFilename(file.name);
  const path = `images/${timestamp}-${safe}`;

  const buffer = Buffer.from(await file.arrayBuffer());
  const content = buffer.toString("base64");

  const res = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/contents/${path}`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: `upload: ${safe}`,
        content,
      }),
    }
  );

  if (!res.ok) {
    const body = await res.text();
    console.error("GitHub upload failed:", res.status, body);
    return NextResponse.json(
      { error: `GitHub upload failed (${res.status})` },
      { status: 502 }
    );
  }

  const url = `https://raw.githubusercontent.com/${owner}/${repo}/main/${path}`;
  return NextResponse.json({ url });
}
