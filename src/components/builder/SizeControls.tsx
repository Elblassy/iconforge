"use client";

import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SizeControlsProps {
  iconWidth: number;
  fontSize: number;
  fontWeight: 300 | 400 | 700 | 900;
  onIconWidthChange: (value: number) => void;
  onFontSizeChange: (value: number) => void;
  onFontWeightChange: (value: 300 | 400 | 700 | 900) => void;
}

export function SizeControls({
  iconWidth,
  fontSize,
  fontWeight,
  onIconWidthChange,
  onFontSizeChange,
  onFontWeightChange,
}: SizeControlsProps) {
  return (
    <div className="space-y-4">
      {/* Icon Width */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Icon Width</Label>
          <span className="text-sm text-muted-foreground">{iconWidth}px</span>
        </div>
        <Slider
          min={64}
          max={1024}
          step={1}
          value={[iconWidth]}
          onValueChange={([v]) => onIconWidthChange(v)}
        />
      </div>

      {/* Font Size */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Font Size</Label>
          <span className="text-sm text-muted-foreground">{fontSize}px</span>
        </div>
        <Slider
          min={16}
          max={800}
          step={1}
          value={[fontSize]}
          onValueChange={([v]) => onFontSizeChange(v)}
        />
      </div>

      {/* Font Weight */}
      <div className="space-y-2">
        <Label>Font Weight</Label>
        <Select
          value={String(fontWeight)}
          onValueChange={(v) =>
            onFontWeightChange(Number(v) as 300 | 400 | 700 | 900)
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="300">300 Light</SelectItem>
            <SelectItem value="400">400 Regular</SelectItem>
            <SelectItem value="700">700 Bold</SelectItem>
            <SelectItem value="900">900 Black</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
