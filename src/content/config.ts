import { defineCollection, z } from "astro:content";

const reviews = defineCollection({
  // Type-check frontmatter using a schema
  schema: z.object({
    title: z.string(),
    description: z.string(),

    // Transform string to Date object
    pubDate: z.coerce.date(),
    heroImage: z.string().optional(),

    icon: z.string().optional().nullable(),
  }),
});

export const collections = { reviews };
