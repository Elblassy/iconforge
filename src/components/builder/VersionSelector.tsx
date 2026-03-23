"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { ODOO_VERSIONS } from "@/lib/odoo-versions";
import type { OdooVersion } from "@/types/icon-config";

interface VersionSelectorProps {
  value: OdooVersion;
  onChange: (v: OdooVersion) => void;
}

const VERSION_LABELS: Record<OdooVersion, string> = {
  "16.0": "Odoo 16",
  "17.0": "Odoo 17",
  "18.0": "Odoo 18",
  "19.0": "Odoo 19",
};

export function VersionSelector({ value, onChange }: VersionSelectorProps) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor="odoo-version">Odoo Version</Label>
      <Select value={value} onValueChange={(v) => onChange(v as OdooVersion)}>
        <SelectTrigger id="odoo-version" className="w-full">
          <SelectValue placeholder="Select version" />
        </SelectTrigger>
        <SelectContent>
          {ODOO_VERSIONS.map((ver) => (
            <SelectItem key={ver} value={ver}>
              {VERSION_LABELS[ver]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
