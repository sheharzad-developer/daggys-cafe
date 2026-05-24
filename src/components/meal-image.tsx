"use client";

import Image, { type ImageProps } from "next/image";
import { useState } from "react";
import type { Meal } from "@/lib/data";

type MealImageProps = Omit<ImageProps, "src" | "alt"> & {
  meal: Pick<Meal, "name" | "image" | "localImage" | "dataAiHint">;
  alt?: string;
};

export function MealImage({ meal, alt, ...rest }: MealImageProps) {
  const initial = meal.localImage ?? meal.image;
  const [src, setSrc] = useState(initial);

  return (
    <Image
      {...rest}
      src={src}
      alt={alt ?? meal.name}
      data-ai-hint={meal.dataAiHint}
      onError={() => {
        if (src !== meal.image) setSrc(meal.image);
      }}
    />
  );
}
