import { getAllHelpPosts } from "@/lib/getHelpData";
import HelpSearch from "./HelpSearch";

export default function HelpPage() {
  const posts = getAllHelpPosts();
  return (
    <main>
      <HelpSearch initialPosts={posts} />
    </main>
  );
}