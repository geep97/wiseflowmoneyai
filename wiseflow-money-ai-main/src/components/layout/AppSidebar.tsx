
import { useAuth } from '@/context/AuthContext';
import { useFinance } from '@/context/FinanceContext';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Home, PieChart, Coins, Calendar, User, Settings, LogOut } from "lucide-react";
import { Link, useLocation } from 'react-router-dom';

export function AppSidebar() {
  const { user, logout } = useAuth();
  const { balance } = useFinance();
  const location = useLocation();

  const navItems = [
    { title: "Dashboard", icon: Home, href: "/" },
    { title: "Transactions", icon: Coins, href: "/transactions" },
    { title: "Analytics", icon: PieChart, href: "/analytics" },
    { title: "Goals", icon: Calendar, href: "/goals" },
    { title: "Profile", icon: User, href: "/profile" },
    { title: "Settings", icon: Settings, href: "/settings" },
  ];

  // Get user's name from profile or fallback to email
  const userName = user?.profile?.name || user?.email?.split('@')[0] || 'User';
  const userInitial = userName.charAt(0).toUpperCase();

  return (
    <Sidebar>
      <SidebarHeader className="px-6 py-5">
        <div className="flex flex-col items-center">
          <Avatar className="h-12 w-12 mb-2">
            <AvatarImage src={user?.profile?.avatar_url || '/placeholder.svg'} alt={userName} />
            <AvatarFallback className="bg-primary text-primary-foreground">
              {userInitial}
            </AvatarFallback>
          </Avatar>
          <h3 className="text-lg font-semibold">{userName}</h3>
          <div className="text-sm opacity-80">{user?.email}</div>
          <div className="mt-3 bg-sidebar-accent p-3 rounded-lg w-full text-center">
            <div className="text-xs uppercase font-semibold opacity-80">Current Balance</div>
            <div className="text-xl font-bold">${balance.toFixed(2)}</div>
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent className="px-4">
        <SidebarGroup>
          <SidebarGroupLabel>Main Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className={location.pathname === item.href ? "bg-sidebar-accent" : ""}>
                    <Link to={item.href}>
                      <item.icon size={18} />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter className="px-4 py-4">
        <Button 
          variant="outline" 
          className="w-full justify-start gap-2 border-sidebar-accent text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground"
          onClick={logout}
        >
          <LogOut size={18} />
          <span>Logout</span>
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
