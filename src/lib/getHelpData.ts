import fs from "fs";
import path from "path";
import matter from "gray-matter";

const contentDirectory = path.join(process.cwd(), "content/help");

export interface HelpPostMeta {
  slug: string;
  title: string;
  category: string;
  subcategory?: string;
  order: number;
}

export interface HelpPost extends HelpPostMeta {
  content: string;
}

function getMarkdownFileNames() {
  return fs.readdirSync(contentDirectory).filter((f) => f.endsWith(".md"));
}

export function getAllHelpPosts(): HelpPostMeta[] {
  return getMarkdownFileNames().map((fileName) => {
    const slug = fileName.replace(/\.md$/, "");
    const fullPath = path.join(contentDirectory, fileName);
    const fileContents = fs.readFileSync(fullPath, "utf8");
    const { data } = matter(fileContents);

    return {
      slug,
      title: data.title,
      category: data.category,
      subcategory: data.subcategory,
      order: data.order ?? 0,
    };
  });
}

export function getHelpPost(slug: string): HelpPost | null {
  try {
    const fullPath = path.join(contentDirectory, `${slug}.md`);
    const fileContents = fs.readFileSync(fullPath, "utf8");
    const { data, content } = matter(fileContents);

    return {
      slug,
      title: data.title || slug,
      category: data.category,
      subcategory: data.subcategory,
      order: data.order ?? 0,
      content,
    };
  } catch (error) {
    console.error(`Error reading help post ${slug}:`, error);
    return null;
  }
}

export function getHelpPostsByCategory(category: string): HelpPostMeta[] {
  return getAllHelpPosts()
    .filter((post) => post.category === category)
    .sort((a, b) => a.order - b.order);
}

export interface HelpSection {
  subcategory: string;
  posts: HelpPostMeta[];
}

export function groupHelpPostsBySubcategory(posts: HelpPostMeta[]): HelpSection[] {
  const sections: HelpSection[] = [];
  for (const post of posts) {
    const key = post.subcategory || "General";
    let section = sections.find((s) => s.subcategory === key);
    if (!section) {
      section = { subcategory: key, posts: [] };
      sections.push(section);
    }
    section.posts.push(post);
  }
  return sections;
}
