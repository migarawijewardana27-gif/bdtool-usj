import { notFound } from "next/navigation";
import { getPartnerBySlugServer } from "@/lib/db";
import type { Metadata } from "next";
import Image from "next/image";
import {
  FolderOpen,
  ExternalLink,
  Sparkles,
  ArrowUpRight,
} from "lucide-react";

// ── Dynamic Metadata ────────────────────────────────────────────────────────

type PageProps = {
  params: Promise<{ eventSlug: string; partnerSlug: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { eventSlug, partnerSlug } = await params;
  const partner = await getPartnerBySlugServer(eventSlug, partnerSlug);

  if (!partner) {
    return { title: "Partner Not Found | AIESEC" };
  }

  return {
    title: `${partner.companyName} — Partner Portal | AIESEC`,
    description: `Welcome to the exclusive partner portal for ${partner.companyName}, ${partner.title} of ${partner.eventName}. Access your campaign deliverables.`,
  };
}

// ── Page Component ──────────────────────────────────────────────────────────

export default async function PartnerPage({ params }: PageProps) {
  const { eventSlug, partnerSlug } = await params;
  const partner = await getPartnerBySlugServer(eventSlug, partnerSlug);

  if (!partner) {
    notFound();
  }

  if (eventSlug === "natcon-2026") {
    return <NatConPartnerPage partner={partner} />;
  }

  return <DefaultPartnerPage partner={partner} eventSlug={eventSlug} />;
}

// ── Default Theme (Dark Mode / Glassmorphism) ───────────────────────────────

function DefaultPartnerPage({
  partner,
  eventSlug,
}: {
  partner: any;
  eventSlug: string;
}) {
  return (
    <div className="min-h-screen flex flex-col" data-event={eventSlug}>
      {/* ── Background Effects ─────────────────────────────────────────── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {/* Top-right blue glow */}
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-aiesec-blue/4 blur-[150px]" />
        {/* Bottom-left subtle glow */}
        <div className="absolute -bottom-60 -left-60 w-[500px] h-[500px] rounded-full bg-aiesec-blue/3 blur-[120px]" />
        {/* Grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      {/* ── Navigation ─────────────────────────────────────────────────── */}
      <nav className="relative z-10 border-b border-border-subtle">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-aiesec-blue flex items-center justify-center">
              <span className="text-white font-bold text-xs">A</span>
            </div>
            <div>
              <span className="text-sm font-semibold text-text-primary tracking-tight">
                AIESEC
              </span>
              <span className="text-xs text-text-tertiary ml-2 hidden sm:inline">
                Partner Portal
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex h-2 w-2 rounded-full bg-success animate-pulse" />
            <span className="text-xs text-text-tertiary">Active</span>
          </div>
        </div>
      </nav>

      {/* ── Main Content ───────────────────────────────────────────────── */}
      <main className="relative z-10 flex-1 max-w-5xl w-full mx-auto px-6 py-12 sm:py-20">
        {/* ── Hero ───────────────────────────────────────────────────── */}
        <section className="mb-12 sm:mb-16 animate-stagger animate-fade-in-up">
          <p className="text-sm text-text-tertiary mb-3 uppercase tracking-widest font-medium">
            Welcome to the Partner Portal
          </p>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-4">
            <span className="gradient-text">Hello,</span>{" "}
            <span className="text-aiesec-blue">{partner.companyName}</span>
          </h1>
          <p className="text-lg text-text-secondary max-w-xl">
            Thank you for being an incredible partner. Below you&apos;ll find
            everything related to your partnership deliverables.
          </p>
        </section>

        {/* ── Partnership Badge ──────────────────────────────────────── */}
        <section className="mb-12 sm:mb-16 animate-stagger animate-fade-in-up delay-200">
          <div className="inline-flex items-center gap-3 rounded-2xl glass border-aiesec-blue/20 px-6 py-4 animate-pulse-glow">
            <Sparkles className="w-5 h-5 text-aiesec-blue shrink-0" />
            <div>
              <p className="text-xs text-text-tertiary uppercase tracking-wider mb-0.5 font-medium">
                Partnership Status
              </p>
              <p className="text-sm sm:text-base font-semibold text-text-primary">
                Proud{" "}
                <span className="text-aiesec-blue">{partner.title}</span> of{" "}
                <span className="text-text-primary">{partner.eventName}</span>
              </p>
            </div>
          </div>
        </section>

        {/* ── The Vault Card ─────────────────────────────────────────── */}
        <section className="animate-stagger animate-fade-in-up delay-400">
          <div className="shimmer-border rounded-2xl">
            <div className="rounded-2xl bg-surface-200/80 border border-border-subtle p-8 sm:p-10 backdrop-blur-sm transition-all duration-300 hover:bg-surface-300/60 hover:-translate-y-0.5">
              {/* Card Header */}
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-aiesec-blue/10 border border-aiesec-blue/20 flex items-center justify-center">
                    <FolderOpen className="w-6 h-6 text-aiesec-blue" />
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-text-primary">
                      Campaign Deliverables
                    </h2>
                    <p className="text-sm text-text-tertiary">The Vault</p>
                  </div>
                </div>
                <div className="hidden sm:flex items-center gap-1.5 rounded-full bg-success/10 border border-success/20 px-3 py-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-success" />
                  <span className="text-xs font-medium text-success">
                    Ready
                  </span>
                </div>
              </div>

              {/* Card Description */}
              <p className="text-text-secondary mb-8 max-w-lg leading-relaxed">
                Access your complete campaign assets, creative materials,
                performance reports, and all partnership documentation. Everything
                has been organized and is ready for your review.
              </p>

              {/* Stats Row */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
                <div className="rounded-xl bg-surface-0/60 border border-border-subtle p-4">
                  <p className="text-xs text-text-tertiary mb-1 uppercase tracking-wider">
                    Event
                  </p>
                  <p className="text-sm font-semibold text-text-primary truncate">
                    {partner.eventName}
                  </p>
                </div>
                <div className="rounded-xl bg-surface-0/60 border border-border-subtle p-4">
                  <p className="text-xs text-text-tertiary mb-1 uppercase tracking-wider">
                    Partnership
                  </p>
                  <p className="text-sm font-semibold text-text-primary truncate">
                    {partner.title}
                  </p>
                </div>
                <div className="hidden sm:block rounded-xl bg-surface-0/60 border border-border-subtle p-4">
                  <p className="text-xs text-text-tertiary mb-1 uppercase tracking-wider">
                    Status
                  </p>
                  <p className="text-sm font-semibold text-success">
                    Delivered ✓
                  </p>
                </div>
              </div>

              {/* CTA Button */}
              <a
                href={partner.driveLink}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-3 rounded-xl btn-primary px-8 py-4 text-base"
              >
                <ExternalLink className="w-5 h-5" />
                Access The Vault
                <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </a>
            </div>
          </div>
        </section>
      </main>

      {/* ── Footer ─────────────────────────────────────────────────────── */}
      <footer className="relative z-10 border-t border-border-subtle">
        <div className="max-w-5xl mx-auto px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-text-tertiary">
            Powered by{" "}
            <span className="font-semibold text-text-secondary">
              AIESEC in Sri Lanka
            </span>
          </p>
          <p className="text-xs text-text-tertiary">
            © {new Date().getFullYear()} · All rights reserved
          </p>
        </div>
      </footer>
    </div>
  );
}

// ── NatCon 2026 Theme (Sri Lankan Aesthetics) ──────────────────────────────

function NatConPartnerPage({ partner }: { partner: any }) {
  return (
    <div className="min-h-screen flex flex-col bg-[#05332C] text-[#F5F1E6] overflow-hidden" data-event="natcon-2026">
      {/* ── Rich Cultural Background Elements ──────────────────────────── */}
      <div className="fixed inset-0 pointer-events-none">
        {/* Large Golden Sun/Glow */}
        <div className="absolute top-[-10%] right-[-10%] w-[800px] h-[800px] rounded-full bg-[#F7B818]/10 blur-[150px]" />
        {/* Deep Red Glow */}
        <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-[#9E1F29]/15 blur-[120px]" />
        
        {/* Abstract Corner Shapes (CSS drawn curves) */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-[#F7B818] rounded-br-[100%] opacity-[0.03]" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#9E1F29] rounded-tl-[100%] opacity-[0.04]" />
        
        {/* Traditional Mandala/Pattern overlay (Subtle dots/grid as fallback) */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: "radial-gradient(#F7B818 2px, transparent 2px)",
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      {/* ── Navigation ─────────────────────────────────────────────────── */}
      <nav className="relative z-10 border-b border-[#F7B818]/20 bg-[#05332C]/80 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="relative w-28 h-10">
            <Image
              src="/natcon.png"
              alt="NatCon 2026 Logo"
              fill
              className="object-contain object-left"
            />
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#F7B818]/30 bg-[#F7B818]/10">
            <span className="inline-flex h-2 w-2 rounded-full bg-[#F7B818] animate-pulse" />
            <span className="text-xs font-medium text-[#F7B818] uppercase tracking-widest">Active Portal</span>
          </div>
        </div>
      </nav>

      {/* ── Main Content ───────────────────────────────────────────────── */}
      <main className="relative z-10 flex-1 max-w-4xl w-full mx-auto px-6 py-12 sm:py-20 flex flex-col justify-center">
        
        {/* Decorative Top Border for Content */}
        <div className="w-full flex justify-center mb-12 animate-fade-in-up">
          <div className="flex items-center gap-4">
            <div className="h-px w-16 sm:w-32 bg-gradient-to-r from-transparent to-[#F7B818]/50" />
            <div className="w-3 h-3 rotate-45 border border-[#F7B818] bg-[#9E1F29]" />
            <div className="h-px w-16 sm:w-32 bg-gradient-to-l from-transparent to-[#F7B818]/50" />
          </div>
        </div>

        {/* ── Hero ───────────────────────────────────────────────────── */}
        <section className="text-center mb-16 animate-fade-in-up delay-100">
          <p className="text-sm text-[#F7B818] mb-4 uppercase tracking-[0.3em] font-semibold">
            Official Partner Deliverables
          </p>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight mb-6 font-heading text-[#F7B818]">
            <span className="text-[#F5F1E6]">Welcome,</span><br/>
            {partner.companyName}
          </h1>
          <p className="text-lg sm:text-xl text-[#F5F1E6]/80 max-w-2xl mx-auto leading-relaxed">
            The journey to NatCon 2026 is fueled by your support. Access your campaign assets and witness the impact of our partnership.
          </p>
        </section>

        {/* ── Deliverables Card (Themed) ─────────────────────────────── */}
        <section className="animate-fade-in-up delay-300">
          <div className="relative p-1 rounded-2xl bg-gradient-to-b from-[#F7B818]/40 to-[#9E1F29]/20 shadow-[0_0_40px_rgba(247,184,24,0.1)]">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20 mix-blend-overlay rounded-2xl" />
            
            <div className="relative rounded-[14px] bg-[#074037] border border-[#0A4A40] p-8 sm:p-12 text-center sm:text-left overflow-hidden">
              
              {/* Corner Accents inside card */}
              <div className="absolute top-0 left-0 w-16 h-16 border-t-2 border-l-2 border-[#F7B818]/30 rounded-tl-[14px]" />
              <div className="absolute bottom-0 right-0 w-16 h-16 border-b-2 border-r-2 border-[#F7B818]/30 rounded-br-[14px]" />

              <div className="flex flex-col sm:flex-row items-center gap-8">
                {/* Left Side: Info */}
                <div className="flex-1">
                  <div className="inline-flex items-center gap-2 rounded-full border border-[#9E1F29]/30 bg-[#9E1F29]/10 px-4 py-1.5 mb-6">
                    <Sparkles className="w-4 h-4 text-[#F7B818]" />
                    <span className="text-sm font-semibold text-[#F7B818]">
                      Proud {partner.title}
                    </span>
                  </div>
                  
                  <h2 className="text-3xl sm:text-4xl font-bold font-heading mb-4 text-[#F5F1E6]">
                    Your Campaign Assets
                  </h2>
                  <p className="text-[#F5F1E6]/70 mb-8 max-w-md mx-auto sm:mx-0 text-base leading-relaxed">
                    Everything you need for the National Conference 2026. Creative materials, performance reports, and official branding collateral.
                  </p>

                  <a
                    href={partner.driveLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex items-center gap-3 rounded-none border-2 border-[#F7B818] bg-[#F7B818] px-8 py-4 text-[#05332C] font-bold text-lg transition-all hover:bg-transparent hover:text-[#F7B818]"
                  >
                    <FolderOpen className="w-5 h-5" />
                    Access Deliverables
                    <ArrowUpRight className="w-5 h-5 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                  </a>
                </div>

                {/* Right Side: Visual Ornament */}
                <div className="hidden sm:flex shrink-0 w-48 h-48 rounded-full border-4 border-[#9E1F29]/20 relative items-center justify-center">
                  <div className="absolute inset-2 rounded-full border-2 border-[#F7B818]/40 border-dashed animate-[spin_20s_linear_infinite]" />
                  <div className="w-32 h-32 rounded-full bg-gradient-to-tr from-[#F7B818] to-[#9E1F29] opacity-20 blur-xl absolute" />
                  <div className="z-10 text-center">
                    <span className="block text-4xl font-heading text-[#F7B818]">NC</span>
                    <span className="block text-xs uppercase tracking-widest text-[#F5F1E6]/60 mt-1">2026</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Decorative Bottom Border */}
        <div className="w-full flex justify-center mt-12 animate-fade-in-up delay-500">
          <div className="flex items-center gap-4">
            <div className="h-px w-16 sm:w-32 bg-gradient-to-r from-transparent to-[#9E1F29]/50" />
            <div className="w-2 h-2 rounded-full bg-[#F7B818]" />
            <div className="h-px w-16 sm:w-32 bg-gradient-to-l from-transparent to-[#9E1F29]/50" />
          </div>
        </div>

      </main>

      {/* ── Footer ─────────────────────────────────────────────────────── */}
      <footer className="relative z-10 border-t border-[#F7B818]/10 bg-[#05332C]">
        <div className="max-w-4xl mx-auto px-6 py-8 flex flex-col items-center gap-3">
          <p className="text-sm font-heading text-[#F5F1E6]/80 text-center">
            The face behind the mask. NatCon 2026.
          </p>
          <p className="text-xs text-[#F5F1E6]/40 uppercase tracking-widest">
            Powered by AIESEC in Sri Lanka
          </p>
        </div>
      </footer>
    </div>
  );
}
