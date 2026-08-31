export type Role = 'guest' | 'participant' | 'organizer' | 'judge';

export type HackathonStage = 
  | 'DRAFT'
  | 'REGISTRATION'
  | 'STARTING'
  | 'ACTIVE'
  | 'SUBMISSION'
  | 'JUDGING'
  | 'RESULTS'
  | 'ARCHIVED';

export type ProjectStatus = 'IDEA' | 'BUILDING' | 'MVP' | 'DEMO' | 'SUBMITTED';

export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  avatar: string;
  role: Role;
  skills: string[];
  stack: string[];
  experience: string;
  primaryRole: string; // e.g. "Frontend", "Backend", "AI Engineer", "Designer", "Fullstack"
  lookingFor: string[]; // e.g. ["Backend", "AI Specialist", "Designer"]
  bio: string;
  githubUrl?: string;
  teamId?: string;
  createdAt: string;
}

export interface Criterion {
  id: string;
  name: string;
  description: string;
  maxScore: number;
}

export interface SpecialAward {
  id: string;
  title: string;
  icon: string;
  description: string;
  winnerTeamId?: string;
  winnerProjectTitle?: string;
}

export interface Hackathon {
  id: string;
  title: string;
  theme: string;
  description: string;
  rules: string[];
  criteria: Criterion[];
  stage: HackathonStage;
  startTime: string;
  endTime: string;
  submissionDeadline: string;
  maxTeamSize: number;
  bannerUrl?: string;
  organizerId: string;
  organizerName: string;
  specialAwards: SpecialAward[];
}

export interface TeamMember {
  userId: string;
  name: string;
  avatar: string;
  roleInTeam: string;
  isCaptain: boolean;
}

export interface Team {
  id: string;
  hackathonId: string;
  name: string;
  tag: string;
  description: string;
  avatarColor: string;
  captainId: string;
  members: TeamMember[];
  projectId?: string;
  lookingForRoles: string[];
  isOpen: boolean;
  activityCount: number;
  createdAt: string;
}

export interface Project {
  id: string;
  hackathonId: string;
  teamId?: string;
  teamName?: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  title: string;
  tagline: string;
  description: string;
  tags: string[];
  status: ProjectStatus;
  demoUrl?: string;
  repoUrl?: string;
  videoUrl?: string;
  instructions?: string;
  screenshots: string[];
  mvpTimestamp?: string;
  submittedTimestamp?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProgressPost {
  id: string;
  hackathonId: string;
  projectId: string;
  projectTitle: string;
  teamId?: string;
  teamName?: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  content: string;
  polishedContent?: string;
  mediaType?: 'image' | 'video' | 'link' | 'github' | 'demo';
  mediaUrl?: string;
  status: ProjectStatus;
  milestone?: string;
  category?: 'architecture' | 'ui' | 'ai' | 'mvp' | 'demo' | 'release' | 'bugfix';
  reactions: Record<string, string[]>; // emoji -> array of userIds
  commentsCount: number;
  createdAt: string;
}

export interface Comment {
  id: string;
  postId: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  content: string;
  createdAt: string;
}

export type EventType =
  | 'HACKATHON_STARTED'
  | 'USER_JOINED'
  | 'TEAM_CREATED'
  | 'TEAM_INVITE'
  | 'PROJECT_CREATED'
  | 'PROGRESS_POSTED'
  | 'MVP_MARKED'
  | 'DEMO_POSTED'
  | 'SUBMISSION_CREATED'
  | 'STAGE_CHANGED'
  | 'JUDGING_STARTED'
  | 'RESULTS_PUBLISHED'
  | 'AI_HOST_BROADCAST';

export interface EventItem {
  id: string;
  hackathonId: string;
  type: EventType;
  actorId?: string;
  actorName?: string;
  actorAvatar?: string;
  teamId?: string;
  teamName?: string;
  projectId?: string;
  projectTitle?: string;
  message: string;
  metadata?: Record<string, any>;
  createdAt: string;
}

export interface AIHostMessage {
  id: string;
  hackathonId: string;
  trigger: string;
  title: string;
  content: string;
  statsSnapshot: {
    participants: number;
    teams: number;
    projects: number;
    mvps: number;
    submissions: number;
    progressPosts: number;
    hoursLeft?: number;
  };
  audioUrl?: string;
  isPinned?: boolean;
  createdAt: string;
}

export interface SubmissionChecklist {
  mvpWorks: boolean;
  demoAvailable: boolean;
  repoAvailable: boolean;
  instructionsAdded: boolean;
  videoAdded: boolean;
}

export interface Submission {
  id: string;
  hackathonId: string;
  projectId: string;
  teamId?: string;
  teamName?: string;
  authorId: string;
  authorName: string;
  title: string;
  description: string;
  demoUrl: string;
  repoUrl: string;
  videoUrl: string;
  launchInstructions: string;
  techStack: string[];
  checklist: SubmissionChecklist;
  status: 'SUBMITTED' | 'UNDER_REVIEW' | 'REVIEWED';
  submittedAt: string;
}

export interface Judgement {
  id: string;
  hackathonId: string;
  submissionId: string;
  projectId: string;
  projectTitle: string;
  teamName?: string;
  judgeId: string;
  judgeName: string;
  scores: Record<string, number>; // criterionId -> score (1-10)
  totalScore: number;
  feedback: string;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  hackathonId: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  authorRole: Role;
  content: string;
  isPinned?: boolean;
  isHost?: boolean;
  createdAt: string;
}

export interface NotificationItem {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  link?: string;
  isRead: boolean;
  createdAt: string;
}

export interface TeamMatchSuggestion {
  targetType: 'team' | 'user';
  targetId: string;
  targetName: string;
  targetRole?: string;
  targetAvatar?: string;
  matchScore: number;
  matchReason: string;
  complementarySkills: string[];
}

export interface LeaderboardItem {
  teamId?: string;
  authorId?: string;
  name: string;
  tag?: string;
  avatarColor?: string;
  eventsCount: number;
  mvpReached: boolean;
  demoReached: boolean;
  submitted: boolean;
  lastActive: string;
  projectTitle?: string;
}

export interface FinalShowRecap {
  summary: string;
  highlights: string[];
  statsHighlight: {
    totalParticipants: number;
    totalTeams: number;
    totalProjects: number;
    totalPosts: number;
    mvpCount: number;
    submissionsCount: number;
    firstMvpTeam?: string;
    firstMvpTime?: string;
  };
  winnerStory: string;
  closingWords: string;
}
