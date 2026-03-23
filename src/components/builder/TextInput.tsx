"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const FONTS = [
  "Arial",
  "Georgia",
  "Verdana",
  "Courier New",
  "Times New Roman",
  "Roboto",
  "Open Sans",
  "Lato",
  "Montserrat",
  "Poppins",
  "Raleway",
  "Ubuntu",
  "Nunito",
  "Playfair Display",
  "Oswald",
  "Merriweather",
  "PT Sans",
  "Rubik",
  "Inter",
  "Fira Sans",
];

interface TextInputProps {
  text: string;
  fontFamily: string;
  onTextChange: (text: string) => void;
  onFontChange: (fontFamily: string) => void;
}

export function TextInput({ text, fontFamily, onTextChange, onFontChange }: TextInputProps) {
  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <Label htmlFor="icon-text">Text</Label>
        <Input
          id="icon-text"
          value={text}
          maxLength={10}
          placeholder="e.g. HR, CRM, MRP"
          onChange={(e) => onTextChange(e.target.value)}
        />
      </div>

      <div className="space-y-1.5">
        <Label>Font Family</Label>
        <Select value={fontFamily} onValueChange={onFontChange}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {FONTS.map((font) => (
              <SelectItem key={font} value={font}>
                {font}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
