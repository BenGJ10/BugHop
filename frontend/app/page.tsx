"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { SignInButton, SignUpButton, useAuth } from "@clerk/nextjs";
import { AppFooter } from "@/components/layout/app-footer";
import { Bug } from "lucide-react";

const problemCards = [
  {
    label: "Inconsistent Reviews",
    title: "Quality drifts across teams.",
    copy: "Different reviewers, different standards. Critical issues slip through or block shipping.",
    index: "001",
  },
  {
    label: "Slow Feedback",
    title: "Bottlenecks stall merges.",
    copy: "Manual review cycles stretch hours into days, especially when the team is in the flow.",
    index: "002",
  },
  {
    label: "Hidden Risk",
    title: "Security gaps hide in plain sight.",
    copy: "Auth, data, and performance issues show up late when they are most expensive.",
    index: "003",
  },
  {
    label: "Reviewer Burnout",
    title: "Humans burn out on noise.",
    copy: "Repetitive lint and style feedback drains senior reviewers and slows momentum.",
    index: "004",
  },
];

const bars = [
  { left: "4%", top: "10px", width: "110px" },
  { left: "14%", top: "54px", width: "80px" },
  { left: "24%", top: "26px", width: "140px" },
  { left: "40%", top: "8px", width: "90px" },
  { left: "48%", top: "46px", width: "160px" },
  { left: "60%", top: "20px", width: "100px" },
  { left: "68%", top: "70px", width: "140px" },
  { left: "78%", top: "34px", width: "90px" },
  { left: "86%", top: "64px", width: "120px" },
  { left: "10%", top: "92px", width: "150px" },
  { left: "46%", top: "92px", width: "110px" },
  { left: "74%", top: "96px", width: "130px" },
];

const benefits = [
  {
    label: "Speed",
    title: "Merge faster",
    copy: "Automated reviews land in minutes, not days. Keep momentum without waiting on humans.",
  },
  {
    label: "Quality",
    title: "Raise the bar",
    copy: "Consistent standards across every PR with rules tailored to your team.",
  },
  {
    label: "Signal",
    title: "Cut the noise",
    copy: "BugHop focuses on real issues so senior reviewers can focus on architecture.",
  },
];

