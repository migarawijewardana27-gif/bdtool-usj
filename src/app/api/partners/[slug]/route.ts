import { NextRequest, NextResponse } from "next/server";
import { getPartnerBySlugClient } from "@/lib/db";

// GET /api/partners/[slug] — Get a single partner by slug
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const partner = await getPartnerBySlugClient(slug);

    if (!partner) {
      return NextResponse.json(
        { error: "Partner not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({ partner });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Something went wrong.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
