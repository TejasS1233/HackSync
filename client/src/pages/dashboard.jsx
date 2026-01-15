import { Outlet, useLocation, Link } from "react-router-dom";
import { AppSidebar } from "@/components/blocks/Dashboard/app-sidebar";
import { HeaderUser } from "@/components/blocks/Dashboard/header-user";
import DashboardLoader from "@/components/dashboard-loader";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

const getViewName = (pathname) => {
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length <= 1) return "Dashboard";
  return segments[segments.length - 1]
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};



export default function Dashboard() {
  const location = useLocation();
  const currentView = getViewName(location.pathname);
  const isChatView = location.pathname === "/dashboard/chat" || location.pathname === "/dashboard/chat-azure";
  const isOfflineChatView = location.pathname === "/dashboard/offline-chat";
  const isFullscreenView = isChatView || isOfflineChatView;

  return (
    <SidebarProvider defaultOpen={false}>
      <AppSidebar />
      <DashboardLoader />
      <SidebarInset>
        {!isFullscreenView && (
          <header className="flex h-14 shrink-0 items-center gap-2 border-b border-border bg-background px-4">
            <SidebarTrigger className="-ml-1" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link to="/dashboard">Dashboard</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                {currentView !== "Dashboard" && (
                  <>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                      <BreadcrumbPage>{currentView}</BreadcrumbPage>
                    </BreadcrumbItem>
                  </>
                )}
              </BreadcrumbList>
            </Breadcrumb>
            <div className="ml-auto">
              <HeaderUser />
            </div>
          </header>
        )}

        <div className={isFullscreenView ? "flex-1 flex flex-col h-full" : "flex-1 flex flex-col gap-4 p-4"}>
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
