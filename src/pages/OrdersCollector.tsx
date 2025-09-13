import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Package, Calendar, User, Building2, RefreshCw, Edit3, TrendingUp, Users, Store, Download } from 'lucide-react';
import { 
  getOrdersWithFinalStatus, 
  getSalesReps, 
  getPharmacies, 
  exportFinalOrdersToExcel,
  FinalOrderData, 
  FilteredOrdersParams,
  FilteredOrdersResponse 
} from '@/api/OrdersCollection';
import { useToast } from '@/hooks/use-toast';
import { OrderEditModal } from '@/components/ui/OrderEditModal';
import { Pagination } from "@/components/ui/pagination";
import { OrdersFilter, FilterOptions } from '@/components/ui/OrdersFilter';

const OrdersCollector: React.FC = () => {
  const [orders, setOrders] = useState<FinalOrderData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<FinalOrderData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [salesReps, setSalesReps] = useState<Array<{ _id: string; firstName: string; lastName: string }>>([]);
  const [pharmacies, setPharmacies] = useState<Array<{ _id: string; customerSystemDescription: string }>>([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    hasNextPage: false,
    hasPrevPage: false
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
    totalValue: 0
  });
  const [exportLoading, setExportLoading] = useState(false);
  const { toast } = useToast();

  const fetchOrders = async (page: number = 1, currentFilters: FilterOptions = filters) => {
    try {
      setLoading(true);
      
      const params: FilteredOrdersParams = {
        page,
        limit: 10,
        ...(currentFilters.search && { search: currentFilters.search }),
        ...(currentFilters.status && currentFilters.status !== 'all' && { status: currentFilters.status as 'pending' | 'approved' | 'rejected' }),
        ...(currentFilters.salesRep && currentFilters.salesRep !== 'all' && { salesRep: currentFilters.salesRep }),
        ...(currentFilters.pharmacy && currentFilters.pharmacy !== 'all' && { pharmacy: currentFilters.pharmacy }),
        ...(currentFilters.startDate && { startDate: currentFilters.startDate.toISOString().split('T')[0] }),
        ...(currentFilters.endDate && { endDate: currentFilters.endDate.toISOString().split('T')[0] })
      };

      const response = await getOrdersWithFinalStatus(params);
      
      setOrders(response.data);
      setPagination({
        currentPage: response.currentPage,
        totalPages: response.totalPages,
        totalCount: response.totalCount,
        hasNextPage: response.hasNextPage,
        hasPrevPage: response.hasPrevPage
      });

      // حساب الإحصائيات
      const stats = response.data.reduce((acc, order) => {
        const total = calculateOrderTotal(order.orderDetails);
        acc.totalValue += total;
        acc.totalOrders++;
        
        switch (order.FinalOrderStatusValue) {
          case 'pending':
            acc.pendingOrders++;
            break;
          case 'approved':
            acc.approvedOrders++;
            break;
          case 'rejected':
            acc.rejectedOrders++;
            break;
        }
        return acc;
      }, {
        totalOrders: 0,
        pendingOrders: 0,
        approvedOrders: 0,
        rejectedOrders: 0,
        totalValue: 0
      });
      
      setStatistics(stats);
      
      if (page === 1) {
        toast({
          title: 'تم تحميل الطلبات بنجاح',
          description: `تم العثور على ${response.totalCount} طلب`,
        });
      }
    } catch (error) {
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

  const fetchFilterData = async () => {
    try {
      const [salesRepsResponse, pharmaciesResponse] = await Promise.all([
        getSalesReps(),
        getPharmacies()
      ]);
      
      setSalesReps(salesRepsResponse.data || []);
      setPharmacies(pharmaciesResponse.data || []);
    } catch (error) {
      console.error('Error fetching filter data:', error);
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchFilterData();
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchOrders(1, filters);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [filters]);

  const handleFiltersChange = (newFilters: FilterOptions) => {
    setFilters(newFilters);
  };

  const handlePageChange = (page: number) => {
    fetchOrders(page, filters);
  };

  const handleRefresh = () => {
    fetchOrders(pagination.currentPage, filters);
  };

  const handleExport = async () => {
    try {
      setExportLoading(true);
      
      const params: FilteredOrdersParams = {
        ...(filters.search && { search: filters.search }),
        ...(filters.status && filters.status !== 'all' && { status: filters.status as 'pending' | 'approved' | 'rejected' }),
        ...(filters.salesRep && filters.salesRep !== 'all' && { salesRep: filters.salesRep }),
        ...(filters.pharmacy && filters.pharmacy !== 'all' && { pharmacy: filters.pharmacy }),
        ...(filters.startDate && { startDate: filters.startDate.toISOString().split('T')[0] }),
        ...(filters.endDate && { endDate: filters.endDate.toISOString().split('T')[0] })
      };

      const blob = await exportFinalOrdersToExcel(params);
      
      // إنشاء رابط التحميل
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // تحديد اسم الملف
      const fileName = `الطلبات_النهائية_${new Date().toISOString().split('T')[0]}.xlsx`;
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
      
    } catch (error) {
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
    return new Date(dateString).toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
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

  const calculateOrderTotal = (orderDetails: FinalOrderData['orderDetails']) => {
    return orderDetails.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const handleEditOrder = (order: FinalOrderData) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedOrder(null);
  };

  const handleOrderUpdated = () => {
    fetchOrders();
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
            محصل الطلبيات
          </h1>
          <p className="text-muted-foreground mt-2">
            إدارة ومتابعة الطلبيات ذات الحالة النهائية
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
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{pagination.totalCount}</p>
              </div>
              <div className="p-2 bg-blue-200 dark:bg-blue-800 rounded-lg">
                <Package className="h-6 w-6 text-blue-600 dark:text-blue-400" />
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
                  {statistics.totalValue.toLocaleString()} د.ل
                </p>
              </div>
              <div className="p-2 bg-purple-200 dark:bg-purple-800 rounded-lg">
                <Store className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <OrdersFilter
        filters={filters}
        onFiltersChange={handleFiltersChange}
        salesReps={salesReps}
        pharmacies={pharmacies}
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
                  key={order.orderId} 
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
                          <Badge 
                            variant={order.FinalOrderStatusValue === 'approved' ? 'default' : 
                                   order.FinalOrderStatusValue === 'rejected' ? 'destructive' : 'secondary'}
                            className="animate-pulse"
                          >
                            {order.FinalOrderStatusValue === 'approved' ? '✅ مقبول' :
                             order.FinalOrderStatusValue === 'rejected' ? '❌ مرفوض' : '⏳ في الانتظار'}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {new Date(order.visitDate).toLocaleDateString('ar-EG')}
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
                            <span className="font-medium text-muted-foreground">المنتجات:</span>
                            <span className="font-semibold">{order.orderDetails.length} منتج</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>تم الإنشاء: {new Date(order.createdAt).toLocaleString('ar-EG')}</span>
                          {order.updatedAt !== order.createdAt && (
                            <span>آخر تحديث: {new Date(order.updatedAt).toLocaleString('ar-EG')}</span>
                          )}
                        </div>
                      </div>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditOrder(order)}
                        className="hover:bg-primary hover:text-primary-foreground transition-colors duration-200"
                      >
                        <Edit3 className="h-4 w-4 mr-2" />
                        عرض/تعديل
                      </Button>
                    </div>

                    <Separator className="my-4" />

                    <div>
                      <h4 className="font-medium mb-3">تفاصيل المنتجات:</h4>
                      <div className="space-y-2">
                        {order.orderDetails.map((item) => (
                          <div key={item._id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <Package className="w-4 h-4 text-muted-foreground" />
                                <span className="font-medium">{item.productName}</span>
                                <Badge variant="outline" className="text-xs">
                                  {item.productCode}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                                <span>السعر: {item.price.toFixed(2)} د.ل</span>
                                <span>الكمية: <span className="font-medium">{item.quantity}</span></span>
                                <span>المجموع: {(item.price * item.quantity).toFixed(2)} د.ل</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t">
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>تاريخ الإنشاء: {formatDate(order.createdAt)}</span>
                        <span>آخر تحديث: {formatDate(order.updatedAt)}</span>
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
            itemsPerPage={10}
          />
        </div>
      )}

      {/* Modal للتعديل */}
      <OrderEditModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        order={selectedOrder}
        onOrderUpdated={handleOrderUpdated}
      />
    </div>
  );
};

export default OrdersCollector;