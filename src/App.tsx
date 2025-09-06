import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster as HotToaster } from 'react-hot-toast';
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AppSidebar } from "@/components/AppSidebar";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import SamplesForm from "./pages/requests/SamplesForm";
import MarketingForm from "./pages/requests/MarketingForm";
import ProductsManagement from "./pages/ProductsManagement";
import DoctorsManagement from "./pages/DoctorsManagement";
import AddProduct from "./pages/AddProduct";
import UpdateProduct from "./pages/UpdateProduct";
import DocumentsManagement from "./pages/DocumentsManagement";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <ThemeProvider defaultTheme="light" storageKey="medical-rep-theme">
        <TooltipProvider>
          <SidebarProvider defaultOpen={true}>
            <div className="min-h-screen flex w-full">
              <SidebarInset>
                <header className="h-14 flex items-center border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                  <div className="flex items-center gap-2 px-4" style={{ direction: 'rtl' }}>
                    <h1 className="text-lg font-semibold text-foreground">نظام إدارة المندوبين الطبيين</h1>
                  </div>
                  <SidebarTrigger className="mr-4 ml-auto" />
                </header>
                
                <main className="flex-1 p-6 overflow-auto">
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/dashboards" element={<Dashboard />} />
                    <Route path="/dashboards/clinics" element={<Dashboard />} />
                    <Route path="/dashboards/pharmacies" element={<Dashboard />} />
                    <Route path="/reports" element={<Dashboard />} />
                    <Route path="/reports/clinics" element={<Dashboard />} />
                    <Route path="/visits" element={<Dashboard />} />
                    <Route path="/visits/clinic" element={<Dashboard />} />
                    <Route path="/visits/pharmacy" element={<Dashboard />} />
                    <Route path="/orders" element={<Dashboard />} />
                    <Route path="/orders/samples" element={<Dashboard />} />
                    <Route path="/orders/marketing" element={<Dashboard />} />
                    <Route path="/collections" element={<Dashboard />} />
                    <Route path="/collections/financial" element={<Dashboard />} />
                    <Route path="/collections/orders" element={<Dashboard />} />
                    <Route path="/evaluations" element={<Dashboard />} />
                    <Route path="/evaluations/representatives" element={<Dashboard />} />
                    <Route path="/management" element={<Dashboard />} />
                    <Route path="/management/work-days" element={<Dashboard />} />
                    <Route path="/management/lost-orders" element={<Dashboard />} />
                    <Route path="/management/data/products" element={<ProductsManagement />} />
            <Route path="/management/data/products/add" element={<AddProduct />} />
            <Route path="/management/data/products/update/:code" element={<UpdateProduct />} />
            <Route path="/management/data/doctors" element={<DoctorsManagement />} />
                    <Route path="/management/documents" element={<DocumentsManagement />} />
                    <Route path="/users" element={<Dashboard />} />
                    <Route path="/users/add" element={<Dashboard />} />
                    <Route path="/sample-form" element={<SamplesForm />} />
                    <Route path="/marketing-form" element={<MarketingForm />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </main>
              </SidebarInset>
              <AppSidebar />
            </div>
          </SidebarProvider>
          <Toaster />
          <Sonner />
          <HotToaster 
             position="top-center"
             reverseOrder={false}
             gutter={8}
             containerClassName=""
             containerStyle={{}}
             toastOptions={{
               // Define default options
               className: '',
               duration: 4000,
               style: {
                 background: 'hsl(var(--background))',
                 color: 'hsl(var(--foreground))',
                 border: '1px solid hsl(var(--border))',
                 borderRadius: '8px',
                 fontSize: '14px',
                 fontFamily: 'inherit',
                 direction: 'rtl',
                 textAlign: 'right'
               },
               // Default options for specific types
               success: {
                 duration: 3000,
                 iconTheme: {
                   primary: 'hsl(var(--primary))',
                   secondary: 'hsl(var(--primary-foreground))',
                 },
               },
               error: {
                 duration: 4000,
                 iconTheme: {
                   primary: 'hsl(var(--destructive))',
                   secondary: 'hsl(var(--destructive-foreground))',
                 },
               },
               loading: {
                 duration: Infinity,
               },
             }}
           />
        </TooltipProvider>
      </ThemeProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
