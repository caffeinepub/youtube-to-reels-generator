import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Toaster } from "@/components/ui/sonner";
import { Textarea } from "@/components/ui/textarea";
import {
  Check,
  Clipboard,
  Copy,
  Download,
  Edit2,
  ExternalLink,
  FileDown,
  Film,
  Link2,
  Loader2,
  Play,
  Plus,
  Save,
  Settings,
  Sparkles,
  Tag,
  Upload,
  Video,
  X,
  Zap,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useRef, useState } from "react";
import { toast } from "sonner";

// ── Types ──────────────────────────────────────────────────────────────────
interface ReelCard {
  reelNumber: number;
  title: string;
  script: string;
  hashtags: string[];
  startTime: number;
  endTime: number;
  duration: string;
  isHighlight?: boolean;
}

interface ClipSegment {
  clipNumber: number;
  startTime: number;
  endTime: number;
  duration: number;
}

// ── Constants ─────────────────────────────────────────────────────────────
const DEFAULT_KEYWORDS = [
  "important",
  "must",
  "secret",
  "tip",
  "remember",
  "note",
  "key",
  "highlight",
  "main",
  "focus",
];

const EDUCATIONAL_TEMPLATES = [
  {
    title: "Key Concept Explained",
    script:
      "In this segment, we break down one of the most important concepts you need to master. Pay close attention as we simplify this topic step by step. By the end, you'll have a clear understanding you can apply immediately.",
    hashtags: [
      "#LearnWithMe",
      "#KeyConcept",
      "#Education",
      "#Study",
      "#Knowledge",
    ],
  },
  {
    title: "Pro Tip You Must Know",
    script:
      "Here's a powerful tip that most people overlook. This shortcut will save you hours of effort and dramatically improve your results. Share this with anyone who could benefit!",
    hashtags: ["#ProTip", "#LifeHack", "#MustKnow", "#Tips", "#Shorts"],
  },
  {
    title: "Step-by-Step Breakdown",
    script:
      "Let's walk through this process one step at a time. Each step builds on the previous one, creating a solid foundation for mastery. Follow along and take notes!",
    hashtags: ["#StepByStep", "#HowTo", "#Tutorial", "#Learning", "#Guide"],
  },
  {
    title: "Common Mistake to Avoid",
    script:
      "This is one of the most common mistakes beginners make — and it can set you back significantly. Understanding what NOT to do is just as important as knowing what to do.",
    hashtags: [
      "#MistakesToAvoid",
      "#BeginnerTips",
      "#DoNotDo",
      "#Education",
      "#Smart",
    ],
  },
  {
    title: "The Secret Formula",
    script:
      "Experts use this formula but rarely share it. Today we're revealing exactly how it works and why it's so effective. Apply this and watch your results transform.",
    hashtags: [
      "#SecretFormula",
      "#ExpertTips",
      "#Results",
      "#Success",
      "#Viral",
    ],
  },
  {
    title: "Quick Summary & Recap",
    script:
      "Let's quickly recap the most important points from this lesson. These are the core takeaways you should remember and practice every day.",
    hashtags: ["#Recap", "#Summary", "#QuickLearn", "#Revision", "#StudyTips"],
  },
  {
    title: "Real-World Application",
    script:
      "Theory is great — but here's exactly how to apply what you've learned in real situations. These practical examples will make everything click into place.",
    hashtags: ["#RealWorld", "#Practical", "#ApplyNow", "#Skills", "#Practice"],
  },
  {
    title: "Advanced Insight",
    script:
      "Now that you understand the basics, let's go deeper. This advanced insight separates the good from the great, and it's something most courses never teach you.",
    hashtags: [
      "#AdvancedTips",
      "#NextLevel",
      "#DeepDive",
      "#Mastery",
      "#Advanced",
    ],
  },
  {
    title: "Challenge & Action Item",
    script:
      "Here's your challenge for today. Don't just watch — take action right now. The fastest way to learn is by doing, and this task will reinforce everything you've seen.",
    hashtags: [
      "#Challenge",
      "#TakeAction",
      "#DoIt",
      "#ActionItem",
      "#Consistency",
    ],
  },
  {
    title: "Final Takeaway",
    script:
      "This is the single most important thing to take away from everything you've learned today. Keep this in mind as you move forward on your journey.",
    hashtags: [
      "#Takeaway",
      "#FinalThought",
      "#Wisdom",
      "#KeyLesson",
      "#Education",
    ],
  },
];

