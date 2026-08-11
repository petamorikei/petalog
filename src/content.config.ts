import { defineCollection } from "astro:content";
import type { ImageMetadata } from "astro";
import type { CollectionConfig } from "astro/content/config";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const runtimeProcess = (
  globalThis as typeof globalThis & {
    process?: {
      env?: Record<string, string | undefined>;
    };
  }
).process;
const postsBase =
  runtimeProcess?.env?.PETALOG_E2E === "true"
    ? "./src/content/e2e-posts"
    : "./src/content/posts";

type PostData = {
  title: string;
  published: Date;
  updated?: Date;
  draft: boolean;
  description: string;
  image?: ImageMetadata | string;
  tags: string[];
  category: string | null;
  lang: string;
  prevTitle: string;
  prevSlug: string;
  nextTitle: string;
  nextSlug: string;
};

const passthroughImage = z.string().refine(
  (value) => {
    if (value.length > 1 && value.startsWith("/") && !value.startsWith("//")) {
      return true;
    }

    try {
      const imageUrl = new URL(value);
      return (
        imageUrl.protocol === "https:" &&
        imageUrl.username === "" &&
        imageUrl.password === ""
      );
    } catch {
      return false;
    }
  },
  {
    message:
      "Image must be a relative local path, an HTTPS URL, or a root-relative public path.",
  },
);

const postsCollection = defineCollection({
  loader: glob({
    pattern: "**/*.{md,mdx}",
    base: postsBase,
  }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      published: z.coerce.date(),
      updated: z.coerce.date().optional(),
      draft: z.boolean().optional().default(false),
      description: z.string().optional().default(""),
      image: z.union([passthroughImage, image()]).optional(),
      tags: z.array(z.string()).optional().default([]),
      category: z.string().optional().nullable().default(""),
      lang: z.string().optional().default(""),

      /* For internal use */
      prevTitle: z.string().default(""),
      prevSlug: z.string().default(""),
      nextTitle: z.string().default(""),
      nextSlug: z.string().default(""),
    }),
});

const specCollection = defineCollection({
  loader: glob({
    pattern: "**/*.{md,mdx}",
    base: "./src/content/spec",
  }),
  schema: z.object({}),
});

export const collections: {
  posts: CollectionConfig<z.ZodType<PostData>, ReturnType<typeof glob>>;
  spec: CollectionConfig<
    z.ZodType<Record<string, never>>,
    ReturnType<typeof glob>
  >;
} = {
  posts: postsCollection,
  spec: specCollection,
};
