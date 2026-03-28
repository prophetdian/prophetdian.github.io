import XStyleFeed from "@/components/XStyleFeed";

export default function Feed() {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container py-8 pt-20">
        <h1 className="text-4xl md:text-5xl font-bold mb-8 text-glow">Prophetic Feed</h1>
        <XStyleFeed />
      </div>
    </div>
  );
}
