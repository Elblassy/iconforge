"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { IconSource } from "@/types/icon-config";
import { TextInput } from "./TextInput";
import { IconPicker } from "./IconPicker";
import { ImageUpload } from "./ImageUpload";

interface IconSourceTabsProps {
  source: IconSource;
  onSourceChange: (source: IconSource) => void;
}

export function IconSourceTabs({ source, onSourceChange }: IconSourceTabsProps) {
  const activeTab = source.type;

  function handleTabChange(tab: string) {
    if (tab === source.type) return;

    if (tab === "text") {
      onSourceChange({ type: "text", text: "HR", fontFamily: "Arial" });
    } else if (tab === "icon") {
      onSourceChange({
        type: "icon",
        iconSet: "bootstrap-icons",
        iconClass: "bi bi-box",
        unicodeChar: "\uF2B4",
      });
    } else if (tab === "image") {
      onSourceChange({ type: "image", imageDataUrl: "" });
    }
  }

  return (
    <Tabs value={activeTab} onValueChange={handleTabChange}>
      <TabsList className="w-full">
        <TabsTrigger value="icon" className="flex-1">Icon</TabsTrigger>
        <TabsTrigger value="text" className="flex-1">Text</TabsTrigger>
        <TabsTrigger value="image" className="flex-1">Image</TabsTrigger>
      </TabsList>

      <TabsContent value="icon" className="pt-3">
        <IconPicker
          selectedClass={source.type === "icon" ? source.iconClass : ""}
          onSelect={(iconClass, unicode, iconSet) =>
            onSourceChange({
              type: "icon",
              iconSet,
              iconClass,
              unicodeChar: unicode,
            })
          }
        />
      </TabsContent>

      <TabsContent value="text" className="pt-3">
        {source.type === "text" && (
          <TextInput
            text={source.text}
            fontFamily={source.fontFamily}
            onTextChange={(text) =>
              onSourceChange({ ...source, text })
            }
            onFontChange={(fontFamily) =>
              onSourceChange({ ...source, fontFamily })
            }
          />
        )}
      </TabsContent>

      <TabsContent value="image" className="pt-3">
        <ImageUpload
          imageDataUrl={source.type === "image" ? source.imageDataUrl : ""}
          onImageChange={(dataUrl) =>
            onSourceChange({ type: "image", imageDataUrl: dataUrl })
          }
        />
      </TabsContent>
    </Tabs>
  );
}
