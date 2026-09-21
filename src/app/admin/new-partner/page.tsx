"use client";

import { useState, useMemo } from "react";
import {
  Shield,
  Building2,
  Award,
  CalendarDays,
  Link2,
  Loader2,
  CheckCircle2,
  Copy,
  Check,
  Plus,
  ArrowRight,
} from "lucide-react";
import { createPartner, validateAccessCode } from "@/lib/db";

function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

type FormState = "idle" | "submitting" | "success" | "error";

interface SuccessData {
  slug: string;
  eventSlug: string;
  companyName: string;
  ocName: string;
}

export default function NewPartnerPage() {
  const [accessCode, setAccessCode] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [title, setTitle] = useState("");
  const [driveLink, setDriveLink] = useState("");

  const [formState, setFormState] = useState<FormState>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [shakeCode, setShakeCode] = useState(false);
  const [successData, setSuccessData] = useState<SuccessData | null>(null);
  const [copied, setCopied] = useState(false);

  const slugPreview = useMemo(() => slugify(companyName), [companyName]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormState("submitting");
    setErrorMessage("");

    // Validate access code client-side first (same validation as server)
    const { valid, ocName, eventName, eventSlug } = validateAccessCode(accessCode);
    if (!valid) {
      setFormState("error");
      setErrorMessage("Invalid access code. Please check with your LC / OC.");
      setShakeCode(true);
      setTimeout(() => setShakeCode(false), 600);
      return;
    }

    try {
      // Write directly to Firestore from the client
      const partner = await createPartner(
        { companyName, title, driveLink },
        ocName!,
        eventName!,
        eventSlug!
      );

      setFormState("success");
      setSuccessData({
        slug: partner.slug,
        eventSlug: partner.eventSlug,
        companyName: partner.companyName,
        ocName: ocName!,
      });
    } catch (err: unknown) {
      setFormState("error");
      setErrorMessage(
        err instanceof Error ? err.message : "Something went wrong. Please try again."
      );
    }
  };

  const generatedUrl =
    successData &&
    `${typeof window !== "undefined" ? window.location.origin : ""}/${successData.eventSlug}/${successData.slug}`;

  const handleCopy = async () => {
    if (!generatedUrl) return;
    await navigator.clipboard.writeText(generatedUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setAccessCode("");
    setCompanyName("");
    setTitle("");
    setDriveLink("");
    setFormState("idle");
    setErrorMessage("");
    setSuccessData(null);
    setCopied(false);
  };

  // ── Success State ─────────────────────────────────────────────────────────
  if (formState === "success" && successData) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        {/* Subtle radial glow */}
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-aiesec-blue/5 blur-[120px]" />
        </div>

        <div className="relative w-full max-w-lg animate-scale-in">
          <div className="rounded-2xl border border-border-subtle bg-surface-200/60 p-8 backdrop-blur-sm">
            {/* Success icon */}
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-success" />
              </div>
            </div>

            <h2 className="text-2xl font-bold text-center mb-1">
              Partnership Created! 🎉
            </h2>
            <p className="text-text-secondary text-center mb-2">
              <span className="font-semibold text-text-primary">
                {successData.companyName}
              </span>{" "}
              is now live.
            </p>
            <p className="text-text-tertiary text-sm text-center mb-8">
              Created by {successData.ocName}
            </p>

            {/* URL Display */}
            <div className="mb-6">
              <label className="block text-xs uppercase tracking-wider text-text-tertiary mb-2 font-medium">
                Partner Portal URL
              </label>
              <div className="flex items-center gap-2">
                <div className="flex-1 rounded-lg bg-surface-0 border border-border-light px-4 py-3 text-sm font-mono text-aiesec-blue truncate">
                  {generatedUrl}
                </div>
                <button
                  onClick={handleCopy}
                  className="shrink-0 h-[46px] w-[46px] rounded-lg bg-surface-400 border border-border-light flex items-center justify-center transition-all hover:bg-surface-500 hover:border-aiesec-blue/30"
                  title="Copy link"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-success" />
                  ) : (
                    <Copy className="w-4 h-4 text-text-secondary" />
                  )}
                </button>
              </div>
              {copied && (
                <p className="text-xs text-success mt-2 animate-fade-in">
                  ✓ Copied to clipboard
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={handleReset}
                className="flex-1 rounded-lg border border-border-light bg-surface-300 px-4 py-3 text-sm font-semibold text-text-primary transition-all hover:bg-surface-400 flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Create Another
              </button>
              <a
                href={`/${successData.eventSlug}/${successData.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 rounded-lg btn-primary px-4 py-3 text-sm text-center flex items-center justify-center gap-2"
              >
                View Portal
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Form State ────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      {/* Subtle radial glow */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-aiesec-blue/5 blur-[100px]" />
      </div>

      <div className="relative w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8 animate-stagger animate-fade-in-up">
          <div className="inline-flex items-center gap-2 rounded-full border border-border-accent bg-aiesec-blue-subtle px-4 py-1.5 text-xs font-medium text-aiesec-blue mb-4">
            <Shield className="w-3.5 h-3.5" />
            AIESEC BD Tool
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold gradient-text mb-2">
            Create New Partnership
          </h1>
          <p className="text-text-secondary text-sm">
            Generate a personalized partner portal in seconds ✨
          </p>
        </div>

        {/* Form Card */}
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-border-subtle bg-surface-200/60 p-6 sm:p-8 backdrop-blur-sm animate-stagger animate-fade-in-up delay-200"
        >
          {/* Access Code */}
          <div className={`mb-6 ${shakeCode ? "animate-shake" : ""}`}>
            <label
              htmlFor="accessCode"
              className="flex items-center gap-2 text-sm font-medium text-text-secondary mb-2"
            >
              <Shield className="w-4 h-4 text-aiesec-blue" />
              OC Access Code
            </label>
            <input
              id="accessCode"
              type="password"
              placeholder="Enter your access code"
              value={accessCode}
              onChange={(e) => setAccessCode(e.target.value)}
              required
              className={`w-full rounded-lg bg-surface-0 border ${
                shakeCode ? "border-error" : "border-border-light"
              } px-4 py-3 text-sm text-text-primary placeholder:text-text-tertiary input-focus`}
            />
          </div>

          <div className="h-px bg-border-subtle mb-6" />

          {/* Company Name */}
          <div className="mb-5">
            <label
              htmlFor="companyName"
              className="flex items-center gap-2 text-sm font-medium text-text-secondary mb-2"
            >
              <Building2 className="w-4 h-4 text-text-tertiary" />
              Company Name
            </label>
            <input
              id="companyName"
              type="text"
              placeholder="e.g., JR International"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              required
              className="w-full rounded-lg bg-surface-0 border border-border-light px-4 py-3 text-sm text-text-primary placeholder:text-text-tertiary input-focus"
            />
            {slugPreview && (
              <p className="mt-1.5 text-xs text-text-tertiary flex items-center gap-1">
                <ArrowRight className="w-3 h-3" />
                <span className="font-mono text-aiesec-blue/70">
                  /[event]/{slugPreview}
                </span>
              </p>
            )}
          </div>

          {/* Partnership Title */}
          <div className="mb-5">
            <label
              htmlFor="title"
              className="flex items-center gap-2 text-sm font-medium text-text-secondary mb-2"
            >
              <Award className="w-4 h-4 text-text-tertiary" />
              Partnership Title
            </label>
            <input
              id="title"
              type="text"
              placeholder="e.g., Official Title Sponsor"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full rounded-lg bg-surface-0 border border-border-light px-4 py-3 text-sm text-text-primary placeholder:text-text-tertiary input-focus"
            />
          </div>


          {/* Drive Link */}
          <div className="mb-6">
            <label
              htmlFor="driveLink"
              className="flex items-center gap-2 text-sm font-medium text-text-secondary mb-2"
            >
              <Link2 className="w-4 h-4 text-text-tertiary" />
              Google Drive Link
            </label>
            <input
              id="driveLink"
              type="url"
              placeholder="https://drive.google.com/..."
              value={driveLink}
              onChange={(e) => setDriveLink(e.target.value)}
              required
              className="w-full rounded-lg bg-surface-0 border border-border-light px-4 py-3 text-sm text-text-primary placeholder:text-text-tertiary input-focus"
            />
          </div>

          {/* Error Message */}
          {formState === "error" && errorMessage && (
            <div className="mb-4 rounded-lg bg-error/10 border border-error/20 px-4 py-3 text-sm text-error animate-slide-down">
              {errorMessage}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={formState === "submitting"}
            className="w-full rounded-lg btn-primary px-4 py-3.5 text-sm flex items-center justify-center gap-2"
          >
            {formState === "submitting" ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Creating Portal...
              </>
            ) : (
              <>
                Generate Partner Portal
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <p className="text-center text-xs text-text-tertiary mt-6 animate-stagger animate-fade-in delay-400">
          AIESEC in USJ · BD Tool
        </p>
      </div>
    </div>
  );
}
