import React, { useState } from "react";
import { HackathonProvider, useHackathon } from "./context/HackathonContext";
import { Header } from "./components/Header";
import { LiveStageDashboard } from "./components/LiveStageDashboard";
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
import { Sparkles, ExternalLink, ShieldCheck } from "lucide-react";

const MainAppContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>("live");
  const [isAskHostOpen, setIsAskHostOpen] = useState<boolean>(false);
  const [isSubmissionOpen, setIsSubmissionOpen] = useState<boolean>(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState<boolean>(false);

  const handleOpenFastDevlog = () => {
    setActiveTab("devlog");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#E0E0E0] font-mono flex flex-col selection:bg-[#BAFF00] selection:text-black">
      {/* Top Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenFastDevlog={handleOpenFastDevlog}
        onOpenRegister={() => setIsRegisterOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 font-mono">
        {activeTab === "live" && (
          <LiveStageDashboard
            onOpenFastDevlog={handleOpenFastDevlog}
            onOpenSubmission={() => setIsSubmissionOpen(true)}
            onOpenRegister={() => setIsRegisterOpen(true)}
            onNavigateToTab={setActiveTab}
          />
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

      {/* Footer */}
      <footer className="mt-auto border-t border-[#333] bg-[#0A0A0A] py-8 px-4 text-xs text-[#888] font-mono">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="font-bold text-white font-mono uppercase tracking-widest text-sm">
              ВАЙБАТОН
            </span>
            <span className="text-[#444]">/</span>
            <span>Специально для сообщества <strong className="text-white">Fix-Ed</strong></span>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-1.5 text-[#AAA]">
              <ShieldCheck className="w-4 h-4 text-[#BAFF00]" />
              <span>AI Host & Human Judges</span>
            </div>
            <a
              href="https://fix-ed.me"
              target="_blank"
              rel="noreferrer"
              className="text-[#BAFF00] hover:underline flex items-center gap-1 font-mono uppercase text-xs"
            >
              <span>fix-ed.me</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </footer>

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
