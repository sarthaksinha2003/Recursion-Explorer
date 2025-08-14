import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

export const Controls = ({
  isPlaying,
  onTogglePlay,
  onStep,
  onReset,
  speed,
  onSpeedChange,
}) => {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-md border p-3">
      <div className="flex items-center gap-2">
        <Button variant="default" onClick={onTogglePlay} aria-label={isPlaying ? "Pause" : "Play"}>
          {isPlaying ? "Pause" : "Play"}
        </Button>
        <Button variant="outline" onClick={onStep} aria-label="Next step">Next</Button>
        <Button variant="ghost" onClick={onReset} aria-label="Reset">Reset</Button>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-sm text-muted-foreground">Speed</span>
        <div className="w-40">
          <Slider
            defaultValue={[speed]}
            min={0.25}
            max={2}
            step={0.25}
            onValueChange={(v) => onSpeedChange(v[0] ?? 1)}
          />
        </div>
        <span className="text-xs text-muted-foreground">{speed.toFixed(2)}x</span>
      </div>
    </div>
  );
};

export default Controls; 