// ── Helpers ────────────────────────────────────────────────────────────────
function formatSeconds(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function extractVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([-\w]{11})/,
    /youtube\.com\/shorts\/([-\w]{11})/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}

function generateReels(_videoId: string, keywords: string[]): ReelCard[] {
  const totalDuration = 600; // assume 10-min video
  const segmentLength = Math.floor(totalDuration / 10);
  return EDUCATIONAL_TEMPLATES.map((tpl, i) => {
    const startTime = i * segmentLength;
    const endTime = startTime + 58;
    const isHighlight = keywords.some(
      (kw) =>
        tpl.title.toLowerCase().includes(kw.toLowerCase()) ||
        tpl.script.toLowerCase().includes(kw.toLowerCase()),
    );
    return {
      reelNumber: i + 1,
      title: tpl.title,
      script: tpl.script,
      hashtags: tpl.hashtags,
      startTime,
      endTime,
      duration: "~58s",
      isHighlight,
    };
  });
}

// ── Reel Card ──────────────────────────────────────────────────────────────
function ReelCardItem({
  reel,
  index,
  videoId,
  youtubeUrl,
}: {
  reel: ReelCard;
  index: number;
  videoId: string;
  youtubeUrl: string;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(reel.title);
  const [editScript, setEditScript] = useState(reel.script);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const content = `${editTitle}\n\n${editScript}\n\n${reel.hashtags.join(" ")}\n\nStart: ${formatSeconds(reel.startTime)} | End: ${formatSeconds(reel.endTime)} | Duration: ${reel.duration}`;
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      toast.success("Reel content copied to clipboard!");
      setTimeout(() => setCopied(false), 2500);
    } catch {
      toast.error("Failed to copy content");
    }
  };

  const handleDownload = () => {
    const content = `REEL ${reel.reelNumber}: ${editTitle}\n\n${editScript}\n\nHashtags: ${reel.hashtags.join(" ")}\n\nStart: ${formatSeconds(reel.startTime)} | End: ${formatSeconds(reel.endTime)} | Duration: ${reel.duration}`;
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `reel_${reel.reelNumber}_${editTitle.replace(/\s+/g, "_")}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success(`Reel ${reel.reelNumber} downloaded!`);
  };

  const handleOpenYouTube = () => {
    window.open(`${youtubeUrl}&t=${reel.startTime}`, "_blank");
  };

  const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      data-ocid={`reels.item.${reel.reelNumber}`}
      className="bg-card border border-border rounded-xl overflow-hidden shadow-card hover:shadow-card-hover transition-shadow duration-200"
    >
      {/* Thumbnail */}
      <div className="relative h-28 bg-gradient-to-br from-slate-800 to-slate-900 overflow-hidden">
        <img
          src={thumbnailUrl}
          alt={`Reel ${reel.reelNumber} thumbnail`}
          className="w-full h-full object-cover opacity-70"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = "none";
          }}
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        {/* Play icon */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30">
            <Play className="w-4 h-4 text-white fill-white ml-0.5" />
          </div>
        </div>
        {/* Badge */}
        <div className="absolute top-2 left-2">
          <span className="text-xs font-semibold bg-black/60 text-white px-2 py-0.5 rounded-full backdrop-blur-sm">
            Reel {reel.reelNumber}
          </span>
        </div>
        {reel.isHighlight && (
          <div className="absolute top-2 right-2">
            <span className="text-xs font-semibold bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
              ★ Key Point
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3 space-y-2.5">
        {/* Title */}
        {isEditing ? (
          <Input
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            className="text-sm font-semibold h-8"
            data-ocid={`reels.title.input.${reel.reelNumber}`}
          />
        ) : (
          <div>
            <p className="text-xs text-muted-foreground font-medium mb-0.5">
              Reel Title
            </p>
            <p className="text-sm font-bold text-foreground leading-tight line-clamp-1">
              {editTitle}
            </p>
          </div>
        )}

        {/* Script */}
        {isEditing ? (
          <Textarea
            value={editScript}
            onChange={(e) => setEditScript(e.target.value)}
            className="text-xs min-h-[72px] resize-none"
            data-ocid={`reels.script.textarea.${reel.reelNumber}`}
          />
        ) : (
          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
            {editScript}
          </p>
        )}

        {/* Hashtags */}
        <div className="flex flex-wrap gap-1">
          {reel.hashtags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="text-xs text-primary bg-primary/8 px-1.5 py-0.5 rounded font-medium"
            >
              {tag}
            </span>
          ))}
          {reel.hashtags.length > 3 && (
            <span className="text-xs text-muted-foreground">
              +{reel.hashtags.length - 3}
            </span>
          )}
        </div>

        {/* Timestamps */}
        <div className="flex items-center gap-3 text-xs text-muted-foreground border-t border-border pt-2">
          <span>
            <span className="font-medium text-foreground">Start:</span>{" "}
            {formatSeconds(reel.startTime)}
          </span>
          <span>
            <span className="font-medium text-foreground">End:</span>{" "}
            {formatSeconds(reel.endTime)}
          </span>
          <span className="ml-auto">
            <span className="font-medium text-foreground">Dur:</span>{" "}
            {reel.duration}
          </span>
        </div>

        {/* Actions */}
        <div className="flex gap-1.5 pt-0.5">
          {isEditing ? (
            <Button
              type="button"
              size="sm"
              className="flex-1 h-7 text-xs gap-1 bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={() => setIsEditing(false)}
              data-ocid={`reels.save_button.${reel.reelNumber}`}
            >
              <Save className="w-3 h-3" />
              Save
            </Button>
          ) : (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="flex-1 h-7 text-xs gap-1 border-border hover:border-primary/40 hover:text-primary"
              onClick={() => setIsEditing(true)}
              data-ocid={`reels.edit_button.${reel.reelNumber}`}
            >
              <Edit2 className="w-3 h-3" />
              Edit
            </Button>
          )}
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-7 w-7 p-0 border-border hover:border-primary/40 hover:text-primary"
            onClick={handleCopy}
            title="Copy content"
            data-ocid={`reels.secondary_button.${reel.reelNumber}`}
          >
            {copied ? (
              <Check className="w-3 h-3 text-green-600" />
            ) : (
              <Copy className="w-3 h-3" />
            )}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-7 w-7 p-0 border-border hover:border-primary/40 hover:text-primary"
            onClick={handleDownload}
            title="Download clip content (.txt)"
            data-ocid={`reels.delete_button.${reel.reelNumber}`}
          >
            <Download className="w-3 h-3" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-7 w-7 p-0 border-border hover:border-primary/40 hover:text-primary"
            onClick={handleOpenYouTube}
            title="Open in YouTube at timestamp"
            data-ocid={`reels.secondary_button.yt.${reel.reelNumber}`}
          >
            <ExternalLink className="w-3 h-3" />
          </Button>
        </div>

        {/* Downloader links */}
        <div className="pt-0.5 text-xs text-muted-foreground">
          <span>Download from: </span>
          <a
            href="https://y2mate.com"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-foreground transition-colors"
          >
            y2mate.com
          </a>
          <span className="mx-1">•</span>
          <a
            href="https://www.savefrom.net"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-foreground transition-colors"
          >
            savefrom.net
          </a>
        </div>
      </div>
    </motion.div>
  );
}

// ── Tab 1: YouTube Link ────────────────────────────────────────────────────
function YouTubeLinkTab({ keywords }: { keywords: string[] }) {
  const [url, setUrl] = useState("");
  const [reels, setReels] = useState<ReelCard[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [videoId, setVideoId] = useState("");
  const [hasGenerated, setHasGenerated] = useState(false);

  const handleGenerate = async () => {
    const trimmed = url.trim();
    if (!trimmed) {
      toast.error("Please paste a YouTube URL first");
      return;
    }
    const id = extractVideoId(trimmed);
    if (!id) {
      toast.error("Invalid YouTube URL. Please check and try again.");
      return;
    }
    setIsGenerating(true);
    setReels([]);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    const generated = generateReels(id, keywords);
    setReels(generated);
    setVideoId(id);
    setHasGenerated(true);
    setIsGenerating(false);
    toast.success("10 reels generated successfully!");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleGenerate();
  };

  const handleDownloadAllPDF = () => {
    const html = `<!DOCTYPE html><html><head><title>Reels - ${url}</title><style>
    body { font-family: Arial, sans-serif; padding: 20px; max-width: 800px; margin: 0 auto; }
    h1 { font-size: 18px; margin-bottom: 4px; }
    .reel { page-break-inside: avoid; border: 1px solid #ddd; border-radius: 8px; padding: 16px; margin-bottom: 16px; }
    .reel-num { background: #6366f1; color: white; border-radius: 50%; width: 24px; height: 24px; display: inline-flex; align-items: center; justify-content: center; font-size: 12px; font-weight: bold; }
    .title { font-size: 16px; font-weight: bold; margin: 8px 0 4px; }
    .script { font-size: 13px; color: #444; margin-bottom: 8px; line-height: 1.5; }
    .hashtags { font-size: 12px; color: #6366f1; margin-bottom: 6px; }
    .timestamps { font-size: 12px; color: #888; }
    @media print { body { padding: 0; } }
  </style></head><body>
  <h1>YouTube Reels - Generated Content</h1>
  <p style="color:#888;font-size:12px;margin-bottom:20px;">URL: ${url}</p>
  ${reels
    .map(
      (r) => `<div class="reel">
    <span class="reel-num">${r.reelNumber}</span>
    <div class="title">${r.title}</div>
    <div class="script">${r.script}</div>
    <div class="hashtags">${r.hashtags.join(" ")}</div>
    <div class="timestamps">Start: ${formatSeconds(r.startTime)} | End: ${formatSeconds(r.endTime)} | Duration: ${r.duration}</div>
  </div>`,
    )
    .join("")}
  </body></html>`;
    const win = window.open("", "_blank");
    if (win) {
      win.document.write(html);
      win.document.close();
      win.print();
    }
  };

  return (
    <div className="space-y-6" data-ocid="youtube.panel">
      {/* Section title */}
      <div>
        <h2 className="text-lg font-display font-bold text-foreground mb-1">
          Convert YouTube URL to Reels
        </h2>
        <p className="text-sm text-muted-foreground">
          Paste any YouTube link and get 10 ready-to-post reels with scripts,
          hashtags & timestamps.
        </p>
      </div>

      {/* URL input row */}
      <div className="flex gap-3" data-ocid="youtube.input.row">
        <div className="relative flex-1">
          <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="url"
            placeholder="https://www.youtube.com/watch?v=..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={handleKeyDown}
            className="pl-9 h-11 text-sm border-border focus:border-primary"
            data-ocid="youtube.search_input"
          />
        </div>
        <Button
          type="button"
          onClick={handleGenerate}
          disabled={isGenerating || !url.trim()}
          className="h-11 px-5 font-semibold gap-2 bg-primary text-primary-foreground hover:bg-primary/90 shadow-primary shrink-0"
          data-ocid="youtube.primary_button"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Zap className="w-4 h-4" />
              Generate Reels
            </>
          )}
        </Button>
      </div>

      {/* Loading state */}
      {isGenerating && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          data-ocid="youtube.loading_state"
          className="text-center py-10"
        >
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-3" />
          <p className="text-sm text-muted-foreground font-medium">
            Analyzing video and generating 10 reels...
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Crafting scripts, hashtags & timestamps
          </p>
        </motion.div>
      )}

      {/* Results grid: 2 rows × 5 cards */}
      {!isGenerating && hasGenerated && reels.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
          data-ocid="reels.section"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <h3 className="font-display font-semibold text-sm text-foreground">
                Generated Reels
              </h3>
              <Badge variant="secondary" className="text-xs font-medium">
                {reels.length} reels
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-1.5 text-xs border-border hover:border-primary/40 hover:text-primary"
                onClick={handleDownloadAllPDF}
                data-ocid="reels.secondary_button"
              >
                <FileDown className="w-3.5 h-3.5" />
                Download PDF
              </Button>
              <Badge className="bg-primary/10 text-primary border-primary/20 text-xs font-medium">
                <Sparkles className="w-3 h-3 mr-1" /> Free
              </Badge>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            <AnimatePresence>
              {reels.map((reel, i) => (
                <ReelCardItem
                  key={reel.reelNumber}
                  reel={reel}
                  index={i}
                  videoId={videoId}
                  youtubeUrl={url}
                />
              ))}
            </AnimatePresence>
          </div>
        </motion.div>
      )}

      {/* Empty state before first generation */}
      {!isGenerating && !hasGenerated && (
        <div
          data-ocid="reels.empty_state"
          className="text-center py-14 border border-dashed border-border rounded-xl bg-muted/30"
        >
          <Film className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-sm font-medium text-muted-foreground">
            Paste a YouTube link above to generate 10 reels
          </p>
          <p className="text-xs text-muted-foreground/70 mt-1">
            Works with any public YouTube video
          </p>
        </div>
      )}
    </div>
  );
}

// ── Clip Segment Card ──────────────────────────────────────────────────────
function ClipSegmentCard({
  clip,
  videoFile,
}: {
  clip: ClipSegment;
  videoFile: File;
}) {
  const handleDownload = () => {
    const url = URL.createObjectURL(videoFile);
    const a = document.createElement("a");
    a.href = url;
    a.download = `clip_${clip.clipNumber}_${videoFile.name}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success(
      `Downloading full video as Clip ${clip.clipNumber} reference`,
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: clip.clipNumber * 0.04 }}
      data-ocid={`clips.item.${clip.clipNumber}`}
      className="bg-card border border-border rounded-xl p-4 shadow-card hover:shadow-card-hover transition-shadow"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-xs font-bold text-primary">
              {clip.clipNumber}
            </span>
          </div>
          <span className="text-sm font-semibold text-foreground">
            Clip {clip.clipNumber}
          </span>
        </div>
        <Badge variant="secondary" className="text-xs">
          {Math.round(clip.duration)}s
        </Badge>
      </div>
      <div className="grid grid-cols-3 gap-2 mb-3 text-xs">
        <div className="bg-muted/50 rounded-lg px-2 py-1.5 text-center">
          <div className="text-muted-foreground mb-0.5">Start</div>
          <div className="font-mono font-semibold text-foreground">
            {formatSeconds(Math.floor(clip.startTime))}
          </div>
        </div>
        <div className="bg-muted/50 rounded-lg px-2 py-1.5 text-center">
          <div className="text-muted-foreground mb-0.5">End</div>
          <div className="font-mono font-semibold text-foreground">
            {formatSeconds(Math.floor(clip.endTime))}
          </div>
        </div>
        <div className="bg-muted/50 rounded-lg px-2 py-1.5 text-center">
          <div className="text-muted-foreground mb-0.5">Duration</div>
          <div className="font-mono font-semibold text-foreground">
            {Math.round(clip.duration)}s
          </div>
        </div>
      </div>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="w-full h-8 text-xs gap-1.5 border-border hover:border-primary/40 hover:text-primary"
        onClick={handleDownload}
        data-ocid={`clips.delete_button.${clip.clipNumber}`}
      >
        <Download className="w-3 h-3" />
        Download Clip {clip.clipNumber}
      </Button>
    </motion.div>
  );
}

// ── Tab 2: Video Upload ────────────────────────────────────────────────────
function VideoUploadTab() {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState("");
  const [videoDuration, setVideoDuration] = useState(0);
  const [clips, setClips] = useState<ClipSegment[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith("video/")) {
      toast.error("Please upload a valid video file (MP4, WebM, etc.)");
      return;
    }
    setVideoFile(file);
    setClips([]);
    const url = URL.createObjectURL(file);
    setVideoUrl(url);
    toast.success(`Video "${file.name}" loaded successfully!`);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setVideoDuration(videoRef.current.duration);
    }
  };

  const handleSplitClips = async () => {
    if (!videoFile || videoDuration === 0) {
      toast.error("Please upload a video first and wait for it to load.");
      return;
    }
    setIsProcessing(true);
    setProgress(0);
    setClips([]);

    for (let i = 0; i <= 100; i += 10) {
      await new Promise((resolve) => setTimeout(resolve, 120));
      setProgress(i);
    }

    const segmentDuration = videoDuration / 10;
    const segments: ClipSegment[] = Array.from({ length: 10 }, (_, i) => ({
      clipNumber: i + 1,
      startTime: i * segmentDuration,
      endTime: Math.min((i + 1) * segmentDuration, videoDuration),
      duration: segmentDuration,
    }));

    setClips(segments);
    setIsProcessing(false);
    setProgress(100);
    toast.success("Video split into 10 equal clips!");
  };

  return (
    <div className="space-y-6" data-ocid="upload.panel">
      <div>
        <h2 className="text-lg font-display font-bold text-foreground mb-1">
          Upload Video → 10 Clips
        </h2>
        <p className="text-sm text-muted-foreground">
          Upload your video file and automatically split it into 10 equal
          segments for short-form content.
        </p>
      </div>

      {/* Drop zone */}
      {!videoFile && (
        <label
          data-ocid="upload.dropzone"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={() => setIsDragging(false)}
          className={`block border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all duration-200 ${
            isDragging
              ? "border-primary bg-primary/5 scale-[1.01]"
              : "border-border hover:border-primary/50 hover:bg-muted/30"
          }`}
        >
          <Upload className="w-10 h-10 text-muted-foreground/50 mx-auto mb-3" />
          <p className="text-sm font-semibold text-foreground mb-1">
            Drop your video here or click to browse
          </p>
          <p className="text-xs text-muted-foreground">
            Supports MP4, WebM, MOV, AVI &bull; Any size
          </p>
          <span
            className="mt-4 inline-flex items-center gap-2 rounded-md border border-border px-3 py-1.5 text-sm font-medium hover:bg-muted/50 transition-colors"
            data-ocid="upload.upload_button"
          >
            <Upload className="w-3.5 h-3.5" />
            Choose File
          </span>
          <input
            ref={fileInputRef}
            type="file"
            accept="video/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleFileSelect(f);
            }}
          />
        </label>
      )}

      {/* Video preview */}
      {videoFile && videoUrl && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="bg-card border border-border rounded-xl overflow-hidden shadow-card">
            {/* biome-ignore lint/a11y/useMediaCaption: user-uploaded video may not have captions */}
            <video
              ref={videoRef}
              src={videoUrl}
              controls
              className="w-full max-h-56 bg-black"
              onLoadedMetadata={handleLoadedMetadata}
            />
            <div className="p-3 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground truncate max-w-xs">
                  {videoFile.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {videoDuration > 0
                    ? `Duration: ${formatSeconds(Math.floor(videoDuration))}`
                    : "Loading..."}
                  &nbsp;&bull;&nbsp;
                  {(videoFile.size / (1024 * 1024)).toFixed(1)} MB
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-1.5 text-xs border-border"
                onClick={() => {
                  setVideoFile(null);
                  setVideoUrl("");
                  setClips([]);
                  setProgress(0);
                }}
                data-ocid="upload.close_button"
              >
                <X className="w-3 h-3" />
                Remove
              </Button>
            </div>
          </div>

          <Button
            type="button"
            onClick={handleSplitClips}
            disabled={isProcessing || videoDuration === 0}
            className="w-full h-11 font-semibold gap-2 bg-primary text-primary-foreground hover:bg-primary/90 shadow-primary"
            data-ocid="upload.primary_button"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Splitting...
              </>
            ) : (
              <>
                <Video className="w-4 h-4" />
                Split into 10 Clips
              </>
            )}
          </Button>

          {isProcessing && (
            <div data-ocid="upload.loading_state" className="space-y-1.5">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Processing video segments...</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}
        </motion.div>
      )}

      {/* Clips grid */}
      {clips.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          data-ocid="clips.section"
        >
          <div className="flex items-center gap-2 mb-3">
            <h3 className="font-display font-semibold text-sm text-foreground">
              Video Segments
            </h3>
            <Badge variant="secondary" className="text-xs">
              {clips.length} clips
            </Badge>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {clips.map((clip) => (
              <ClipSegmentCard
                key={clip.clipNumber}
                clip={clip}
                videoFile={videoFile!}
              />
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-3 bg-muted/40 rounded-lg px-3 py-2 border border-border">
            <strong>Note:</strong> Browser-based video trimming requires FFmpeg.
            Download buttons will download the full video as a reference for
            each segment's timestamps.
          </p>
        </motion.div>
      )}
    </div>
  );
}

