import { createClient } from './supabase/server';

export function slugify(text: string) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
}

export async function generateUniqueSlug(agencyName: string): Promise<string> {
  const supabase = await createClient();
  const baseSlug = slugify(agencyName);
  let uniqueSlug = baseSlug;
  let counter = 1;
  let isUnique = false;

  while (!isUnique) {
    const { data } = await supabase
      .from('real_estates')
      .select('slug')
      .eq('slug', uniqueSlug)
      .single();

    if (!data) {
      isUnique = true;
    } else {
      uniqueSlug = `${baseSlug}-${counter}`;
      counter++;
    }
  }

  return uniqueSlug;
}