import { createClient } from './supabase/server';

function stripDiacritics(text: string) {
  return text
    .normalize('NFD')
    .split('')
    .filter((ch) => {
      const code = ch.codePointAt(0) ?? 0;
      return code < 0x300 || code > 0x36f;
    })
    .join('');
}

export function slugify(text: string) {
  return stripDiacritics(text.toString())
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