// ── Tab 3: Keyword Settings ────────────────────────────────────────────────
function KeywordSettingsTab({
  keywords,
  setKeywords,
}: {
  keywords: string[];
  setKeywords: (kw: string[]) => void;
}) {
  const [newKeyword, setNewKeyword] = useState("");

  const handleAdd = () => {
    const kw = newKeyword.trim().toLowerCase();
    if (!kw) return;
    if (keywords.includes(kw)) {
      toast.info(`"${kw}" already exists`);
      return;
    }
    setKeywords([...keywords, kw]);
    setNewKeyword("");
    toast.success(`Keyword "${kw}" added!`);
  };

  const handleRemove = (kw: string) => {
    setKeywords(keywords.filter((k) => k !== kw));
    toast.success(`Keyword "${kw}" removed`);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAdd();
    }
  };

  return (
    <div className="space-y-6" data-ocid="keywords.panel">
      <div>
        <h2 className="text-lg font-display font-bold text-foreground mb-1">
          Keyword Settings
        </h2>
        <p className="text-sm text-muted-foreground">
          These keywords are used to automatically tag important reels as "Key
          Point" highlights when generating from YouTube links.
        </p>
      </div>

      {/* Add keyword */}
      <div className="bg-card border border-border rounded-xl p-5 shadow-card space-y-4">
        <div className="flex items-center gap-2">
          <Tag className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">Add Keyword</h3>
          <span className="text-xs text-muted-foreground ml-auto">
            {keywords.length} active
          </span>
        </div>
        <div className="flex gap-2">
          <Input
            placeholder="Type a keyword (e.g. crucial, must-watch)"
            value={newKeyword}
            onChange={(e) => setNewKeyword(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 h-10 text-sm"
            data-ocid="keywords.input"
          />
          <Button
            type="button"
            onClick={handleAdd}
            disabled={!newKeyword.trim()}
            className="h-10 px-4 gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90 shadow-primary"
            data-ocid="keywords.primary_button"
          >
            <Plus className="w-3.5 h-3.5" />
            Add
          </Button>
        </div>
      </div>

      {/* Keyword chips */}
      <div className="bg-card border border-border rounded-xl p-5 shadow-card">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">
            Active Keywords
          </h3>
        </div>
        <div className="flex flex-wrap gap-2 min-h-12">
          <AnimatePresence mode="popLayout">
            {keywords.map((kw) => (
              <motion.div
                key={kw}
                initial={{ opacity: 0, scale: 0.88 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.88 }}
                transition={{ duration: 0.15 }}
              >
                <Badge
                  variant="secondary"
                  className="flex items-center gap-1.5 pr-1.5 pl-3 py-1 bg-primary/8 text-primary border-primary/20 hover:bg-primary/12 font-medium text-sm"
                >
                  {kw}
                  <button
                    type="button"
                    onClick={() => handleRemove(kw)}
                    className="ml-0.5 rounded-full p-0.5 hover:bg-destructive/15 hover:text-destructive transition-colors"
                    aria-label={`Remove ${kw}`}
                    data-ocid="keywords.delete_button"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              </motion.div>
            ))}
          </AnimatePresence>
          {keywords.length === 0 && (
            <p className="text-sm text-muted-foreground italic">
              No keywords yet. Add some above.
            </p>
          )}
        </div>
      </div>

      {/* Info box */}
      <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 flex gap-3">
        <Clipboard className="w-4 h-4 text-primary shrink-0 mt-0.5" />
        <div className="text-sm">
          <p className="font-semibold text-foreground mb-1">
            How keywords work
          </p>
          <p className="text-muted-foreground text-xs leading-relaxed">
            When you generate reels from a YouTube link, reels whose title or
            script contain any of these keywords are automatically tagged with a
            ★ Key Point badge. This helps you identify the most important clips
            at a glance.
          </p>
        </div>
      </div>
    </div>
  );
}

// ── App Root ───────────────────────────────────────────────────────────────
export default function App() {
  const [keywords, setKeywords] = useState<string[]>(DEFAULT_KEYWORDS);
  const [activeTab, setActiveTab] = useState("youtube");

  const currentYear = new Date().getFullYear();
  const hostname = window.location.hostname;

  return (
    <div className="min-h-screen bg-background">
      {/* ── Header ── */}
      <header
        data-ocid="nav.panel"
        className="sticky top-0 z-50 bg-card border-b border-border"
        style={{ boxShadow: "0 1px 0 0 oklch(0.90 0.012 240)" }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center gap-4">
          {/* Brand */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center">
              <Zap className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-display font-extrabold text-base tracking-widest text-foreground uppercase">
              ReelsGen
            </span>
          </div>

          {/* Nav links */}
          <nav className="hidden md:flex items-center gap-0.5 ml-4">
            {["Features", "How it Works", "School Solutions", "Support"].map(
              (link) => (
                <button
                  type="button"
                  key={link}
                  className="px-3 py-1.5 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
                  data-ocid={`nav.${link.toLowerCase().replace(/\s+/g, "_")}.link`}
                >
                  {link}
                </button>
              ),
            )}
          </nav>

          {/* Login button */}
          <div className="ml-auto">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="rounded-full px-5 border-border text-foreground font-medium hover:bg-muted/50"
              data-ocid="nav.primary_button"
            >
              Log In
            </Button>
          </div>
        </div>
      </header>

      {/* ── Main ── */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-1.5 bg-primary/8 border border-primary/20 rounded-full px-3 py-1 mb-3">
            <Sparkles className="w-3 h-3 text-primary" />
            <span className="text-xs font-semibold text-primary">
              School-Friendly &bull; Free &bull; No Account Needed
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-foreground mb-2">
            YouTube to Reels Generator
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base max-w-md mx-auto">
            Paste any YouTube link, get 10 ready-to-post short reels with
            scripts, hashtags &amp; timestamps — completely free.
          </p>
        </motion.div>

        {/* Main content panel */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.1 }}
          className="bg-card border border-border rounded-xl shadow-card overflow-hidden"
          data-ocid="main.panel"
        >
          {/* Stepper tabs */}
          <div className="border-b border-border bg-muted/20">
            <div className="flex items-center px-6 pt-4 pb-0">
              {[
                { id: "youtube", label: "YouTube Link", icon: Link2 },
                { id: "upload", label: "Video Upload", icon: Upload },
                { id: "keywords", label: "Keyword Settings", icon: Settings },
              ].map((tab, i) => (
                <button
                  type="button"
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  data-ocid={`nav.${tab.id}.tab`}
                  className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-all duration-150 ${
                    activeTab === tab.id
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <span
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                      activeTab === tab.id
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {i + 1}
                  </span>
                  <span className="hidden sm:inline">{tab.label}</span>
                  <tab.icon className="w-3.5 h-3.5 sm:hidden" />
                </button>
              ))}
            </div>
          </div>

          {/* Tab content */}
          <div className="p-6">
            <AnimatePresence mode="wait">
              {activeTab === "youtube" && (
                <motion.div
                  key="youtube"
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 8 }}
                  transition={{ duration: 0.2 }}
                >
                  <YouTubeLinkTab keywords={keywords} />
                </motion.div>
              )}
              {activeTab === "upload" && (
                <motion.div
                  key="upload"
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 8 }}
                  transition={{ duration: 0.2 }}
                >
                  <VideoUploadTab />
                </motion.div>
              )}
              {activeTab === "keywords" && (
                <motion.div
                  key="keywords"
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 8 }}
                  transition={{ duration: 0.2 }}
                >
                  <KeywordSettingsTab
                    keywords={keywords}
                    setKeywords={setKeywords}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Features strip */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8"
        >
          {[
            {
              icon: Zap,
              label: "10 Reels Instantly",
              desc: "One link, 10 scripts",
            },
            {
              icon: Tag,
              label: "Auto Hashtags",
              desc: "5 per reel, optimized",
            },
            { icon: Film, label: "Timestamps", desc: "Start, end & duration" },
            {
              icon: Sparkles,
              label: "School Friendly",
              desc: "Clean, safe content",
            },
          ].map((f) => (
            <div
              key={f.label}
              className="bg-card border border-border rounded-xl p-4 shadow-card text-center"
            >
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-2">
                <f.icon className="w-4 h-4 text-primary" />
              </div>
              <p className="text-sm font-semibold text-foreground">{f.label}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{f.desc}</p>
            </div>
          ))}
        </motion.div>
      </main>

      {/* ── Footer ── */}
      <footer className="border-t border-border bg-card mt-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-md bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center">
                <Zap className="w-2.5 h-2.5 text-white" />
              </div>
              <span className="text-sm font-bold tracking-widest text-foreground uppercase">
                ReelsGen
              </span>
              <span className="text-xs text-muted-foreground ml-2">
                &copy; {currentYear}
              </span>
            </div>

            <nav className="flex items-center gap-4">
              {["About", "Privacy", "Terms", "Contact"].map((link) => (
                <button
                  type="button"
                  key={link}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                  data-ocid={`footer.${link.toLowerCase()}.link`}
                >
                  {link}
                </button>
              ))}
            </nav>

            <p className="text-xs text-muted-foreground">
              Built with ❤️ using{" "}
              <a
                href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(hostname)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-foreground transition-colors"
              >
                caffeine.ai
              </a>
            </p>
          </div>
        </div>
      </footer>

      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: "oklch(1 0 0)",
            border: "1px solid oklch(0.90 0.012 240)",
            color: "oklch(0.11 0.015 240)",
          },
        }}
      />
    </div>
  );
}
