import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
} from "firebase/firestore";
import { db, FIREBASE_PROJECT_ID } from "./firebase";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Partner {
  slug: string;
  eventSlug: string;
  companyName: string;
  title: string;
  eventName: string;
  driveLink: string;
  createdAt: string;
  createdBy: string;
}

export interface CreatePartnerInput {
  companyName: string;
  title: string;
  driveLink: string;
}

// ─── Access Codes ─────────────────────────────────────────────────────────────
// Map of access codes to OC names. Easy to expand later.

const ACCESS_CODES: Record<
  string,
  { ocName: string; eventName: string; eventSlug: string }
> = {
  "2627": {
    ocName: "LC USJ",
    eventName: "AIESEC in USJ",
    eventSlug: "aiesec-in-usj",
  },
  "0000": {
    ocName: "NatCon 2026",
    eventName: "NatCon 2026",
    eventSlug: "natcon-2026",
  },
  "1111": {
    ocName: "NLDS 2026",
    eventName: "NLDS 2026",
    eventSlug: "nlds-2026",
  },
  "2222": {
    ocName: "Worlds Largest Lesson 2026",
    eventName: "Worlds Largest Lesson 2026",
    eventSlug: "worlds-largest-lesson-2026",
  },
};

export function validateAccessCode(code: string): {
  valid: boolean;
  ocName: string | null;
  eventName: string | null;
  eventSlug: string | null;
} {
  const data = ACCESS_CODES[code];
  if (!data) {
    return { valid: false, ocName: null, eventName: null, eventSlug: null };
  }
  return {
    valid: true,
    ocName: data.ocName,
    eventName: data.eventName,
    eventSlug: data.eventSlug,
  };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "") // strip special chars
    .replace(/\s+/g, "-") // spaces → hyphens
    .replace(/-+/g, "-") // collapse multiple hyphens
    .replace(/^-|-$/g, ""); // trim leading/trailing hyphens
}

// ─── Firestore Collection ─────────────────────────────────────────────────────

const PARTNERS_COLLECTION = "partners";

// ─── Timeout Helper ───────────────────────────────────────────────────────────

function withTimeout<T>(
  promise: Promise<T>,
  ms: number,
  errorMessage: string
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(errorMessage)), ms)
    ),
  ]);
}

// ─── Client-Side CRUD (runs in browser) ───────────────────────────────────────

export async function createPartner(
  data: CreatePartnerInput,
  ocName: string,
  eventName: string,
  eventSlug: string
): Promise<Partner> {
  const slug = slugify(data.companyName);

  if (!slug) {
    throw new Error("Company name produces an invalid slug.");
  }

  const docId = `${eventSlug}-${slug}`;

  // Check if slug already exists (with timeout)
  const existing = await withTimeout(
    getPartnerBySlugClient(eventSlug, slug),
    10000,
    "Firestore read timed out. Please check your Firestore security rules allow reads."
  );
  if (existing) {
    throw new Error(`A partner with the slug "${slug}" already exists for this event.`);
  }

  const partner: Partner = {
    slug,
    eventSlug,
    companyName: data.companyName.trim(),
    title: data.title.trim(),
    eventName,
    driveLink: data.driveLink.trim(),
    createdAt: new Date().toISOString(),
    createdBy: ocName,
  };

  // Use composite ID for easy lookups (with timeout)
  await withTimeout(
    setDoc(doc(db, PARTNERS_COLLECTION, docId), partner),
    10000,
    "Firestore write timed out. Please check your Firestore security rules allow writes to the 'partners' collection."
  );

  return partner;
}

export async function getPartnerBySlugClient(
  eventSlug: string,
  slug: string
): Promise<Partner | null> {
  const docId = `${eventSlug}-${slug}`;
  const docRef = doc(db, PARTNERS_COLLECTION, docId);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    return null;
  }

  return docSnap.data() as Partner;
}

export async function getAllPartnersClient(): Promise<Partner[]> {
  const snapshot = await getDocs(collection(db, PARTNERS_COLLECTION));
  return snapshot.docs.map((d) => d.data() as Partner);
}

// ─── Server-Side Read (Firestore REST API — works in server components) ───────

export async function getPartnerBySlugServer(
  eventSlug: string,
  slug: string
): Promise<Partner | null> {
  const docId = `${eventSlug}-${slug}`;
  const url = `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents/${PARTNERS_COLLECTION}/${docId}`;

  try {
    const res = await fetch(url, {
      cache: "no-store", // Always fetch fresh data
    });

    if (res.status === 404) {
      return null;
    }

    if (!res.ok) {
      return null;
    }

    const data = await res.json();
    const fields = data.fields;

    if (!fields) return null;

    return {
      slug: fields.slug?.stringValue ?? "",
      eventSlug: fields.eventSlug?.stringValue ?? "",
      companyName: fields.companyName?.stringValue ?? "",
      title: fields.title?.stringValue ?? "",
      eventName: fields.eventName?.stringValue ?? "",
      driveLink: fields.driveLink?.stringValue ?? "",
      createdAt: fields.createdAt?.stringValue ?? "",
      createdBy: fields.createdBy?.stringValue ?? "",
    };
  } catch {
    return null;
  }
}
