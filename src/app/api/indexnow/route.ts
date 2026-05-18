import { NextResponse } from "next/server";

// IndexNow key — submit this to Bing Webmaster Tools
const INDEXNOW_KEY = "collegematchai2025indexnow";
const HOST = "collegematch-ai.vercel.app";

// Public URLs to notify Bing about
const PUBLIC_URLS = [
  `https://${HOST}`,
  `https://${HOST}/login`,
  `https://${HOST}/register`,
  `https://${HOST}/exams`,
  `https://${HOST}/scholarships`,
  `https://${HOST}/blog`,
  `https://${HOST}/contact`,
  `https://${HOST}/testimonial`,
];

export async function GET() {
  try {
    const payload = {
      host: HOST,
      key: INDEXNOW_KEY,
      keyLocation: `https://${HOST}/${INDEXNOW_KEY}.txt`,
      urlList: PUBLIC_URLS,
    };

    const res = await fetch("https://api.indexnow.org/indexnow", {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify(payload),
    });

    if (res.ok || res.status === 202) {
      return NextResponse.json({
        success: true,
        message: `IndexNow submitted ${PUBLIC_URLS.length} URLs to Bing`,
        status: res.status,
        urls: PUBLIC_URLS,
      });
    }

    return NextResponse.json(
      { success: false, message: "IndexNow submission failed", status: res.status },
      { status: 500 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
