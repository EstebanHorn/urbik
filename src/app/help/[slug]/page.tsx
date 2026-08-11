import Link from "next/link";
import ReactMarkdown from "react-markdown";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { getHelpPost } from "@/lib/getHelpData";
import { HELP_CATEGORIES } from "@/lib/helpCategories";

interface HelpArticlePageProps {
  params: Promise<{ slug: string }>;
}

export default async function HelpArticlePage({ params }: HelpArticlePageProps) {
  const { slug } = await params;
  const post = getHelpPost(slug);

  if (!post) {
    return notFound();
  }

  const category = HELP_CATEGORIES.find((cat) => cat.name === post.category);
  const categoryHref = category ? `/help/category/${category.slug}` : "/help";

  return (
    <div className="bg-geora-white min-h-screen pt-24 pb-20">
      <div className="max-w-3xl mx-auto px-6">
        <Link
          href={categoryHref}
          className="flex w-fit items-center gap-1 text-sm font-bold text-geora-dark2 hover:text-geora-black transition-colors mb-6"
        >
          <ChevronLeft size={16} /> Volver a {post.category}
        </Link>

        {post.subcategory && (
          <span className="block mb-3 text-xs font-bold uppercase tracking-wide text-geora-emerald">
            {post.subcategory}
          </span>
        )}

        <h1 className="text-3xl md:text-4xl font-bold text-geora-black mb-10 tracking-tight leading-tight">
          {post.title}
        </h1>

        <div className="prose prose-sm max-w-none">
          <ReactMarkdown
            components={{
              h1: ({ ...props }) => <h1 className="text-3xl font-bold mt-8 mb-4 text-geora-black" {...props} />,
              h2: ({ ...props }) => <h2 className="text-2xl font-bold mt-6 mb-3 text-geora-black" {...props} />,
              h3: ({ ...props }) => <h3 className="text-xl font-bold mt-4 mb-2 text-geora-black" {...props} />,
              p: ({ ...props }) => <p className="mb-4 text-geora-dark2 leading-relaxed" {...props} />,
              ul: ({ ...props }) => <ul className="list-disc list-inside mb-4 space-y-2" {...props} />,
              ol: ({ ...props }) => <ol className="list-decimal list-inside mb-4 space-y-2" {...props} />,
              li: ({ ...props }) => <li className="text-geora-dark2" {...props} />,
              strong: ({ ...props }) => <strong className="text-geora-black font-bold" {...props} />,
              hr: ({ ...props }) => <hr className="my-8 border-geora-g200" {...props} />,
              blockquote: ({ ...props }) => <blockquote className="border-l-4 border-geora-emerald pl-4 italic text-geora-dark2 my-4" {...props} />,
            }}
          >
            {post.content}
          </ReactMarkdown>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-100 flex flex-col items-center text-center">
          <p className="text-geora-dark2 mb-4">¿No encontraste lo que buscabas?</p>
          <Link
            href="/contact"
            className="bg-geora-black text-white hover:text-geora-emerald font-bold py-3 px-8 rounded-full transition-all shadow-md active:scale-95"
          >
            Contactanos
          </Link>
        </div>
      </div>
    </div>
  );
}
