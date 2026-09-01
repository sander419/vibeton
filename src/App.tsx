import React, { useState } from "react";
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
    <div className="min-h-screen bg-[#F8F7F4] text-[#1A1A1A] font-mono flex flex-col selection:bg-[#E63946] selection:text-white">
      {/* Top Header with Industrial System Branding */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenFastDevlog={handleOpenFastDevlog}
        onOpenRegister={() => setIsRegisterOpen(true)}
        onOpenObserverMode={() => setIsObserverOpen(true)}
      />

      {/* Main App Switcher Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 font-mono">
        {activeTab === "live" && (
          <LiveStageDashboard
            onOpenFastDevlog={handleOpenFastDevlog}
            onOpenSubmission={() => setIsSubmissionOpen(true)}
            onOpenRegister={() => setIsRegisterOpen(true)}
            onNavigateToTab={setActiveTab}
          />
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
      </main>

      {/* Industrial Footer */}
      <footer className="mt-auto border-t-2 border-[#1A1A1A] bg-[#F8F7F4] py-6 px-4 sm:px-8 text-xs text-[#1A1A1A] font-mono">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="font-display font-bold text-base uppercase tracking-tight text-[#1A1A1A]">
              COMPETITION_OS
            </span>
            <span className="text-[#999] font-bold">/</span>
            <span className="text-xs text-[#666]">
              [01] CORE_V.2.0.4 • Специально для сообщества <strong className="text-[#1A1A1A]">Fix-Ed</strong>
            </span>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-1.5 text-xs text-[#1A1A1A]">
              <span className="w-2 h-2 rounded-full bg-[#E63946] inline-block" />
              <span className="font-bold tracking-wider">[SYSTEM_READY]</span>
            </div>
            <a
              href="https://fix-ed.me"
              target="_blank"
              rel="noreferrer"
              className="text-[#E63946] hover:underline font-bold flex items-center gap-1 uppercase text-xs"
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

