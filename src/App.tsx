import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { HackathonProvider, useHackathon } from "./context/HackathonContext";
import { Header } from "./components/Header";
import { LiveStageDashboard } from "./components/LiveStageDashboard";
import { EventDiscoveryView } from "./components/EventDiscoveryView";
import { DuelStageView } from "./components/DuelStageView";
import { ObserverModeOverlay } from "./components/ObserverModeOverlay";
import { AIHostFloatingCompanion } from "./components/AIHostFloatingCompanion";
import { DevlogSection } from "./components/DevlogSection";
import { ProjectsTeamsSection } from "./components/ProjectsTeamsSection";
import { LiveChatView } from "./components/LiveChatView";
import { JudgeDashboard } from "./components/JudgeDashboard";
import { OrganizerDashboard } from "./components/OrganizerDashboard";
import { Leaderboard } from "./components/Leaderboard";
import { ParticipantDashboard } from "./components/ParticipantDashboard";
import { LiveEventTicker } from "./components/LiveEventTicker";
import { AskHostModal } from "./components/AskHostModal";
import { SubmissionModal } from "./components/SubmissionModal";
import { RegisterModal } from "./components/RegisterModal";
import { ShieldCheck, ExternalLink } from "lucide-react";

const MainAppContent: React.FC = () => {
  const { activeDuel, hackathon } = useHackathon();
  const [activeTab, setActiveTab] = useState<string>("live");
  const [isAskHostOpen, setIsAskHostOpen] = useState<boolean>(false);
  const [isSubmissionOpen, setIsSubmissionOpen] = useState<boolean>(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState<boolean>(false);
  const [isObserverOpen, setIsObserverOpen] = useState<boolean>(false);

  const handleOpenFastDevlog = () => {
    setActiveTab("devlog");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--ink)] font-mono flex flex-col selection:bg-[var(--accent)] selection:text-[var(--accent-text)] transition-colors duration-200">
      {/* Persistent Live Scrolling Ticker at the Very Top */}
      <LiveEventTicker
        onNavigateToTab={setActiveTab}
        onOpenSubmission={() => setIsSubmissionOpen(true)}
        onOpenRegister={() => setIsRegisterOpen(true)}
      />

      {/* Top Header with Industrial System Branding */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenFastDevlog={handleOpenFastDevlog}
        onOpenRegister={() => setIsRegisterOpen(true)}
        onOpenObserverMode={() => setIsObserverOpen(true)}
        onOpenSubmission={() => setIsSubmissionOpen(true)}
      />

      {/* Main App Switcher Container with Subtle Industrial Slide-In */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 font-mono overflow-x-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="w-full"
          >
            {activeTab === "live" && (
              <LiveStageDashboard
                onOpenFastDevlog={handleOpenFastDevlog}
                onOpenSubmission={() => setIsSubmissionOpen(true)}
                onOpenRegister={() => setIsRegisterOpen(true)}
                onNavigateToTab={setActiveTab}
              />
            )}

            {activeTab === "my-dashboard" && (
              <div>
                <ParticipantDashboard
                  onOpenSubmission={() => setIsSubmissionOpen(true)}
                  onOpenRegister={() => setIsRegisterOpen(true)}
                  onNavigateToTab={setActiveTab}
                />
              </div>
            )}

            {activeTab === "discovery" && (
              <EventDiscoveryView
                onSelectEvent={(eventId) => {
                  setActiveTab("live");
                }}
              />
            )}

            {activeTab === "duel" && (
              <DuelStageView />
            )}

            {activeTab === "leaderboard" && (
              <div>
                <Leaderboard
                  onNavigateToJudging={() => setActiveTab("judging")}
                  onOpenSubmission={() => setIsSubmissionOpen(true)}
                  onNavigateToDevlog={() => setActiveTab("devlog")}
                />
              </div>
            )}

            {activeTab === "devlog" && (
              <div>
                <DevlogSection />
              </div>
            )}

            {activeTab === "projects" && (
              <div>
                <ProjectsTeamsSection />
              </div>
            )}

            {activeTab === "chat" && (
              <div>
                <LiveChatView />
              </div>
            )}

            {activeTab === "judging" && (
              <div>
                <JudgeDashboard />
              </div>
            )}

            {activeTab === "admin" && (
              <div>
                <OrganizerDashboard />
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Variation 10 Galactic Arena Footer */}
      <footer className="mt-auto border-t border-[var(--border)]/20 bg-[var(--bg)] py-4 px-4 sm:px-8 text-xs text-[var(--ink)] font-mono transition-colors duration-200">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="tag-box text-[10px]">
              ARENA_v2
            </span>
            <span className="text-[var(--ink-light)] font-bold">/</span>
            <span className="text-xs text-[var(--ink-muted)]">
              SYNCING_HOST... // AI ONLINE // PING 12ms // Fix-Ed Community
            </span>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-1.5 text-xs text-[var(--ink)]">
              <span className="w-2 h-2 rounded-full bg-[var(--accent)] inline-block animate-pulse" />
              <span className="font-bold tracking-wider">CORE_VERSION: 2.0_BUILD_8841</span>
            </div>
            <a
              href="https://fix-ed.me"
              target="_blank"
              rel="noreferrer"
              className="text-[var(--accent)] hover:underline font-bold flex items-center gap-1 uppercase text-xs"
            >
              <span>fix-ed.me</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </footer>

      {/* Fullscreen Broadcast Observer Mode Overlay */}
      <ObserverModeOverlay
        isOpen={isObserverOpen}
        onClose={() => setIsObserverOpen(false)}
      />

      {/* Ambient Floating AI Host Companion */}
      <AIHostFloatingCompanion
        onOpenAskHostModal={() => setIsAskHostOpen(true)}
        onNavigateToLive={() => {
          setActiveTab("live");
          const el = document.getElementById("ai-host-entity-block");
          if (el) el.scrollIntoView({ behavior: "smooth" });
        }}
      />

      {/* Modals */}
      <AskHostModal
        isOpen={isAskHostOpen}
        onClose={() => setIsAskHostOpen(false)}
      />

      <SubmissionModal
        isOpen={isSubmissionOpen}
        onClose={() => setIsSubmissionOpen(false)}
      />

      <RegisterModal
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <HackathonProvider>
      <MainAppContent />
    </HackathonProvider>
  );
}

