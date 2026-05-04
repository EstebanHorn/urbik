import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const contentDirectory = path.join(process.cwd(), 'content/legal');

export interface LegalContent {
  frontmatter: {
    title: string;
    description?: string;
  };
  content: string;
}

export function getLegalPage(slug: string): LegalContent | null {
  try {
    const fullPath = path.join(contentDirectory, `${slug}.md`);
    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const { data, content } = matter(fileContents);

    return {
      frontmatter: {
        title: data.title || slug,
        description: data.description,
      },
      content,
    };
  } catch (error) {
    console.error(`Error reading legal page ${slug}:`, error);
    return null;
  }
}

export function getAllLegalPages() {
  try {
    const fileNames = fs.readdirSync(contentDirectory);

    const allPages = fileNames
      .filter(file => file.endsWith('.md'))
      .map((fileName) => {
        const slug = fileName.replace(/\.md$/, '');
        const fullPath = path.join(contentDirectory, fileName);
        const fileContents = fs.readFileSync(fullPath, 'utf8');
        const { data } = matter(fileContents);

        return {
          slug,
          title: data.title || slug,
          description: data.description,
        };
      });

    return allPages;
  } catch (error) {
    console.error('Error reading legal pages:', error);
    return [];
  }
}
