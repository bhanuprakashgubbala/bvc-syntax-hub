import Sidebar from "@/components/Sidebar";
import TopNav from "@/components/TopNav";

export default function UserLayout({ children }) {
  return (
    <div className="min-h-screen bg-zinc-950 font-sans text-zinc-50 selection:bg-violet-500/30">
      <Sidebar />
      <div className="ml-64 flex flex-col min-h-screen">
        <TopNav />
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
