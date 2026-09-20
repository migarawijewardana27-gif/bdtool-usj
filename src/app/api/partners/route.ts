import { NextRequest, NextResponse } from "next/server";
import {
  createPartner,
  validateAccessCode,
  getAllPartnersClient,
} from "@/lib/db";

// POST /api/partners — Create a new partner
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { companyName, title, eventName, driveLink, accessCode } = body;

    // ── Validate access code first ────────────────────────────────────────
    if (!accessCode) {
      return NextResponse.json(
        { error: "Access code is required." },
        { status: 401 }
      );
    }

    const { valid, ocName } = validateAccessCode(accessCode);
    if (!valid) {
      return NextResponse.json(
        { error: "Invalid access code. Please check with your MC." },
        { status: 401 }
      );
    }

    // ── Validate required fields ──────────────────────────────────────────
    if (!companyName || !title || !eventName || !driveLink) {
      return NextResponse.json(
        { error: "All fields are required." },
        { status: 400 }
      );
    }

    // ── Create partner ────────────────────────────────────────────────────
    const partner = await createPartner(
      { companyName, title, eventName, driveLink },
      ocName!
    );

    return NextResponse.json(
      { success: true, partner, ocName },
      { status: 201 }
    );
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Something went wrong.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// GET /api/partners — List all partners
export async function GET() {
  try {
    const partners = await getAllPartnersClient();
    return NextResponse.json({ partners });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Something went wrong.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
