import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster as HotToaster } from 'react-hot-toast';
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AppSidebar } from "@/components/AppSidebar";
import ProtectedRoute from "./components/ProtectedRoute";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import SamplesForm from "./pages/requests/SamplesForm";
import MarketingForm from "./pages/requests/MarketingForm";
import ProductsManagement from "./pages/ProductsManagement";
import DoctorsManagement from "./pages/DoctorsManagement";
import AddProduct from "./pages/AddProduct";
import UpdateProduct from "./pages/UpdateProduct";
import DocumentsManagement from "./pages/DocumentsManagement";
import ProductMessagesUpload from "./pages/ProductMessagesUpload";
import UsersUpload from "./pages/UsersUpload";
import DoctorsUpload from "./pages/DoctorsUpload";
import ClientsList from "./pages/ClientsList";
import CreateAdmin from "./pages/CreateAdmin";
import AllAdmins from "./pages/AllAdmins";
import SiteAnalytics from "./pages/SiteAnalytics";
import MarketingActivitiesUpload from "./pages/MarketingActivitiesUpload";
import MarketingActivitiesManagement from "./pages/MarketingActivitiesManagement";
import AddMarketingActivity from "./pages/AddMarketingActivity";
import AddDoctor from "./pages/AddDoctor";
import UpdateDoctor from "./pages/UpdateDoctor";
import ClinicsManagement from "./pages/ClinicsManagement";
import ClinicsAnalytics from "./pages/ClinicsAnalytics";
import Profile from "./pages/Profile";
import MyDataList from "./pages/MyDataList";
import CreateVisit from "./pages/CreateVisit";

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
                    {/* Public Routes */}
                    <Route path="/login" element={<Login />} />
                    
                    {/* Protected Routes */}
                    <Route path="/" element={
                      <ProtectedRoute>
                        <Index />
                      </ProtectedRoute>
                    } />
                    <Route path="/dashboards" element={
                      <ProtectedRoute>
                        <Dashboard />
                      </ProtectedRoute>
                    } />
                    <Route path="/dashboards/clinics" element={
                      <ProtectedRoute>
                        <Dashboard />
                      </ProtectedRoute>
                    } />
                    <Route path="/dashboards/pharmacies" element={
                      <ProtectedRoute>
                        <Dashboard />
                      </ProtectedRoute>
                    } />
                    <Route path="/reports" element={
                      <ProtectedRoute>
                        <Dashboard />
                      </ProtectedRoute>
                    } />
                    <Route path="/reports/clinics" element={
                      <ProtectedRoute>
                        <Dashboard />
                      </ProtectedRoute>
                    } />
                    <Route path="/visits" element={
                      <ProtectedRoute>
                        <Dashboard />
                      </ProtectedRoute>
                    } />
                    <Route path="/visits/clinic" element={
                      <ProtectedRoute>
                        <Dashboard />
                      </ProtectedRoute>
                    } />
                    <Route path="/visits/pharmacy" element={
                      <ProtectedRoute>
                        <Dashboard />
                      </ProtectedRoute>
                    } />
                    <Route path="/clients" element={
                      <ProtectedRoute>
                        <ClientsList />
                      </ProtectedRoute>
                    } />
                    <Route path="/orders" element={
                      <ProtectedRoute>
                        <Dashboard />
                      </ProtectedRoute>
                    } />
                    <Route path="/orders/samples" element={
                      <ProtectedRoute>
                        <Dashboard />
                      </ProtectedRoute>
                    } />
                    <Route path="/orders/marketing" element={
                      <ProtectedRoute>
                        <Dashboard />
                      </ProtectedRoute>
                    } />
                    <Route path="/collections" element={
                      <ProtectedRoute>
                        <Dashboard />
                      </ProtectedRoute>
                    } />
                    <Route path="/collections/financial" element={
                      <ProtectedRoute>
                        <Dashboard />
                      </ProtectedRoute>
                    } />
                    <Route path="/collections/orders" element={
                      <ProtectedRoute>
                        <Dashboard />
                      </ProtectedRoute>
                    } />
                    <Route path="/evaluations" element={
                      <ProtectedRoute>
                        <Dashboard />
                      </ProtectedRoute>
                    } />
                    <Route path="/evaluations/representatives" element={
                      <ProtectedRoute>
                        <Dashboard />
                      </ProtectedRoute>
                    } />
                    <Route path="/management" element={
                      <ProtectedRoute requiredRoles={['ADMIN', 'admin', 'manager']}>
                        <Dashboard />
                      </ProtectedRoute>
                    } />
                    <Route path="/management/work-days" element={
                      <ProtectedRoute requiredRoles={['ADMIN', 'admin', 'manager']}>
                        <Dashboard />
                      </ProtectedRoute>
                    } />
                    <Route path="/management/lost-orders" element={
                      <ProtectedRoute requiredRoles={['ADMIN', 'admin', 'manager']}>
                        <Dashboard />
                      </ProtectedRoute>
                    } />
                    <Route path="/management/data/products" element={
                      <ProtectedRoute requiredRoles={['ADMIN', 'admin', 'manager']}>
                        <ProductsManagement />
                      </ProtectedRoute>
                    } />
            <Route path="/management/data/products/add" element={
              <ProtectedRoute requiredRoles={['ADMIN', 'admin', 'manager']}>
                <AddProduct />
              </ProtectedRoute>
            } />
            <Route path="/management/data/products/update/:code" element={
              <ProtectedRoute requiredRoles={['ADMIN', 'admin', 'manager']}>
                <UpdateProduct />
              </ProtectedRoute>
            } />
            <Route path="/management/data/doctors" element={
              <ProtectedRoute requiredRoles={['ADMIN', 'admin', 'manager']}>
                <DoctorsManagement />
              </ProtectedRoute>
            } />
            <Route path="/management/doctors-upload" element={
              <ProtectedRoute requiredRoles={['ADMIN', 'admin', 'manager']}>
                <DoctorsUpload />
              </ProtectedRoute>
            } />
                    <Route path="/management/documents" element={
                      <ProtectedRoute requiredRoles={['ADMIN', 'admin', 'manager']}>
                        <DocumentsManagement />
                      </ProtectedRoute>
                    } />
                    <Route path="/management/product-messages" element={
                      <ProtectedRoute requiredRoles={['ADMIN', 'admin', 'manager']}>
                        <ProductMessagesUpload />
                      </ProtectedRoute>
                    } />
                    <Route path="/management/users-upload" element={
                      <ProtectedRoute requiredRoles={['ADMIN', 'admin']}>
                        <UsersUpload />
                      </ProtectedRoute>
                    } />
                    <Route path="/management/create-admin" element={
                      <ProtectedRoute requiredRoles={['SYSTEM_ADMIN']}>
                        <CreateAdmin />
                      </ProtectedRoute>
                    } />
                    <Route path="/management/all-admins" element={
                      <ProtectedRoute requiredRoles={['SYSTEM_ADMIN']}>
                        <AllAdmins />
                      </ProtectedRoute>
                    } />
                    <Route path="/management/site-analytics" element={
                      <ProtectedRoute requiredRoles={['SYSTEM_ADMIN']}>
                        <SiteAnalytics />
                      </ProtectedRoute>
                    } />
                    <Route path="/management/marketing-activities-upload" element={
                      <ProtectedRoute requiredRoles={['ADMIN', 'SYSTEM_ADMIN']}>
                        <MarketingActivitiesUpload />
                      </ProtectedRoute>
                    } />
                    <Route path="/management/marketing-activities" element={
                      <ProtectedRoute requiredRoles={['ADMIN', 'SYSTEM_ADMIN']}>
                        <MarketingActivitiesManagement />
                      </ProtectedRoute>
                    } />
                    <Route path="/management/marketing-activities/add" element={
                      <ProtectedRoute requiredRoles={['ADMIN', 'SYSTEM_ADMIN']}>
                        <AddMarketingActivity />
                      </ProtectedRoute>
                    } />
                    <Route path="/management/doctors/add" element={
                      <ProtectedRoute requiredRoles={['ADMIN']}>
                        <AddDoctor />
                      </ProtectedRoute>
                    } />
                    <Route path="/management/doctors/update/:id" element={
                      <ProtectedRoute requiredRoles={['ADMIN']}>
                        <UpdateDoctor />
                      </ProtectedRoute>
                    } />
                    <Route path="/management/clinics" element={
                      <ProtectedRoute requiredRoles={['ADMIN']}>
                        <ClinicsManagement />
                      </ProtectedRoute>
                    } />
                    <Route path="/analytics/clinics" element={
                      <ProtectedRoute requiredRoles={['ADMIN', 'admin', 'manager']}>
                        <ClinicsAnalytics />
                      </ProtectedRoute>
                    } />
                    <Route path="/profile" element={
                      <ProtectedRoute>
                        <Profile />
                      </ProtectedRoute>
                    } />
                    <Route path="/my-data" element={
                      <ProtectedRoute requiredRoles={['MEDICAL REP', 'medical rep']}>
                        <MyDataList />
                      </ProtectedRoute>
                    } />
                    <Route path="/create-visit" element={
                      <ProtectedRoute requiredRoles={['MEDICAL REP', 'medical rep']}>
                        <CreateVisit />
                      </ProtectedRoute>
                    } />
                    <Route path="/users" element={
                      <ProtectedRoute requiredRoles={['ADMIN', 'admin', 'manager']}>
                        <Dashboard />
                      </ProtectedRoute>
                    } />
                    <Route path="/users/add" element={
                      <ProtectedRoute requiredRoles={['ADMIN', 'admin']}>
                        <Dashboard />
                      </ProtectedRoute>
                    } />
                    <Route path="/sample-form" element={
                      <ProtectedRoute>
                        <SamplesForm />
                      </ProtectedRoute>
                    } />
                    <Route path="/marketing-form" element={
                      <ProtectedRoute>
                        <MarketingForm />
                      </ProtectedRoute>
                    } />
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
