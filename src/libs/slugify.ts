import prisma from "@/libs/db";

const ACCENT_MAP: Record<string, string> = {
  á: "a",
  à: "a",
  ä: "a",
  â: "a",
  ã: "a",
  é: "e",
  è: "e",
  ë: "e",
  ê: "e",
  í: "i",
  ì: "i",
  ï: "i",
  î: "i",
  ó: "o",
  ò: "o",
  ö: "o",
  ô: "o",
  õ: "o",
  ú: "u",
  ù: "u",
  ü: "u",
  û: "u",
  ñ: "n",
  ç: "c",
};

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[áàäâãéèëêíìïîóòöôõúùüûñç]/g, (char) => ACCENT_MAP[char] ?? char)
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/[\s]+/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export async function generateUniqueSlug(
  agencyName: string,
  excludeUserId?: number,
): Promise<string> {
  const base = slugify(agencyName);

  if (!base) {
    return `inmobiliaria-${Date.now()}`;
  }

  const existing = await prisma.realEstate.findUnique({
    where: { slug: base },
    select: { user_id: true },
  });

  const isTakenByOther =
    existing !== null &&
    (excludeUserId === undefined || existing.user_id !== excludeUserId);

  if (!isTakenByOther) {
    return base;
  }

  let suffix = 2;
  while (true) {
    const candidate = `${base}-${suffix}`;
    const conflict = await prisma.realEstate.findUnique({
      where: { slug: candidate },
      select: { user_id: true },
    });

    const candidateTakenByOther =
      conflict !== null &&
      (excludeUserId === undefined || conflict.user_id !== excludeUserId);

    if (!candidateTakenByOther) {
      return candidate;
    }

    suffix++;
  }
}
