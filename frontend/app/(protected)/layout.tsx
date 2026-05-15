import { SignedIn } from "@clerk/nextjs";
import { AppSidebar } from "@/components/layout/app-sidebar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="app-shell flex">
      <div className="app-shell-grid" />
      <div className="app-shell-noise" />
      <SignedIn>
        <AppSidebar />
      </SignedIn>
      <main className="app-main overflow-auto">{children}</main>
    </div>
  );
}
