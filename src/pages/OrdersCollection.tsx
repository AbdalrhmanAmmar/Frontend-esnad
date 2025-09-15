import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  getSalesRepProductsData, 
  exportOrdersData, 
  updateOrderStatus, 
  OrderData, 
  OrderStatistics, 
  OrderFilters 
} from '@/api/OrdersCollection';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore } from '@/stores/authStore';
import { 
  Package, 
  Calendar, 
  User, 
  Building2, 
  RefreshCw, 
  Edit3, 
  TrendingUp, 
  Users, 
  Store, 
  Download, 
  Check, 
  X,
  Eye,
  Filter,
  Receipt,
  DollarSign,
  ShoppingCart
} from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { Pagination } from "@/components/ui/pagination";
import { OrdersFilter, FilterOptions } from '@/components/ui/OrdersFilter';

const OrdersCollection: React.FC = () => {
  const { user } = useAuthStore();
  const { toast } = useToast();
  
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<OrderData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    hasNextPage: false,
    hasPrevPage: false,
    limit: 10
  });
  const [filters, setFilters] = useState<FilterOptions>({
    search: '',
    status: 'all',
    salesRep: 'all',
    pharmacy: 'all',
    startDate: null,
    endDate: null
  });
  const [statistics, setStatistics] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    approvedOrders: 0,
    rejectedOrders: 0,
    totalValue: 0,
    totalQuantity: 0,
    uniqueProductsCount: 0
  });
  const [statusBreakdown, setStatusBreakdown] = useState({
    totalAmount: 0,
    pendingAmount: 0,
    approvedAmount: 0,
    rejectedAmount: 0,
    totalRecords: 0
  });
  const [exportLoading, setExportLoading] = useState(false);
  const [updating, setUpdating] = useState<string | null>(null);
  const [statusModal, setStatusModal] = useState({
    isOpen: false,
    orderId: '',
    action: null as 'approve' | 'reject' | null,
    orderData: null as OrderData | null
  });

  const fetchData = async (page: number = 1, currentFilters: FilterOptions = filters) => {
    const id = user?.adminId || user?._id;
    if (!id) return;
    
    setLoading(true);
    try {
      const params: any = {
        page,
        limit: 10,
        ...(currentFilters.search && { search: currentFilters.search }),
        ...(currentFilters.status && currentFilters.status !== 'all' && { status: currentFilters.status as 'pending' | 'approved' | 'rejected' }),
        ...(currentFilters.salesRep && currentFilters.salesRep !== 'all' && { salesRepId: currentFilters.salesRep }),
        ...(currentFilters.pharmacy && currentFilters.pharmacy !== 'all' && { pharmacy: currentFilters.pharmacy }),
        ...(currentFilters.startDate && { startDate: currentFilters.startDate.toISOString().split('T')[0] }),
        ...(currentFilters.endDate && { endDate: currentFilters.endDate.toISOString().split('T')[0] })
      };

      const response = await getSalesRepProductsData(id, params);
      
      setOrders(response.data);
      setPagination({
        currentPage: response.pagination.currentPage,
        totalPages: response.pagination.totalPages,
        totalCount: response.pagination.totalRecords,
        hasNextPage: response.pagination.currentPage < response.pagination.totalPages,
        hasPrevPage: response.pagination.currentPage > 1,
        limit: response.pagination.limit
      });

      // حساب الإحصائيات
      const stats = {
        totalOrders: response.statistics.summary.totalOrders,
        pendingOrders: 0, // سيتم حسابها من البيانات
        approvedOrders: 0, // سيتم حسابها من البيانات
        rejectedOrders: 0, // سيتم حسابها من البيانات
        totalValue: response.statistics.summary.totalValue,
        totalQuantity: response.statistics.summary.totalQuantity,
        uniqueProductsCount: response.statistics.summary.uniqueProductsCount
      };

      // حساب الطلبات حسب الحالة
      response.data.forEach(order => {
        switch (order.orderStatus) {
          case 'pending':
            stats.pendingOrders++;
            break;
          case 'approved':
            stats.approvedOrders++;
            break;
          case 'rejected':
            stats.rejectedOrders++;
            break;
        }
      });

      setStatistics(stats);
      setStatusBreakdown(response.statistics.statusBreakdown || {
        totalAmount: 0,
        pendingAmount: 0,
        approvedAmount: 0,
        rejectedAmount: 0,
        totalRecords: 0
      });
      
      if (page === 1) {
        toast({
          title: 'تم تحميل الطلبات بنجاح',
          description: `تم العثور على ${response.pagination.totalRecords} طلب`,
        });
      }
    } catch (error: any) {
      console.error('Error fetching orders:', error);
      toast({
        title: 'خطأ في تحميل الطلبات',
        description: 'حدث خطأ أثناء تحميل الطلبات',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user?._id]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchData(1, filters);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [filters]);

  const handleFiltersChange = (newFilters: FilterOptions) => {
    setFilters(newFilters);
  };

  const handlePageChange = (page: number) => {
    fetchData(page, filters);
  };

  const handleRefresh = () => {
    fetchData(pagination.currentPage, filters);
  };

  const handleExport = async () => {
    const id = user?.adminId || user?._id;
    if (!id) return;
    
    setExportLoading(true);
    try {
      const params: any = {
        ...(filters.search && { search: filters.search }),
        ...(filters.status && filters.status !== 'all' && { status: filters.status as 'pending' | 'approved' | 'rejected' }),
        ...(filters.salesRep && filters.salesRep !== 'all' && { salesRepId: filters.salesRep }),
        ...(filters.pharmacy && filters.pharmacy !== 'all' && { pharmacy: filters.pharmacy }),
        ...(filters.startDate && { startDate: filters.startDate.toISOString().split('T')[0] }),
        ...(filters.endDate && { endDate: filters.endDate.toISOString().split('T')[0] })
      };

      const blob = await exportOrdersData(id, params);
      
      // إنشاء رابط التحميل
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // تحديد اسم الملف
      const fileName = `الطلبات_${new Date().toISOString().split('T')[0]}.xlsx`;
      link.download = fileName;
      
      // تحميل الملف
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast({
        title: '✅ تم التصدير بنجاح',
        description: 'تم تصدير الطلبيات إلى ملف Excel بنجاح',
      });
      
    } catch (error: any) {
      console.error('Error exporting orders:', error);
      toast({
        title: '❌ خطأ في التصدير',
        description: 'حدث خطأ أثناء تصدير الطلبيات',
        variant: 'destructive',
      });
    } finally {
      setExportLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd/MM/yyyy', { locale: ar });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'LYD',
      currencyDisplay: 'code'
    }).format(amount).replace('LYD', 'د.ل');
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: 'قيد الانتظار', variant: 'secondary' as const },
      approved: { label: 'مقبول', variant: 'default' as const },
      rejected: { label: 'مرفوض', variant: 'destructive' as const },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || {
      label: status,
      variant: 'outline' as const,
    };

    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const handleEditOrder = (order: OrderData) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedOrder(null);
  };

  const handleStatusUpdate = (orderId: string, action: 'approve' | 'reject', orderData: OrderData) => {
    setStatusModal({
      isOpen: true,
      orderId,
      action,
      orderData
    });
  };

  const confirmStatusUpdate = async () => {
    if (!statusModal.action || !statusModal.orderId || !user?.adminId) {
      toast({
        title: 'بيانات غير مكتملة',
        variant: 'destructive',
      });
      return;
    }

    setUpdating(statusModal.orderId);
    try {
      const newStatus = statusModal.action === 'approve' ? 'approved' : 'rejected';
      await updateOrderStatus(user.adminId, statusModal.orderId, newStatus);
      
      toast({
        title: 'تم التحديث بنجاح',
        description: `تم ${statusModal.action === 'approve' ? 'قبول' : 'رفض'} الطلب بنجاح`,
      });
      
      // إعادة تحميل البيانات
      await fetchData();
      
      // إغلاق الـ modal
      setStatusModal({
        isOpen: false,
        orderId: '',
        action: null,
        orderData: null
      });
    } catch (error: any) {
      toast({
        title: 'خطأ في تحديث حالة الطلب',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setUpdating(null);
    }
  };

  const cancelStatusUpdate = () => {
    setStatusModal({
      isOpen: false,
      orderId: '',
      action: null,
      orderData: null
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center space-x-2">
          <RefreshCw className="h-6 w-6 animate-spin" />
          <span>جاري تحميل الطلبات...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            تحصيل الطلبيات
          </h1>
          <p className="text-muted-foreground mt-2">
            إدارة ومتابعة طلبيات المندوبين والصيدليات
          </p>
        </div>
        <div className="flex gap-3">
          <Button 
            onClick={handleExport} 
            variant="default" 
            disabled={exportLoading}
            className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <Download className={`h-4 w-4 mr-2 ${exportLoading ? 'animate-bounce' : ''}`} />
            {exportLoading ? 'جاري التصدير...' : 'تصدير Excel'}
          </Button>
          <Button onClick={handleRefresh} variant="outline" disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            تحديث
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600 dark:text-blue-400">إجمالي الطلبات</p>
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{statistics.totalOrders}</p>
              </div>
              <div className="p-2 bg-blue-200 dark:bg-blue-800 rounded-lg">
                <ShoppingCart className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200 dark:border-green-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600 dark:text-green-400">مقبولة</p>
                <p className="text-2xl font-bold text-green-900 dark:text-green-100">{statistics.approvedOrders}</p>
              </div>
              <div className="p-2 bg-green-200 dark:bg-green-800 rounded-lg">
                <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-950 dark:to-yellow-900 border-yellow-200 dark:border-yellow-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-600 dark:text-yellow-400">في الانتظار</p>
                <p className="text-2xl font-bold text-yellow-900 dark:text-yellow-100">{statistics.pendingOrders}</p>
              </div>
              <div className="p-2 bg-yellow-200 dark:bg-yellow-800 rounded-lg">
                <Users className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-purple-200 dark:border-purple-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600 dark:text-purple-400">القيمة الإجمالية</p>
                <p className="text-xl font-bold text-purple-900 dark:text-purple-100">
                  {formatCurrency(statistics.totalValue)}
                </p>
              </div>
              <div className="p-2 bg-purple-200 dark:bg-purple-800 rounded-lg">
                <Store className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Status Breakdown Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="border-l-4 border-l-slate-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">إجمالي المبلغ</p>
                <p className="text-xl font-bold text-slate-900 dark:text-slate-100">
                  {formatCurrency(statusBreakdown.totalAmount)}
                </p>
              </div>
              <div className="p-2 bg-slate-200 dark:bg-slate-800 rounded-lg">
                <DollarSign className="h-6 w-6 text-slate-600 dark:text-slate-400" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-yellow-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-600 dark:text-yellow-400">قيد المراجعة</p>
                <p className="text-xl font-bold text-yellow-900 dark:text-yellow-100">
                  {formatCurrency(statusBreakdown.pendingAmount)}
                </p>
              </div>
              <div className="p-2 bg-yellow-200 dark:bg-yellow-800 rounded-lg">
                <Calendar className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600 dark:text-green-400">مقبول</p>
                <p className="text-xl font-bold text-green-900 dark:text-green-100">
                  {formatCurrency(statusBreakdown.approvedAmount)}
                </p>
              </div>
              <div className="p-2 bg-green-200 dark:bg-green-800 rounded-lg">
                <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-red-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-600 dark:text-red-400">مرفوض</p>
                <p className="text-xl font-bold text-red-900 dark:text-red-100">
                  {formatCurrency(statusBreakdown.rejectedAmount)}
                </p>
              </div>
              <div className="p-2 bg-red-200 dark:bg-red-800 rounded-lg">
                <Users className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600 dark:text-blue-400">إجمالي السجلات</p>
                <p className="text-xl font-bold text-blue-900 dark:text-blue-100">
                  {statusBreakdown.totalRecords}
                </p>
              </div>
              <div className="p-2 bg-blue-200 dark:bg-blue-800 rounded-lg">
                <Receipt className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <OrdersFilter
        filters={filters}
        onFiltersChange={handleFiltersChange}
        isLoading={loading}
      />

      {/* Orders List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            الطلبيات ({orders.length} من {pagination.totalCount})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center space-y-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                <p className="text-muted-foreground animate-pulse">جاري تحميل الطلبات...</p>
              </div>
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-12">
              <div className="bg-muted/20 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-4">
                <Package className="h-12 w-12 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">لا توجد طلبيات</h3>
              <p className="text-muted-foreground mb-4">لم يتم العثور على طلبيات تطابق معايير البحث</p>
              <Button onClick={handleRefresh} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                إعادة تحميل
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order, index) => (
                <Card 
                  key={order.id} 
                  className="border-l-4 border-l-primary/20 hover:shadow-md transition-all duration-200 hover:border-l-primary/40"
                  style={{
                    animationDelay: `${index * 50}ms`,
                    animation: 'fadeInUp 0.5s ease-out forwards'
                  }}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="space-y-3 flex-1">
                        <div className="flex items-center gap-3 flex-wrap">
                          <Badge variant="outline" className="font-mono">
                            #{order.orderId.slice(-8)}
                          </Badge>
                          {getStatusBadge(order.orderStatus || 'pending')}
                          <Badge variant="outline" className="text-xs">
                            {formatDate(order.visitDate)}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            <span className="font-medium text-muted-foreground">المندوب:</span>
                            <span className="font-semibold">{order.salesRepName}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span className="font-medium text-muted-foreground">الصيدلية:</span>
                            <span className="font-semibold">{order.pharmacyName}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                            <span className="font-medium text-muted-foreground">المنطقة:</span>
                            <span className="font-semibold">{order.pharmacyArea} - {order.pharmacyCity}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>تم الإنشاء: {formatDate(order.createdAt)}</span>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditOrder(order)}
                          className="hover:bg-primary hover:text-primary-foreground transition-colors duration-200"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          عرض التفاصيل
                        </Button>
                        
                        {(!order.orderStatus || order.orderStatus === 'pending') && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleStatusUpdate(order.id, 'approve', order)}
                              disabled={updating === order.id}
                              className="h-10 w-10 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleStatusUpdate(order.id, 'reject', order)}
                              disabled={updating === order.id}
                              className="h-10 w-10 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>

                    <Separator className="my-4" />

                    <div>
                      <h4 className="font-medium mb-3">تفاصيل المنتجات:</h4>
                      <div className="space-y-2">
                        {order.products.map((product) => (
                          <div key={product.productId} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <Package className="w-4 h-4 text-muted-foreground" />
                                <span className="font-medium">{product.productName}</span>
                                <Badge variant="outline" className="text-xs">
                                  {product.productCode}
                                </Badge>
                                <Badge variant="secondary" className="text-xs">
                                  {product.productBrand}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                                <span>السعر: {formatCurrency(product.productPrice)}</span>
                                <span>الكمية: <span className="font-medium">{product.quantity}</span></span>
                                <span>المجموع: {formatCurrency(product.totalValue)}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t flex justify-between">
                      <div className="text-sm text-muted-foreground">
                        القيمة الإجمالية للطلب: <span className="font-medium text-foreground">{formatCurrency(order.totalOrderValue)}</span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        الحالة: {getStatusBadge(order.orderStatus || 'pending')}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {!loading && orders.length > 0 && (
        <div className="flex justify-center">
          <Pagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            onPageChange={handlePageChange}
            showInfo={true}
            totalItems={pagination.totalCount}
            itemsPerPage={pagination.limit}
          />
        </div>
      )}

      {/* Order Details Modal */}
      <Dialog open={isModalOpen} onOpenChange={handleCloseModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>تفاصيل الطلب</DialogTitle>
            <DialogDescription>
              عرض تفاصيل الطلب رقم {selectedOrder?.orderId.slice(-8)}
            </DialogDescription>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">رقم الطلب</Label>
                  <p className="text-sm text-muted-foreground">{selectedOrder.orderId}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">تاريخ الزيارة</Label>
                  <p className="text-sm text-muted-foreground">{formatDate(selectedOrder.visitDate)}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">مندوب المبيعات</Label>
                  <p className="text-sm text-muted-foreground">{selectedOrder.salesRepName}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">البريد الإلكتروني</Label>
                  <p className="text-sm text-muted-foreground">{selectedOrder.salesRepEmail}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">الصيدلية</Label>
                  <p className="text-sm text-muted-foreground">{selectedOrder.pharmacyName}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">المنطقة</Label>
                  <p className="text-sm text-muted-foreground">{selectedOrder.pharmacyArea} - {selectedOrder.pharmacyCity}</p>
                </div>
              </div>
              
              <Separator />
              
              <div>
                <h4 className="font-medium mb-3">تفاصيل المنتجات:</h4>
                <div className="space-y-2">
                  {selectedOrder.products.map((product) => (
                    <div key={product.productId} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Package className="w-4 h-4 text-muted-foreground" />
                          <span className="font-medium">{product.productName}</span>
                          <Badge variant="outline" className="text-xs">
                            {product.productCode}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {product.productBrand}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                          <span>السعر: {formatCurrency(product.productPrice)}</span>
                          <span>الكمية: <span className="font-medium">{product.quantity}</span></span>
                          <span>المجموع: {formatCurrency(product.totalValue)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <Separator />
              
              <div className="flex justify-between items-center">
                <div>
                  <Label className="text-sm font-medium">القيمة الإجمالية</Label>
                  <p className="text-lg font-medium text-primary">{formatCurrency(selectedOrder.totalOrderValue)}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">الحالة</Label>
                  <div className="mt-1">{getStatusBadge(selectedOrder.orderStatus || 'pending')}</div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Status Update Confirmation Modal */}
      <Dialog open={statusModal.isOpen} onOpenChange={cancelStatusUpdate}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {statusModal.action === 'approve' ? 'تأكيد قبول الطلب' : 'تأكيد رفض الطلب'}
            </DialogTitle>
            <DialogDescription>
              {statusModal.action === 'approve' 
                ? 'هل أنت متأكد من قبول هذا الطلب؟ لن تتمكن من التراجع عن هذا الإجراء.'
                : 'هل أنت متأكد من رفض هذا الطلب؟ لن تتمكن من التراجع عن هذا الإجراء.'
              }
            </DialogDescription>
          </DialogHeader>
          
          {statusModal.orderData && (
            <div className="space-y-3 py-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-muted-foreground">الصيدلية:</span>
                  <p className="font-medium">{statusModal.orderData.pharmacyName}</p>
                </div>
                <div>
                  <span className="font-medium text-muted-foreground">المنتج:</span>
                  <p className="font-medium">{statusModal.orderData.products[0]?.productName}</p>
                </div>
                <div>
                  <span className="font-medium text-muted-foreground">الكمية:</span>
                  <p className="font-medium">{statusModal.orderData.products[0]?.quantity}</p>
                </div>
                <div>
                  <span className="font-medium text-muted-foreground">القيمة:</span>
                  <p className="font-medium">{formatCurrency(statusModal.orderData.totalOrderValue)}</p>
                </div>
              </div>
            </div>
          )}
          
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={cancelStatusUpdate}
              disabled={updating !== null}
            >
              إلغاء
            </Button>
            <Button
              onClick={confirmStatusUpdate}
              disabled={updating !== null}
              className={statusModal.action === 'approve' 
                ? 'bg-green-600 hover:bg-green-700' 
                : 'bg-red-600 hover:bg-red-700'
              }
            >
              {updating !== null ? 'جاري التحديث...' : 
                (statusModal.action === 'approve' ? 'تأكيد القبول' : 'تأكيد الرفض')
              }
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OrdersCollection;