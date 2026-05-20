"use client";

import { useState } from "react";
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { GIROS } from "@/lib/constants";

interface GiroSelectProps {
  defaultValue?: string | null;
  name?: string;
  id?: string;
}

export function GiroSelect({ defaultValue, name = "giro", id = "giro" }: GiroSelectProps) {
  const initial = defaultValue ?? "";
  const isCustom = initial !== "" && !GIROS.includes(initial as any);

  const [otros, setOtros] = useState(isCustom);
  const [custom, setCustom] = useState(isCustom ? initial : "");

  return (
    <div className="space-y-2">
      <Select
        id={id}
        name={otros ? undefined : name}
        defaultValue={isCustom ? "__otros" : initial}
        onChange={(e) => {
          const v = e.target.value;
          setOtros(v === "__otros");
          if (v !== "__otros") setCustom("");
        }}
      >
        <option value="">— Selecciona —</option>
        {GIROS.map((g) => (
          <option key={g} value={g}>{g}</option>
        ))}
        <option value="__otros">Otros</option>
      </Select>

      {otros && (
        <Input
          name={name}
          placeholder="Especifica el giro…"
          value={custom}
          onChange={(e) => setCustom(e.target.value)}
          required
        />
      )}
    </div>
  );
}
