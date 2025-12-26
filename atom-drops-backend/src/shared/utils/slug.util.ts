import { prisma } from '../../config/prisma.client';

export const generateSlug = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-')      // Replace spaces with hyphens
    .replace(/-+/g, '-')       // Replace multiple hyphens with single
    .trim();
};

export const generateUniqueSlug = async (
  text: string,
  model: 'product' | 'category'
): Promise<string> => {
  let slug = generateSlug(text);
  let counter = 1;
  let finalSlug = slug;

  while (true) {
    const existing = await (prisma[model] as any).findUnique({
      where: { slug: finalSlug },
    });

    if (!existing) break;

    finalSlug = `${slug}-${counter}`;
    counter++;
  }

  return finalSlug;
};
