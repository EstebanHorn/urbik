import { getLegalPage } from "@/libs/getLegalData";
import ReactMarkdown from "react-markdown";

export default function ContratacionPage() {
  const content = getLegalPage("contratacion");

  if (!content) {
    return <div className="min-h-screen flex items-center justify-center">Página no encontrada</div>;
  }

  return (
    <div className="bg-urbik-white min-h-screen pt-20">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <h1 className="text-5xl font-display font-bold text-urbik-black mb-8 tracking-tighter">
          {content.frontmatter.title}
        </h1>
        <div className="prose prose-sm max-w-none">
          <ReactMarkdown
            components={{
              h1: ({ node, ...props }) => <h1 className="text-3xl font-bold mt-8 mb-4 text-urbik-black" {...props} />,
              h2: ({ node, ...props }) => <h2 className="text-2xl font-bold mt-6 mb-3 text-urbik-black" {...props} />,
              h3: ({ node, ...props }) => <h3 className="text-xl font-bold mt-4 mb-2 text-urbik-black" {...props} />,
              p: ({ node, ...props }) => <p className="mb-4 text-urbik-dark2 leading-relaxed" {...props} />,
              ul: ({ node, ...props }) => <ul className="list-disc list-inside mb-4 space-y-2" {...props} />,
              ol: ({ node, ...props }) => <ol className="list-decimal list-inside mb-4 space-y-2" {...props} />,
              li: ({ node, ...props }) => <li className="text-urbik-dark2" {...props} />,
              hr: ({ node, ...props }) => <hr className="my-8 border-urbik-g200" {...props} />,
              blockquote: ({ node, ...props }) => <blockquote className="border-l-4 border-urbik-emerald pl-4 italic text-urbik-dark2 my-4" {...props} />,
            }}
          >
            {content.content}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
}