export default function Home() {
  const { isSignedIn, isLoaded } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.push("/dashboard");
    }
  }, [isLoaded, isSignedIn, router]);

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0707]">
        <div className="w-8 h-8 rounded-full border-t-2 border-[#ef3a2d] animate-spin" />
      </div>
    );
  }

  return (
    <div className="rig-page">
      <div className="rig-noise" />

      <nav className="rig-nav fixed top-0 left-0 right-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 border border-white/30 flex items-center justify-center">
              <Bug className="w-5 h-5 text-[#ef3a2d]" />
            </div>
            <span className="rig-logo rig-mono">BugHop</span>
          </div>
          <div className="flex items-center gap-3 sm:gap-5">
            {isSignedIn ? (
              <a href="/dashboard" className="rig-btn rig-btn-primary">Open Dashboard</a>
            ) : (
              <>
                <SignInButton>
                  <button className="text-xs uppercase tracking-[0.25em] text-white/60 hover:text-white transition-colors rig-mono hidden sm:block">
                    Log in
                  </button>
                </SignInButton>
                <SignUpButton>
                  <button className="rig-btn rig-btn-primary">Sign Up</button>
                </SignUpButton>
              </>
            )}
          </div>
        </div>
      </nav>

      <main className="pt-16">
        <section className="rig-hero">
          <div className="rig-hero-grid" />
          <div className="rig-hero-glow" />
          <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-20 pb-20 sm:pt-28 sm:pb-24 relative z-10">
            <div className="rig-tag rig-mono">Introducing BugHop</div>
            <h1 className="rig-hero-title font-display mt-8">
              Autonomous AI code review.
              <br />
              Ship with confidence, faster.
            </h1>
            <p className="rig-hero-sub mt-6">
              BugHop reviews every PR and issue the moment it opens. Get consistent standards, contextual findings, and safer releases without slowing the team.
            </p>
            <div className="rig-hero-actions">
              {isSignedIn ? (
                <>
                  <a href="/dashboard" className="rig-btn rig-btn-primary">
                    Open Dashboard
                  </a>
                  <a href="/repositories" className="rig-btn rig-btn-secondary">
                    View Repositories
                  </a>
                </>
              ) : (
                <>
                  <SignUpButton>
                    <button className="rig-btn rig-btn-primary">Get Started</button>
                  </SignUpButton>
                  <a href="#approach" className="rig-btn rig-btn-secondary">
                    Our Approach
                  </a>
                </>
              )}
            </div>
          </div>
          <div className="rig-divider" />
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
            <div className="rig-ticker rig-mono">
              <span>PR Review Agent</span>
              <span>GitHub Native</span>
              <span>Contextual Findings</span>
              <span>Custom Review Rules</span>
              <span>Codebase Chat</span>
            </div>
          </div>
        </section>

        <section id="problem" className="relative bg-[#0b0808]">
          <div className="rig-grid-lines" />
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-24 relative z-10 grid lg:grid-cols-[1.1fr_1fr] gap-12">
            <div>
              <div className="rig-tag rig-mono">The Problem</div>
              <h2 className="rig-section-title font-display mt-6">
                Reviews do not scale.
                <br />
                And quality drifts fast.
              </h2>
              <p className="rig-section-sub mt-6">
                As teams grow, manual review becomes inconsistent and late. BugHop makes review instant, consistent, and contextual.
              </p>
              <div className="mt-12">
                <div className="rig-radar">
                  <span className="rig-radar-ring" />
                  <span className="rig-radar-ring ring-2" />
                  <span className="rig-radar-ring ring-3" />
                  <span className="rig-radar-line" />
                  <span className="rig-radar-line line-x" />
                  <span className="rig-radar-dot" />
                </div>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              {problemCards.map((card) => (
                <div key={card.index} className="rig-card">
                  <div className="flex items-center justify-between mb-3">
                    <span className="rig-card-meta">{card.label}</span>
                    <span className="rig-card-meta">{card.index}</span>
                  </div>
                  <div className="rig-card-title">{card.title}</div>
                  <p className="text-sm text-white/60 leading-relaxed">{card.copy}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-[#0b0808]">
          <div className="max-w-6xl mx-auto px-6">
            <div className="rig-bars">
              {bars.map((bar, index) => (
                <span
                  key={`${bar.left}-${bar.top}`}
                  className="rig-bar"
                  style={{
                    left: bar.left,
                    top: bar.top,
                    width: bar.width,
                    animationDelay: `${index * 0.2}s`,
                  }}
                />
              ))}
            </div>
          </div>
        </section>

        <section id="approach" className="bg-[#0b0808]">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16 sm:py-24 text-center">
            <div className="rig-tag rig-mono">Introducing BugHop</div>
            <h2 className="rig-section-title font-display mt-6">
              BugHop lives in your workflow.
              <br />
              Own every review.
            </h2>
            <p className="rig-section-sub mt-6 mx-auto">
              BugHop indexes your repo, understands context, and posts actionable findings directly on PRs and issues.
            </p>
            <div className="rig-diagram">
              <div className="rig-diagram-line" />
              <div className="rig-diagram-grid rig-mono">
                <div className="rig-diagram-box">Repo Events</div>
                <div className="rig-diagram-box rig-diagram-core">BugHop AI</div>
                <div className="rig-diagram-box">Review Comments</div>
              </div>
              <div className="mt-6 flex flex-wrap justify-between gap-4 text-[0.65rem] uppercase tracking-[0.3em] text-white/40 rig-mono">
                <span>PR + Issue Signals</span>
                <span>Context + Rules + LLM</span>
                <span>Immediate Feedback</span>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-[#0a0707]">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-24 grid lg:grid-cols-[1fr_1.1fr] gap-12 items-center">
            <div className="rig-orbit">
              <span className="rig-orbit-ring" />
              <span className="rig-orbit-ring ring-2" />
              <span className="rig-orbit-ring ring-3" />
              <span className="rig-orbit-node" />
            </div>
            <div>
              <div className="rig-tag rig-mono">Always On</div>
              <h2 className="rig-section-title font-display mt-6">Review in real time</h2>
              <p className="rig-section-sub mt-6">
                BugHop posts feedback the moment PRs open. No waiting for a reviewer to jump in.
              </p>
            </div>
          </div>
        </section>

        <section className="bg-[#0a0707] pb-24">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 grid md:grid-cols-3 gap-5">
            {benefits.map((item) => (
              <div key={item.label} className="rig-benefit">
                <div className="rig-card-meta">{item.label}</div>
                <h3 className="text-lg font-semibold mt-4">{item.title}</h3>
                <p className="text-sm text-white/60 mt-3 leading-relaxed">{item.copy}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rig-cta">
          <div className="rig-wireframe" />
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16 sm:py-24 text-center relative z-10">
            <h2 className="rig-cta-title font-display">Break free from slow reviews</h2>
            <div className="mt-10">
              {isSignedIn ? (
                <a href="/dashboard" className="rig-btn rig-btn-cta">Open Dashboard -&gt;</a>
              ) : (
                <SignUpButton>
                  <button className="rig-btn rig-btn-cta">Get Started -&gt;</button>
                </SignUpButton>
              )}
            </div>
            <p className="mt-5 text-xs uppercase tracking-[0.3em] text-white/40 rig-mono">
              {isSignedIn ? "Live now in your workspace." : "Autonomous code review for your team."}
            </p>
          </div>
        </section>
      </main>

      <AppFooter />
    </div>
  );
}
