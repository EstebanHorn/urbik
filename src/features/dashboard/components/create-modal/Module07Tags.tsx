"use client";

import React from "react";
import { UseFormReturn } from "react-hook-form";
import { AmenitiesGrid } from "./AmenitiesGrid";
import type { PropertyUploadFormData } from "./types";

interface Props {
  rhf: UseFormReturn<PropertyUploadFormData>;
}

export function Module07Tags({ rhf }: Props) {
  const { watch, setValue } = rhf;
  const amenities = watch("amenities") ?? {};
  const type = watch("type");

  return (
    <AmenitiesGrid
      value={amenities as Record<string, boolean>}
      propertyType={type}
      onChange={(next) =>
        setValue("amenities", next as Record<string, boolean>)
      }
    />
  );
}
