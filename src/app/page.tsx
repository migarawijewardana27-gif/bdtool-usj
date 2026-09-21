"use client";

import { useState, useMemo, useEffect } from "react";
import {
  Shield,
  Building2,
  Award,
  Link2,
  Loader2,
  CheckCircle2,
  Copy,
  Check,
  Plus,
  ArrowRight,
  ExternalLink,
  Sparkles,
  Search,
  FolderLock,
  Globe2,
  LogOut,
  FolderOpen,
} from "lucide-react";
import {
  createPartner,
  validateAccessCode,
  slugify,
  getPartnersByEventSlugClient,
  Partner,
} from "@/lib/db";

type TabMode = "create" | "view";
type FormState = "idle" | "submitting" | "success" | "error";

interface SuccessData {
  slug: string;
  eventSlug: string;
  companyName: string;
  ocName: string;
  eventName: string;
  title: string;
}

interface AuthState {
  isAuthenticated: boolean;
  code: string;
  ocName: string;
  eventName: string;
  eventSlug: string;
}

export default function HomePage() {
  // ─── Authentication State ─────────────────────────────────────────────
  const [auth, setAuth] = useState<AuthState | null>(null);
  const [authCodeInput, setAuthCodeInput] = useState("");
  const [authError, setAuthError] = useState("");
  const [authShake, setAuthShake] = useState(false);

  // ─── Dashboard State ────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<TabMode>("create");

  // ─── Create Form State ──────────────────────────────────────────────
  const [companyName, setCompanyName] = useState("");
  const [title, setTitle] = useState("");
  const [driveLink, setDriveLink] = useState("");
  const [formState, setFormState] = useState<FormState>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [successData, setSuccessData] = useState<SuccessData | null>(null);
  const [copied, setCopied] = useState(false);

  // Derived slug preview
  const slugPreview = useMemo(() => slugify(companyName), [companyName]);

  // ─── View Portals State ─────────────────────────────────────────────
  const [portals, setPortals] = useState<Partner[]>([]);
  const [isLoadingPortals, setIsLoadingPortals] = useState(false);
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);

  // ─── Auth Handlers ──────────────────────────────────────────────────
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");

    const { valid, ocName, eventName, eventSlug } = validateAccessCode(
      authCodeInput
    );
    if (!valid) {
      setAuthError("Invalid access code.");
      setAuthShake(true);
      setTimeout(() => setAuthShake(false), 600);
      return;
    }

    setAuth({
      isAuthenticated: true,
      code: authCodeInput,
      ocName: ocName!,
      eventName: eventName!,
      eventSlug: eventSlug!,
    });
    setAuthCodeInput("");
  };

  const handleLogout = () => {
    setAuth(null);
    setActiveTab("create");
    setPortals([]);
    handleResetCreateForm();
  };


  // ─── Create Handlers ────────────────────────────────────────────────
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth) return;

    setFormState("submitting");
    setErrorMessage("");

    try {
      const partner = await createPartner(
        { companyName, title, driveLink },
        auth.ocName,
        auth.eventName,
        auth.eventSlug
      );

      setFormState("success");
      setSuccessData({
        slug: partner.slug,
        eventSlug: partner.eventSlug,
        companyName: partner.companyName,
        ocName: auth.ocName,
        eventName: auth.eventName,
        title: partner.title,
      });
    } catch (err: unknown) {
      setFormState("error");
      setErrorMessage(
        err instanceof Error ? err.message : "Something went wrong."
      );
    }
  };

  const handleResetCreateForm = () => {
    setCompanyName("");
    setTitle("");
    setDriveLink("");
    setFormState("idle");
    setErrorMessage("");
    setSuccessData(null);
    setCopied(false);
  };

  const generatedUrl =
    successData &&
    `${typeof window !== "undefined" ? window.location.origin : ""}/${
      successData.eventSlug
    }/${successData.slug}`;

  const handleCopyCreate = async () => {
    if (!generatedUrl) return;
    await navigator.clipboard.writeText(generatedUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // ─── View Handlers ──────────────────────────────────────────────────
  useEffect(() => {
    if (auth?.isAuthenticated && activeTab === "view") {
      const fetchPortals = async () => {
        setIsLoadingPortals(true);
        try {
          const data = await getPartnersByEventSlugClient(auth.eventSlug);
          // Sort by creation date descending (newest first)
          setPortals(
            data.sort(
              (a, b) =>
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime()
            )
          );
        } catch (error) {
          console.error("Failed to fetch portals:", error);
        } finally {
          setIsLoadingPortals(false);
        }
      };
      fetchPortals();
    }
  }, [auth, activeTab]);

  const handleCopyExisting = async (eventSlug: string, slug: string) => {
    const url = `${
      typeof window !== "undefined" ? window.location.origin : ""
    }/${eventSlug}/${slug}`;
    await navigator.clipboard.writeText(url);
    setCopiedSlug(slug);
    setTimeout(() => setCopiedSlug(null), 2000);
  };

  // ─── RENDER ─────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen flex flex-col bg-surface-0 text-text-primary selection:bg-aiesec-blue/30 relative overflow-hidden">
      {/* ── Background Glow ─────────────────────────────────────────── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[500px] rounded-full bg-aiesec-blue/10 blur-[150px]" />
        <div className="absolute top-1/3 -left-40 w-[600px] h-[600px] rounded-full bg-[#037EF3]/5 blur-[140px]" />
        <div className="absolute -bottom-40 -right-40 w-[700px] h-[700px] rounded-full bg-[#00A887]/5 blur-[160px]" />
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.15) 1px, transparent 1px)",
            backgroundSize: "64px 64px",
          }}
        />
      </div>

      {/* ── Navigation Header ──────────────────────────────────────── */}
      <header className="relative z-20 border-b border-border-subtle/80 bg-surface-0/60 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-aiesec-blue-dark to-aiesec-blue flex items-center justify-center shadow-lg shadow-aiesec-blue/20">
              <span className="text-white font-extrabold text-sm tracking-wider">
                USJ
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold tracking-tight text-text-primary">
                  AIESEC in USJ
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-aiesec-blue-subtle text-aiesec-blue font-medium border border-aiesec-blue/20">
                  BD Tool
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {auth?.isAuthenticated ? (
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 text-xs font-semibold text-text-secondary hover:text-error transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                Logout
              </button>
            ) : (
              <div className="hidden sm:flex items-center gap-2 text-xs text-text-tertiary">
                <span className="inline-flex h-2 w-2 rounded-full bg-success animate-pulse" />
                <span>System Online</span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ── Main Content Area ──────────────────────────────────────── */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center w-full max-w-6xl mx-auto px-6 py-10 sm:py-16">
        
        {/* ── UNauthenticated View (Login Gateway) ─────────────────── */}
        {!auth?.isAuthenticated ? (
          <div className="w-full max-w-md animate-fade-in-up">
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 rounded-full border border-border-accent bg-aiesec-blue-subtle px-4 py-1.5 text-xs font-medium text-aiesec-blue mb-5 shadow-sm">
                <Shield className="w-3.5 h-3.5" />
                Secure Gateway
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-3">
                <span className="gradient-text">Partner Portal</span>
              </h1>
              <p className="text-sm text-text-secondary">
                Enter your access code to manage corporate deliverables.
              </p>
            </div>

            <div className="shimmer-border rounded-3xl">
              <form
                onSubmit={handleLogin}
                className="rounded-3xl border border-border-subtle bg-surface-200/80 p-8 backdrop-blur-xl shadow-2xl transition-all"
              >
                <div className={`mb-6 ${authShake ? "animate-shake" : ""}`}>
                  <label
                    htmlFor="authCode"
                    className="block text-sm font-medium text-text-secondary mb-2"
                  >
                    Access Code
                  </label>
                  <input
                    id="authCode"
                    type="password"
                    placeholder="Enter 4-digit code"
                    value={authCodeInput}
                    onChange={(e) => setAuthCodeInput(e.target.value)}
                    required
                    maxLength={10}
                    className={`w-full rounded-xl bg-surface-0 border ${
                      authShake ? "border-error" : "border-border-light"
                    } px-4 py-3.5 text-sm text-text-primary placeholder:text-text-tertiary input-focus`}
                  />
                  {authError && (
                    <p className="mt-2 text-xs text-error animate-slide-down">
                      {authError}
                    </p>
                  )}
                </div>
                

                <button
                  type="submit"
                  className="w-full rounded-xl btn-primary px-5 py-4 text-sm font-semibold flex items-center justify-center gap-2 shadow-lg shadow-aiesec-blue/20"
                >
                  Authenticate <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>
        ) : (
          /* ── Authenticated View (Dashboard) ───────────────────────── */
          <div className="w-full flex flex-col items-center animate-fade-in">
            
            {/* Dashboard Header */}
            <div className="text-center max-w-3xl mb-10 w-full">
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-2">
                <span className="gradient-text">Welcome,</span>{" "}
                <span className="gradient-text-blue">{auth.ocName}</span>
              </h1>
              <p className="text-base text-text-secondary">
                Managing portals for:{" "}
                <strong className="text-text-primary">{auth.eventName}</strong>
              </p>

              {/* Tab Switcher */}
              <div className="inline-flex p-1 rounded-xl bg-surface-200 border border-border-light mt-8">
                <button
                  onClick={() => setActiveTab("create")}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                    activeTab === "create"
                      ? "bg-aiesec-blue text-white shadow-md shadow-aiesec-blue/25"
                      : "text-text-secondary hover:text-text-primary"
                  }`}
                >
                  <Plus className="w-4 h-4" />
                  Add New Portal
                </button>
                <button
                  onClick={() => setActiveTab("view")}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                    activeTab === "view"
                      ? "bg-surface-400 text-white shadow-sm"
                      : "text-text-secondary hover:text-text-primary"
                  }`}
                >
                  <FolderOpen className="w-4 h-4" />
                  View Portals
                </button>
              </div>
            </div>

            {/* Dashboard Tabs Content */}
            {activeTab === "create" && (
              <div className="w-full max-w-xl animate-scale-in">
                {formState === "success" && successData ? (
                  /* Success Card */
                  <div className="rounded-3xl border border-border-accent bg-surface-200/90 p-8 sm:p-10 backdrop-blur-xl shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-aiesec-blue/10 rounded-full blur-2xl pointer-events-none" />

                    <div className="flex justify-center mb-6">
                      <div className="w-16 h-16 rounded-2xl bg-success/15 border border-success/30 flex items-center justify-center shadow-lg shadow-success/10">
                        <CheckCircle2 className="w-8 h-8 text-success" />
                      </div>
                    </div>

                    <div className="text-center mb-8">
                      <span className="text-xs uppercase tracking-widest text-aiesec-blue font-semibold">
                        Portal Successfully Created
                      </span>
                      <h2 className="text-2xl sm:text-3xl font-bold text-text-primary mt-1 mb-2">
                        {successData.companyName}
                      </h2>
                      <p className="text-sm text-text-secondary">
                        Recognized as{" "}
                        <span className="text-text-primary font-medium">
                          {successData.title}
                        </span>{" "}
                        for{" "}
                        <span className="text-text-primary font-medium">
                          {successData.eventName}
                        </span>
                      </p>
                    </div>

                    {/* URL Display Box */}
                    <div className="mb-8">
                      <label className="block text-xs uppercase tracking-wider text-text-tertiary mb-2 font-medium">
                        Live Partner Portal Link
                      </label>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 rounded-xl bg-surface-0/90 border border-border-light px-4 py-3.5 text-sm font-mono text-aiesec-blue truncate select-all">
                          {generatedUrl}
                        </div>
                        <button
                          onClick={handleCopyCreate}
                          className="shrink-0 h-[48px] w-[48px] rounded-xl bg-surface-300 border border-border-light flex items-center justify-center transition-all hover:bg-surface-400 hover:border-aiesec-blue/40 active:scale-95"
                          title="Copy link"
                        >
                          {copied ? (
                            <Check className="w-5 h-5 text-success" />
                          ) : (
                            <Copy className="w-5 h-5 text-text-secondary" />
                          )}
                        </button>
                      </div>
                      {copied && (
                        <p className="text-xs text-success mt-2 animate-fade-in font-medium flex items-center gap-1.5">
                          <Check className="w-3.5 h-3.5" /> Copied directly to
                          clipboard
                        </p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row gap-3">
                      <button
                        onClick={handleResetCreateForm}
                        className="flex-1 rounded-xl border border-border-light bg-surface-300 px-5 py-3.5 text-sm font-semibold text-text-primary transition-all hover:bg-surface-400 flex items-center justify-center gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        Create Another
                      </button>
                      <a
                        href={`/${successData.eventSlug}/${successData.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 rounded-xl btn-primary px-5 py-3.5 text-sm text-center flex items-center justify-center gap-2"
                      >
                        Open Live Portal
                        <ArrowRight className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                ) : (
                  /* Creation Form */
                  <div className="shimmer-border rounded-3xl">
                    <form
                      onSubmit={handleCreateSubmit}
                      className="rounded-3xl border border-border-subtle bg-surface-200/80 p-6 sm:p-9 backdrop-blur-xl shadow-2xl transition-all"
                    >
                      {/* Company / Partner Name */}
                      <div className="mb-5">
                        <label
                          htmlFor="companyName"
                          className="flex items-center gap-2 text-sm font-medium text-text-secondary mb-2"
                        >
                          <Building2 className="w-4 h-4 text-text-tertiary" />
                          Partner / Company Name
                        </label>
                        <input
                          id="companyName"
                          type="text"
                          placeholder="e.g., Unilever Sri Lanka, Dialog"
                          value={companyName}
                          onChange={(e) => setCompanyName(e.target.value)}
                          required
                          className="w-full rounded-xl bg-surface-0 border border-border-light px-4 py-3.5 text-sm text-text-primary placeholder:text-text-tertiary input-focus"
                        />
                        {slugPreview && (
                          <p className="mt-2 text-xs text-text-tertiary flex items-center gap-1 font-mono">
                            <ArrowRight className="w-3 h-3 text-aiesec-blue" />
                            <span className="text-aiesec-blue/80">
                              /{auth.eventSlug}/{slugPreview}
                            </span>
                          </p>
                        )}
                      </div>

                      {/* Title / Designation */}
                      <div className="mb-5">
                        <label
                          htmlFor="title"
                          className="flex items-center gap-2 text-sm font-medium text-text-secondary mb-2"
                        >
                          <Award className="w-4 h-4 text-text-tertiary" />
                          Partnership Title / Identified As
                        </label>
                        <input
                          id="title"
                          type="text"
                          placeholder="e.g., Official Title Partner"
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          required
                          className="w-full rounded-xl bg-surface-0 border border-border-light px-4 py-3.5 text-sm text-text-primary placeholder:text-text-tertiary input-focus"
                        />
                      </div>

                      {/* Deliverables Vault Link */}
                      <div className="mb-6">
                        <label
                          htmlFor="driveLink"
                          className="flex items-center gap-2 text-sm font-medium text-text-secondary mb-2"
                        >
                          <Link2 className="w-4 h-4 text-text-tertiary" />
                          Deliverables Vault (Google Drive Link)
                        </label>
                        <input
                          id="driveLink"
                          type="url"
                          placeholder="https://drive.google.com/drive/folders/..."
                          value={driveLink}
                          onChange={(e) => setDriveLink(e.target.value)}
                          required
                          className="w-full rounded-xl bg-surface-0 border border-border-light px-4 py-3.5 text-sm text-text-primary placeholder:text-text-tertiary input-focus"
                        />
                      </div>

                      {/* Error Notification */}
                      {formState === "error" && errorMessage && (
                        <div className="mb-5 rounded-xl bg-error/10 border border-error/25 px-4 py-3 text-sm text-error animate-slide-down">
                          {errorMessage}
                        </div>
                      )}

                      {/* Submit Button */}
                      <button
                        type="submit"
                        disabled={formState === "submitting"}
                        className="w-full rounded-xl btn-primary px-5 py-4 text-sm font-semibold flex items-center justify-center gap-2 shadow-lg shadow-aiesec-blue/20"
                      >
                        {formState === "submitting" ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Generating Portal...
                          </>
                        ) : (
                          <>
                            Generate Partner Portal
                            <ArrowRight className="w-4 h-4" />
                          </>
                        )}
                      </button>
                    </form>
                  </div>
                )}
              </div>
            )}

            {activeTab === "view" && (
              <div className="w-full max-w-4xl animate-scale-in">
                {isLoadingPortals ? (
                  <div className="flex flex-col items-center justify-center py-20 text-text-tertiary">
                    <Loader2 className="w-8 h-8 animate-spin text-aiesec-blue mb-4" />
                    <p className="text-sm">Fetching your portals...</p>
                  </div>
                ) : portals.length === 0 ? (
                  <div className="rounded-3xl border border-border-subtle bg-surface-200/80 p-12 text-center backdrop-blur-xl">
                    <FolderOpen className="w-12 h-12 text-text-tertiary mx-auto mb-4 opacity-50" />
                    <h3 className="text-xl font-semibold text-text-primary mb-2">
                      No Portals Found
                    </h3>
                    <p className="text-sm text-text-secondary">
                      You haven&apos;t generated any partner portals for{" "}
                      {auth.eventName} yet.
                    </p>
                    <button
                      onClick={() => setActiveTab("create")}
                      className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-surface-400 text-sm font-semibold hover:bg-surface-500 transition-colors"
                    >
                      <Plus className="w-4 h-4" /> Create Your First Portal
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {portals.map((p) => (
                      <div
                        key={p.slug}
                        className="rounded-2xl border border-border-subtle bg-surface-200/60 p-5 backdrop-blur-md hover:bg-surface-300/80 hover:border-aiesec-blue/30 transition-all flex flex-col justify-between group shadow-lg"
                      >
                        <div>
                          <div className="flex items-start justify-between mb-3">
                            <h3 className="text-lg font-bold text-text-primary leading-tight">
                              {p.companyName}
                            </h3>
                            <div className="px-2 py-1 rounded bg-surface-400 text-[10px] uppercase tracking-wider text-text-tertiary">
                              {new Date(p.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                          <p className="text-sm text-text-secondary mb-1">
                            {p.title}
                          </p>
                        </div>

                        <div className="mt-5 flex gap-2">
                          <a
                            href={`/${p.eventSlug}/${p.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 rounded-lg bg-aiesec-blue/10 border border-aiesec-blue/30 text-aiesec-blue px-3 py-2 text-xs font-semibold text-center flex items-center justify-center gap-1.5 hover:bg-aiesec-blue hover:text-white transition-colors"
                          >
                            <ExternalLink className="w-3.5 h-3.5" /> Open
                          </a>
                          <button
                            onClick={() =>
                              handleCopyExisting(p.eventSlug, p.slug)
                            }
                            className="shrink-0 w-9 h-9 rounded-lg bg-surface-400 border border-border-light flex items-center justify-center hover:bg-surface-500 transition-colors"
                            title="Copy Link"
                          >
                            {copiedSlug === p.slug ? (
                              <Check className="w-4 h-4 text-success" />
                            ) : (
                              <Copy className="w-4 h-4 text-text-secondary" />
                            )}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>

      {/* ── Footer ─────────────────────────────────────────────────── */}
      <footer className="relative z-10 border-t border-border-subtle/80 bg-surface-0/80 py-8 mt-auto">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-text-tertiary">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-text-secondary">
              AIESEC in University of Sri Jayewardenepura
            </span>
            <span>·</span>
            <span>Business Development</span>
          </div>
          <div className="flex items-center gap-4">
            <span>© {new Date().getFullYear()} All rights reserved</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
