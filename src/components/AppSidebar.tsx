import React from "react";
import { 
  Home, 
  BarChart3, 
  FileText, 
  Users, 
  ShoppingCart,
  DollarSign,
  Star,
  Settings,
  UserCog,
  Moon,
  Sun,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Building2,
  Pill,
  ClipboardList,
  UserPlus,
  Calendar,
  FolderOpen,
  Package,
  CreditCard,
  Receipt,
  UserCheck,
  Stethoscope,
  Activity,
  Database,
  ShoppingBag,
  UserMinus
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { useTheme } from "@/components/ThemeProvider";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
  SidebarFooter
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";

const menuItems = [
  { id: "home", title: "الصفحة الرئيسية", url: "/", icon: Home, color: "text-blue-500" },
  { 
    id: "dashboards", 
    title: "لوحات التحكم", 
    icon: BarChart3, 
    color: "text-teal-500",
    subItems: [
      { id: "clinic-dashboard", title: "لوحة تحكم العيادات", url: "/dashboards/clinics", icon: Building2 },
      { id: "pharmacy-dashboard", title: "لوحة تحكم الصيدليات", url: "/dashboards/pharmacies", icon: Pill }
    ]
  },
  { 
    id: "reports", 
    title: "التقارير", 
    icon: FileText, 
    color: "text-green-500",
    subItems: [
      { id: "clinic-reports", title: "تقرير العيادات", url: "/reports/clinics", icon: Building2 },
      { id: "pharmacy-reports", title: "تقرير الصيدليات", url: "/reports/pharmacies", icon: Pill }
    ]
  },
  { 
    id: "visits", 
    title: "الزيارات", 
    icon: Users, 
    color: "text-purple-500",
    subItems: [
      { id: "clinic-visit", title: "تسجيل زيارة عيادة", url: "/visits/clinic", icon: Stethoscope },
      { id: "pharmacy-visit", title: "تسجيل زيارة صيدلية", url: "/visits/pharmacy", icon: Pill }
    ]
  },
  { 
    id: "orders", 
    title: "الطلبات", 
    icon: ShoppingCart, 
    color: "text-orange-500",
    subItems: [
      { id: "sample-order", title: "طلب عينات", url: "/sample-form", icon: Package },
      { id: "marketing-order", title: "طلب نشاط تسويقي", url: "/marketing-form", icon: Activity }
    ]
  },
  { 
    id: "collections", 
    title: "التحصيلات", 
    icon: DollarSign, 
    color: "text-emerald-500",
    subItems: [
      { id: "financial-collection", title: "تحصيل مالي", url: "/collections/financial", icon: CreditCard },
      { id: "order-collection", title: "تحصيل طلب", url: "/collections/orders", icon: Receipt }
    ]
  },
  { 
    id: "evaluations", 
    title: "التقييمات", 
    icon: Star, 
    color: "text-yellow-500",
    subItems: [
      { id: "rep-evaluation", title: "تقييم مندوب الزيارات", url: "/evaluations/representatives", icon: UserCheck }
    ]
  },
];

const managementItems = [
  { 
    id: "management", 
    title: "الإدارة العامة", 
    icon: Settings, 
    color: "text-gray-500",
    subItems: [
      { id: "work-days", title: "إدارة أيام العمل", url: "/management/work-days", icon: Calendar },
      { id: "documents", title: "إدارة المستندات", url: "/management/documents", icon: FolderOpen },
      { id: "lost-orders", title: "إدارة الطلبيات المفقودة", url: "/management/lost-orders", icon: Package },
      {
        id: "data-management",
        title: "إدارة البيانات",
        icon: Database,
        subItems: [
          { id: "products-management", title: "إدارة المنتجات", url: "/management/data/products", icon: ShoppingBag },
          { id: "doctors-management", title: "إدارة الأطباء", url: "/management/data/doctors", icon: UserMinus }
        ]
      }
    ]
  },
  { 
    id: "users", 
    title: "إدارة المستخدمين", 
    icon: UserCog, 
    color: "text-indigo-500",
    subItems: [
      { id: "add-user", title: "إضافة مستخدم", url: "/users/add", icon: UserPlus }
    ]
  },
];

export function AppSidebar() {
  const { state, toggleSidebar } = useSidebar();
  const location = useLocation();
  const { theme, setTheme } = useTheme();
  const currentPath = location.pathname;
  const isCollapsed = state === "collapsed";
  const [expandedItems, setExpandedItems] = React.useState<string[]>([]);

  const isActive = (path: string) => currentPath === path;
  
  const toggleExpanded = (itemId: string) => {
    setExpandedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  return (
    <Sidebar side="right" collapsible="offcanvas">
      <SidebarHeader className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-teal-500 rounded-lg flex items-center justify-center shadow-md">
              <span className="text-white font-bold text-sm">ES</span>
            </div>
            {!isCollapsed && (
              <div className="flex-1">
                <img src="/Images/logo.svg" alt="Esnad Logo" className="h-8 w-auto" />
              </div>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="h-8 w-8 p-0 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            {isCollapsed ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
          </Button>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-3 py-4">
        <SidebarGroup>
          <SidebarMenu className="space-y-2">
            {menuItems.map((item) => {
              const hasSubItems = item.subItems && item.subItems.length > 0;
              const isExpanded = expandedItems.includes(item.id);
              const active = item.url ? isActive(item.url) : false;
              
              return (
                <SidebarMenuItem key={item.id}>
                  {hasSubItems ? (
                    <>
                      <SidebarMenuButton 
                        onClick={() => toggleExpanded(item.id)}
                        className={`
                          w-full flex items-center space-x-3 rtl:space-x-reverse p-3 rounded-lg
                          transition-all duration-200 group relative cursor-pointer 
                          ${theme === 'dark'
                            ? 'hover:bg-gray-800 text-gray-300 hover:text-white' 
                            : 'hover:bg-gray-50 text-gray-700 hover:text-gray-900'
                          }
                        `}
                      >
                        <item.icon 
                          size={20} 
                          className={`flex-shrink-0 transition-colors ${item.color}`}
                        />
                        {!isCollapsed && (
                          <>
                            <span className="font-medium text-right flex-1 truncate">
                              {item.title}
                            </span>
                            <ChevronDown 
                              size={16} 
                              className={`transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                            />
                          </>
                        )}
                        
                        {/* Tooltip for collapsed state */}
                        {isCollapsed && (
                          <div className={`
                            absolute left-full ml-2 px-2 py-1 bg-gray-900 dark:bg-gray-700 text-white text-sm 
                            rounded-md opacity-0 group-hover:opacity-100 transition-opacity
                            pointer-events-none whitespace-nowrap z-50
                          `}>
                            {item.title}
                          </div>
                        )}
                      </SidebarMenuButton>
                      
                      {isExpanded && !isCollapsed && (
                        <div className="mr-6 mt-1 space-y-1">
                          {item.subItems.map((subItem) => {
                            const subActive = subItem.url ? isActive(subItem.url) : false;
                            const hasNestedSubItems = subItem.subItems && subItem.subItems.length > 0;
                            const isNestedExpanded = expandedItems.includes(subItem.id);
                            
                            return (
                              <div key={subItem.id}>
                                {hasNestedSubItems ? (
                                  <>
                                    <SidebarMenuButton 
                                      onClick={() => toggleExpanded(subItem.id)}
                                      className={`
                                        w-full flex items-center space-x-3 rtl:space-x-reverse p-2 rounded-lg
                                        transition-all duration-200 group relative cursor-pointer
                                        ${theme === 'dark'
                                          ? 'hover:bg-gray-800 text-gray-300 hover:text-white' 
                                          : 'hover:bg-gray-50 text-gray-700 hover:text-gray-900'
                                        }
                                      `}
                                    >
                                      <subItem.icon 
                                        size={16} 
                                        className="flex-shrink-0 transition-colors text-gray-500"
                                      />
                                      <span className="text-sm font-medium text-right flex-1 truncate">
                                        {subItem.title}
                                      </span>
                                      <ChevronDown 
                                        size={14} 
                                        className={`transition-transform duration-200 ${isNestedExpanded ? 'rotate-180' : ''}`}
                                      />
                                    </SidebarMenuButton>
                                    
                                    {isNestedExpanded && (
                                      <div className="mr-4 mt-1 space-y-1">
                                        {subItem.subItems.map((nestedItem) => {
                                          const nestedActive = isActive(nestedItem.url);
                                          return (
                                            <SidebarMenuButton key={nestedItem.id} asChild>
                                              <NavLink 
                                                to={nestedItem.url} 
                                                end 
                                                className={`
                                                  w-full flex items-center space-x-3 rtl:space-x-reverse p-2 rounded-lg
                                                  transition-all duration-200 group relative
                                                  ${nestedActive 
                                                    ? `${theme === 'dark'
                                                        ? 'bg-gradient-to-r from-blue-600 to-teal-600 text-white shadow-lg' 
                                                        : 'bg-gradient-to-r from-blue-500 to-teal-500 text-white shadow-md'
                                                      }` 
                                                    : `${theme === 'dark'
                                                        ? 'hover:bg-gray-800 text-gray-300 hover:text-white' 
                                                        : 'hover:bg-gray-50 text-gray-700 hover:text-gray-900'
                                                      }`
                                                  }
                                                `}
                                              >
                                                <nestedItem.icon 
                                                  size={14} 
                                                  className={`
                                                    flex-shrink-0 transition-colors
                                                    ${nestedActive ? 'text-white' : 'text-gray-400'}
                                                  `}
                                                />
                                                <span className="text-xs font-medium text-right flex-1 truncate">
                                                  {nestedItem.title}
                                                </span>
                                              </NavLink>
                                            </SidebarMenuButton>
                                          );
                                        })}
                                      </div>
                                    )}
                                  </>
                                ) : (
                                  <SidebarMenuButton asChild>
                                    <NavLink 
                                      to={subItem.url} 
                                      end 
                                      className={`
                                        w-full flex items-center space-x-3 rtl:space-x-reverse p-2 rounded-lg
                                        transition-all duration-200 group relative
                                        ${subActive 
                                          ? `${theme === 'dark'
                                              ? 'bg-gradient-to-r from-blue-600 to-teal-600 text-white shadow-lg' 
                                              : 'bg-gradient-to-r from-blue-500 to-teal-500 text-white shadow-md'
                                            }` 
                                          : `${theme === 'dark'
                                              ? 'hover:bg-gray-800 text-gray-300 hover:text-white' 
                                              : 'hover:bg-gray-50 text-gray-700 hover:text-gray-900'
                                            }`
                                        }
                                      `}
                                    >
                                      <subItem.icon 
                                        size={16} 
                                        className={`
                                          flex-shrink-0 transition-colors
                                          ${subActive ? 'text-white' : 'text-gray-500'}
                                        `}
                                      />
                                      <span className="text-sm font-medium text-right flex-1 truncate">
                                        {subItem.title}
                                      </span>
                                    </NavLink>
                                  </SidebarMenuButton>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </>
                  ) : (
                    <SidebarMenuButton asChild>
                      <NavLink 
                        to={item.url} 
                        end 
                        className={`
                          w-full flex items-center space-x-3 rtl:space-x-reverse p-3 rounded-lg
                          transition-all duration-200 group relative py-4
                          ${active 
                            ? `${theme === 'dark'
                                ? 'bg-gradient-to-r from-blue-600 to-teal-600 text-white shadow-lg' 
                                : 'bg-gradient-to-r from-blue-500 to-teal-500 text-white shadow-md'
                              }` 
                            : `${theme === 'dark'
                                ? 'hover:bg-gray-800 text-gray-300 hover:text-white' 
                                : 'hover:bg-gray-50 text-gray-700 hover:text-gray-900'
                              }`
                          }
                        `}
                      >
                        <item.icon 
                          size={20} 
                          className={`
                            flex-shrink-0 transition-colors
                            ${active ? 'text-white' : item.color}
                          `}
                        />
                        {!isCollapsed && (
                          <span className="font-medium text-right flex-1 truncate">
                            {item.title}
                          </span>
                        )}
                        
                        {/* Tooltip for collapsed state */}
                        {isCollapsed && (
                          <div className={`
                            absolute left-full ml-2 px-2 py-1 bg-gray-900 dark:bg-gray-700 text-white text-sm 
                            rounded-md opacity-0 group-hover:opacity-100 transition-opacity
                            pointer-events-none whitespace-nowrap z-50
                          `}>
                            {item.title}
                          </div>
                        )}
                      </NavLink>
                    </SidebarMenuButton>
                  )}
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>

        <SidebarGroup className="mt-6">
          <SidebarGroupLabel className="text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
            {!isCollapsed && "الإدارة"}
          </SidebarGroupLabel>
          <SidebarMenu className="space-y-2">
            {managementItems.map((item) => {
              const hasSubItems = item.subItems && item.subItems.length > 0;
              const isExpanded = expandedItems.includes(item.id);
              const active = item.url ? isActive(item.url) : false;
              
              return (
                <SidebarMenuItem key={item.id}>
                  {hasSubItems ? (
                    <>
                      <SidebarMenuButton 
                        onClick={() => toggleExpanded(item.id)}
                        className={`
                          w-full flex items-center space-x-3 rtl:space-x-reverse p-3 rounded-lg
                          transition-all duration-200 group relative cursor-pointer
                          ${theme === 'dark'
                            ? 'hover:bg-gray-800 text-gray-300 hover:text-white' 
                            : 'hover:bg-gray-50 text-gray-700 hover:text-gray-900'
                          }
                        `}
                      >
                        <item.icon 
                          size={20} 
                          className={`flex-shrink-0 transition-colors ${item.color}`}
                        />
                        {!isCollapsed && (
                          <>
                            <span className="font-medium text-right flex-1 truncate">
                              {item.title}
                            </span>
                            <ChevronDown 
                              size={16} 
                              className={`transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                            />
                          </>
                        )}
                        
                        {/* Tooltip for collapsed state */}
                        {isCollapsed && (
                          <div className={`
                            absolute left-full ml-2 px-2 py-1 bg-gray-900 dark:bg-gray-700 text-white text-sm 
                            rounded-md opacity-0 group-hover:opacity-100 transition-opacity
                            pointer-events-none whitespace-nowrap z-50
                          `}>
                            {item.title}
                          </div>
                        )}
                      </SidebarMenuButton>
                      
                      {isExpanded && !isCollapsed && (
                        <div className="mr-6 mt-1 space-y-1">
                          {item.subItems.map((subItem) => {
                            const subActive = subItem.url ? isActive(subItem.url) : false;
                            const hasNestedSubItems = subItem.subItems && subItem.subItems.length > 0;
                            const isNestedExpanded = expandedItems.includes(subItem.id);
                            
                            return (
                              <div key={subItem.id}>
                                {hasNestedSubItems ? (
                                  <>
                                    <SidebarMenuButton 
                                      onClick={() => toggleExpanded(subItem.id)}
                                      className={`
                                        w-full flex items-center space-x-3 rtl:space-x-reverse p-2 rounded-lg
                                        transition-all duration-200 group relative cursor-pointer
                                        ${theme === 'dark'
                                          ? 'hover:bg-gray-800 text-gray-300 hover:text-white' 
                                          : 'hover:bg-gray-50 text-gray-700 hover:text-gray-900'
                                        }
                                      `}
                                    >
                                      <subItem.icon 
                                        size={16} 
                                        className="flex-shrink-0 transition-colors text-gray-500"
                                      />
                                      <span className="text-sm font-medium text-right flex-1 truncate">
                                        {subItem.title}
                                      </span>
                                      <ChevronDown 
                                        size={14} 
                                        className={`transition-transform duration-200 ${isNestedExpanded ? 'rotate-180' : ''}`}
                                      />
                                    </SidebarMenuButton>
                                    
                                    {isNestedExpanded && (
                                      <div className="mr-4 mt-1 space-y-1">
                                        {subItem.subItems.map((nestedItem) => {
                                          const nestedActive = isActive(nestedItem.url);
                                          return (
                                            <SidebarMenuButton key={nestedItem.id} asChild>
                                              <NavLink 
                                                to={nestedItem.url} 
                                                end 
                                                className={`
                                                  w-full flex items-center space-x-3 rtl:space-x-reverse p-2 rounded-lg
                                                  transition-all duration-200 group relative
                                                  ${nestedActive 
                                                    ? `${theme === 'dark'
                                                        ? 'bg-gradient-to-r from-blue-600 to-teal-600 text-white shadow-lg' 
                                                        : 'bg-gradient-to-r from-blue-500 to-teal-500 text-white shadow-md'
                                                      }` 
                                                    : `${theme === 'dark'
                                                        ? 'hover:bg-gray-800 text-gray-300 hover:text-white' 
                                                        : 'hover:bg-gray-50 text-gray-700 hover:text-gray-900'
                                                      }`
                                                  }
                                                `}
                                              >
                                                <nestedItem.icon 
                                                  size={14} 
                                                  className={`
                                                    flex-shrink-0 transition-colors
                                                    ${nestedActive ? 'text-white' : 'text-gray-400'}
                                                  `}
                                                />
                                                <span className="text-xs font-medium text-right flex-1 truncate">
                                                  {nestedItem.title}
                                                </span>
                                              </NavLink>
                                            </SidebarMenuButton>
                                          );
                                        })}
                                      </div>
                                    )}
                                  </>
                                ) : (
                                  <SidebarMenuButton asChild>
                                    <NavLink 
                                      to={subItem.url} 
                                      end 
                                      className={`
                                        w-full flex items-center space-x-3 rtl:space-x-reverse p-2 rounded-lg
                                        transition-all duration-200 group relative
                                        ${subActive 
                                          ? `${theme === 'dark'
                                              ? 'bg-gradient-to-r from-blue-600 to-teal-600 text-white shadow-lg' 
                                              : 'bg-gradient-to-r from-blue-500 to-teal-500 text-white shadow-md'
                                            }` 
                                          : `${theme === 'dark'
                                              ? 'hover:bg-gray-800 text-gray-300 hover:text-white' 
                                              : 'hover:bg-gray-50 text-gray-700 hover:text-gray-900'
                                            }`
                                        }
                                      `}
                                    >
                                      <subItem.icon 
                                        size={16} 
                                        className={`
                                          flex-shrink-0 transition-colors
                                          ${subActive ? 'text-white' : 'text-gray-500'}
                                        `}
                                      />
                                      <span className="text-sm font-medium text-right flex-1 truncate">
                                        {subItem.title}
                                      </span>
                                    </NavLink>
                                  </SidebarMenuButton>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </>
                  ) : (
                    <SidebarMenuButton asChild>
                      <NavLink 
                        to={item.url} 
                        end 
                        className={`
                          w-full flex items-center space-x-3 rtl:space-x-reverse p-3 rounded-lg
                          transition-all duration-200 group relative
                          ${active 
                            ? `${theme === 'dark'
                                ? 'bg-gradient-to-r from-blue-600 to-teal-600 text-white shadow-lg py-3' 
                                : 'bg-gradient-to-r from-blue-500 to-teal-500 text-white shadow-md py-3'
                              }` 
                            : `${theme === 'dark'
                                ? 'hover:bg-gray-800 text-gray-300 hover:text-white' 
                                : 'hover:bg-gray-50 text-gray-700 hover:text-gray-900'
                              }`
                          }
                        `}
                      >
                        <item.icon 
                          size={20} 
                          className={`
                            flex-shrink-0 transition-colors
                            ${active ? 'text-white' : item.color}
                          `}
                        />
                        {!isCollapsed && (
                          <span className="font-medium text-right flex-1 truncate">
                            {item.title}
                          </span>
                        )}
                        
                        {/* Tooltip for collapsed state */}
                        {isCollapsed && (
                          <div className={`
                            absolute left-full ml-2 px-2 py-1 bg-gray-900 dark:bg-gray-700 text-white text-sm 
                            rounded-md opacity-0 group-hover:opacity-100 transition-opacity
                            pointer-events-none whitespace-nowrap z-50
                          `}>
                            {item.title}
                          </div>
                        )}
                      </NavLink>
                    </SidebarMenuButton>
                  )}
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-gray-200 dark:border-gray-700">
        <Button
          variant="ghost"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className={`
            w-full flex items-center space-x-3 rtl:space-x-reverse p-3 
            rounded-lg transition-colors
            ${theme === 'dark' 
              ? 'hover:bg-gray-800 text-gray-300 hover:text-white' 
              : 'hover:bg-gray-50 text-gray-700 hover:text-gray-900'
            }
          `}
          size="default"
        >
          {theme === "dark" ? (
            <Sun size={20} className="text-amber-500" />
          ) : (
            <Moon size={20} className="text-blue-500" />
          )}
          {!isCollapsed && (
            <span className="font-medium">
              {theme === "dark" ? "الوضع المضيء" : "الوضع المظلم"}
            </span>
          )}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}