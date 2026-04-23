import { useTelemetry } from "@/hooks/useTelemetry";
import type { GestureKind } from "@/lib/omnipoint/TelemetryStore";

const FINGER_LABELS = ["THUMB", "INDEX", "MIDDLE", "RING", "PINKY"] as const;

const GESTURE_META: Record<GestureKind, { label: string; tone: "ok" | "warn" | "danger" | "muted" }> = {
  none:        { label: "—",            tone: "muted" },
  point:       { label: "POINT",        tone: "ok" },
  click:       { label: "CLICK",        tone: "ok" },
  right_click: { label: "RIGHT CLICK",  tone: "ok" },
  drag:        { label: "DRAG",         tone: "ok" },
  scroll_up:   { label: "SCROLL ▲",     tone: "ok" },
  scroll_down: { label: "SCROLL ▼",     tone: "ok" },
  thumbs_up:   { label: "THUMBS UP",    tone: "ok" },
  open_palm:   { label: "OPEN PALM",    tone: "warn" },
  fist:        { label: "FIST",         tone: "danger" },
};

export function DetectionHUD() {
  const t = useTelemetry();
  const meta = GESTURE_META[t.gesture] ?? GESTURE_META.none;
  const gestureColor =
    meta.tone === "ok" ? "text-emerald-glow border-primary/60 bg-primary/5"
    : meta.tone === "warn" ? "text-warning border-warning/60 bg-warning/5"
    : meta.tone === "danger" ? "text-destructive border-destructive/60 bg-destructive/5"
    : "text-muted-foreground border-border";

  return (
    <div className="absolute top-2 left-2 z-30 panel/0 w-64 select-none">
      <div className="border hairline bg-card/85 backdrop-blur-md">
        <div className="flex items-center justify-between border-b hairline px-2.5 h-7">
          <div className="font-mono text-[9px] tracking-[0.3em] text-emerald-glow">
            ▣ DETECTION
          </div>
          <div className="flex items-center gap-1.5">
            <span className={`w-1.5 h-1.5 rounded-full ${t.handPresent ? "bg-primary led" : "bg-muted-foreground/50"}`} />
            <span className="font-mono text-[9px] tracking-[0.25em] text-muted-foreground">
              {t.handPresent ? "LOCKED" : "SEARCHING"}
            </span>
          </div>
        </div>

        <div className="p-2.5 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[9px] tracking-[0.25em] text-muted-foreground">HAND</span>
            <span className="font-mono text-[11px] text-foreground tracking-[0.15em]">
              {t.handedness === "none" ? "—" : `${t.handedness.toUpperCase()} HAND`}
            </span>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-mono text-[9px] tracking-[0.25em] text-muted-foreground">FINGERS</span>
              <span className="font-mono text-[11px] text-foreground tabular-nums">
                {t.fingerCount}/5
              </span>
            </div>
            <div className="grid grid-cols-5 gap-1">
              {t.fingersExtended.map((up, i) => (
                <FingerCell key={i} label={FINGER_LABELS[i]} active={up && t.handPresent} />
              ))}
            </div>
          </div>

          <div>
            <div className="font-mono text-[9px] tracking-[0.25em] text-muted-foreground mb-1">GESTURE</div>
            <div className={`h-9 border flex items-center justify-center font-mono text-[12px] tracking-[0.3em] ${gestureColor}`}>
              {meta.label}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="font-mono text-[9px] tracking-[0.25em] text-muted-foreground">PINCH</span>
            <PinchBar value={t.pinchDistance} />
          </div>
        </div>
      </div>
    </div>
  );
}

function FingerCell({ label, active }: { label: string; active: boolean }) {
  return (
    <div
      className={`flex flex-col items-center gap-0.5 py-1 border ${
        active
          ? "border-primary/70 bg-primary/15 text-primary"
          : "border-border bg-card/40 text-muted-foreground/60"
      }`}
      title={label}
    >
      <div className={`w-1 h-3 rounded-sm ${active ? "bg-primary led" : "bg-muted-foreground/40"}`} />
      <span className="font-mono text-[7px] tracking-[0.15em]">{label.slice(0, 3)}</span>
    </div>
  );
}

function PinchBar({ value }: { value: number }) {
  // value is normalized hand-space distance, ~0..0.25 typical
  const pct = Math.min(100, Math.max(0, (1 - value / 0.15) * 100));
  return (
    <div className="flex items-center gap-2 w-32">
      <div className="flex-1 h-1.5 bg-muted relative">
        <div
          className="absolute inset-y-0 left-0 bg-primary led"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="font-mono text-[10px] text-foreground tabular-nums w-10 text-right">
        {value.toFixed(3)}
      </span>
    </div>
  );
}
