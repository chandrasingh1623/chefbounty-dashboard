import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth";
import { 
  LayoutDashboard, 
  Plus, 
  Calendar, 
  Gavel, 
  MessageCircle,
  User,
  Search,
  HandIcon as Hand,
  CreditCard,
  Settings,
  LogOut,
  UtensilsCrossed
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import logoImage from "@assets/ChefBounty Lg (2)_1753288571802.png";

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const [location] = useLocation();
  const { user, signOut } = useAuth();

  const hostNavItems = [
    { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard Overview" },
    { href: "/dashboard/post-event", icon: Plus, label: "Post New Event" },
    { href: "/dashboard/my-events", icon: Calendar, label: "My Events" },
    { href: "/dashboard/browse-events", icon: Search, label: "Browse Events" },
    { href: "/dashboard/browse-chefs", icon: UtensilsCrossed, label: "Browse Chefs" },
    { href: "/dashboard/bids", icon: Gavel, label: "View Bids" },
    { href: "/dashboard/messages", icon: MessageCircle, label: "Messages" },
  ];

  const chefNavItems = [
    { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard Overview" },
    { href: "/dashboard/profile", icon: User, label: "My Profile" },
    { href: "/dashboard/browse-events", icon: Search, label: "Browse Events" },
    { href: "/dashboard/browse-chefs", icon: UtensilsCrossed, label: "Browse Chefs" },
    { href: "/dashboard/my-bids", icon: Hand, label: "My Bids" },
    { href: "/dashboard/messages", icon: MessageCircle, label: "Messages" },
  ];

  const sharedNavItems = [
    { href: "/dashboard/payments", icon: CreditCard, label: "Payments" },
    { href: "/dashboard/settings", icon: Settings, label: "Settings" },
  ];

  const navItems = user?.role === "host" ? hostNavItems : chefNavItems;

  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return location === href;
    }
    return location.startsWith(href);
  };

  return (
    <div className={cn("w-64 bg-white shadow-sm border-r border-gray-200 flex flex-col", className)}>
      {/* Logo */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-center">
          <img 
            src={logoImage} 
            alt="ChefBounty" 
            className="h-16 w-auto object-contain"
            style={{ maxHeight: '64px', width: 'auto' }}
          />
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-4 space-y-1">
        {/* Role-specific navigation */}
        <div className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href}>
                <div
                  className={cn(
                    "flex items-center space-x-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors cursor-pointer",
                    isActive(item.href)
                      ? "text-primary bg-blue-50"
                      : "text-gray-700 hover:bg-gray-100"
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Shared navigation */}
        <div className="pt-4 border-t border-gray-200 mt-4 space-y-1">
          {sharedNavItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href}>
                <div
                  className={cn(
                    "flex items-center space-x-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors cursor-pointer",
                    isActive(item.href)
                      ? "text-primary bg-blue-50"
                      : "text-gray-700 hover:bg-gray-100"
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </div>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* User Profile & Logout */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center space-x-3 mb-3">
          <Avatar className="w-10 h-10">
            <AvatarImage src={user?.profilePhoto} />
            <AvatarFallback>{user?.name?.charAt(0) || 'U'}</AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-medium text-gray-900">{user?.name}</p>
            <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start text-gray-700 hover:bg-gray-100"
          onClick={signOut}
        >
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </Button>
      </div>
    </div>
  );
}
