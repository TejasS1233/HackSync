import * as React from "react";


import { HugeiconsIcon } from "@hugeicons/react";
import {
  Home01Icon,
  Clock01Icon,
  MirrorIcon,
  File01Icon,
  Brain02Icon,
  Message01Icon,
  WifiDisconnected01Icon,
} from "@hugeicons/core-free-icons";

import { NavMain } from "@/components/blocks/Dashboard/nav-main";

import { ThemeToggle } from "@/components/blocks/Dashboard/theme-toggle";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";

const data = {
  navMain: [
    {
      title: "Home",
      url: "/dashboard/home",
      icon: (props) => <HugeiconsIcon icon={Home01Icon} {...props} />,
    },
    {
      title: "Chat",
      url: "/dashboard/chat",
      icon: (props) => <HugeiconsIcon icon={Message01Icon} {...props} />,
    },
    {
      title: "Sentiment Analysis",
      url: "/dashboard/sentiment",
      icon: (props) => <HugeiconsIcon icon={Brain02Icon} {...props} />,
    },
    {
      title: "History",
      url: "/dashboard/history",
      icon: (props) => <HugeiconsIcon icon={Clock01Icon} {...props} />,
    },
    {
      title: "Reflection",
      url: "/dashboard/analytics",
      icon: (props) => <HugeiconsIcon icon={MirrorIcon} {...props} />,
    },
    {
      title: "Reports",
      url: "/dashboard/reports",
      icon: (props) => <HugeiconsIcon icon={File01Icon} {...props} />,
    },
    {
      title: "Offline Chat",
      url: "/dashboard/offline-chat",
      icon: (props) => <HugeiconsIcon icon={WifiDisconnected01Icon} {...props} />,
    },
  ],
};

export function AppSidebar(props) {
  const { state } = useSidebar();
  
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <div className="px-2 py-2 font-semibold text-2xl tracking-tight transition-all duration-300">
          {state === "collapsed" ? "m." : "mirage"}
        </div>

      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <ThemeToggle />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
