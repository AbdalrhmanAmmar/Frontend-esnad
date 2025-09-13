import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore } from '@/stores/authStore';
import { getSalesRepProductsData, exportOrdersData, updateOrderStatus, OrderData, OrderStatistics, OrderFilters } from '@/api/OrdersCollection';
import { ShoppingCart, Package, TrendingUp, Users, Calendar, Filter, Download, RefreshCw, Eye, DollarSign, Receipt, Check, X } from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import toast from 'react-hot-toast';

const OrdersCollection = () => {
  const { user } = useAuthStore();
  
  const [data, setData] = useState<OrderData[]>([]);
  const [statistics, setStatistics] = useState<OrderStatistics>({
    summary: {
      totalQuantity: 0,
      totalValue: 0,
      totalOrders: 0,
      uniqueProductsCount: 0,
      averageOrderValue: 0
    },
    productBreakdown: []
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalRecords: 0,
    limit: 10
  });
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<OrderFilters>({
    page: 1,
    limit: 10
  });
  const [selectedOrder, setSelectedOrder] = useState<OrderData | null>(null);
  const [exporting, setExporting] = useState(false);
  const [statusBreakdown, setStatusBreakdown] = useState<any>({
    totalAmount: 0,
    pendingAmount: 0,
    approvedAmount: 0,
    rejectedAmount: 0,
    totalRecords: 0
  });
  const [updating, setUpdating] = useState<string | null>(null);
  const [statusModal, setStatusModal] = useState<{
    isOpen: boolean;
    orderId: string;
    action: 'approve' | 'reject' | null;
    orderData: OrderData | null;
  }>({
    isOpen: false,
    orderId: '',
    action: null,
    orderData: null
  });

  const fetchData = async () => {
    const id = user?.adminId || user?._id;
    if (!user?._id) return;
    
    setLoading(true);
    try {
      const response = await getSalesRepProductsData(id, filters);
      console.log(response, 'response');
      setData(response.data);
      setStatistics(response.statistics);
      setPagination(response.pagination);
      setStatusBreakdown(response.statistics?.statusBreakdown || {
        totalAmount: 0,
        pendingAmount: 0,
        approvedAmount: 0,
        rejectedAmount: 0,
        totalRecords: 0
      });
    } catch (error: any) {
      toast.error(`خطأ في جلب البيانات: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filters, user?.id]);

  const handleFilterChange = (key: keyof OrderFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
  };

  const handleExport = async () => {
    const id = user?.supervisor?.adminId || user?._id;
    if (!id) return;
    
    setExporting(true);
    try {
      const blob = await exportOrdersData(id, filters);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `orders-collection-${format(new Date(), 'yyyy-MM-dd')}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success('تم تصدير بيانات تحصيل الطلبيات بنجاح ✅');
    } catch (error: any) {
      toast.error(`خطأ في التصدير: ${error.message}`);
    } finally {
      setExporting(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'LYD',
      currencyDisplay: 'code'
    }).format(amount).replace('LYD', 'د.ل');
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd/MM/yyyy', { locale: ar });
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
      toast.error('بيانات غير مكتملة');
      return;
    }

    setUpdating(statusModal.orderId);
    try {
      const newStatus = statusModal.action === 'approve' ? 'approved' : 'rejected';
      await updateOrderStatus(statusModal.orderId, newStatus, user.adminId);
      
      toast.success(`تم ${statusModal.action === 'approve' ? 'قبول' : 'رفض'} الطلب بنجاح`);
      
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
      toast.error(`خطأ في تحديث حالة الطلب: ${error.message}`);
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800 border-green-200">مقبول</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800 border-red-200">مرفوض</Badge>;
      case 'pending':
      default:
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">قيد المراجعة</Badge>;
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">تحصيل الطلبيات</h1>
          <p className="text-muted-foreground mt-1">إدارة ومراجعة طلبيات المندوبين والصيدليات</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleExport} disabled={exporting || loading} variant="outline" className="gap-2">
            <Download className={`w-4 h-4 ${exporting ? 'animate-spin' : ''}`} />
            {exporting ? 'جاري التصدير...' : 'تصدير إلى Excel'}
          </Button>
          <Button onClick={fetchData} disabled={loading} className="gap-2">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            تحديث البيانات
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-primary">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الطلبيات</CardTitle>
            <ShoppingCart className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{statistics.summary.totalOrders.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">طلبية مسجلة</p>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الكمية</CardTitle>
            <Package className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{statistics.summary.totalQuantity.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">قطعة مطلوبة</p>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي القيمة</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(statistics.summary.totalValue)}</div>
            <p className="text-xs text-muted-foreground mt-1">قيمة إجمالية</p>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">المنتجات المختلفة</CardTitle>
            <Receipt className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{statistics.summary.uniqueProductsCount}</div>
            <p className="text-xs text-muted-foreground mt-1">منتج مختلف</p>
          </CardContent>
        </Card>
      </div>

      {/* Status Breakdown Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="border-l-4 border-l-slate-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي المبلغ</CardTitle>
            <DollarSign className="h-4 w-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-600">{formatCurrency(statusBreakdown.totalAmount)}</div>
            <p className="text-xs text-muted-foreground mt-1">المبلغ الكلي</p>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-yellow-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">قيد المراجعة</CardTitle>
            <Calendar className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{formatCurrency(statusBreakdown.pendingAmount)}</div>
            <p className="text-xs text-muted-foreground mt-1">في انتظار الموافقة</p>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">مقبول</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(statusBreakdown.approvedAmount)}</div>
            <p className="text-xs text-muted-foreground mt-1">تم الموافقة عليه</p>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-red-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">مرفوض</CardTitle>
            <Users className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{formatCurrency(statusBreakdown.rejectedAmount)}</div>
            <p className="text-xs text-muted-foreground mt-1">تم رفضه</p>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي السجلات</CardTitle>
            <Receipt className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{statusBreakdown.totalRecords}</div>
            <p className="text-xs text-muted-foreground mt-1">سجل مالي</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            الفلاتر
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">من تاريخ</Label>
              <Input
                id="startDate"
                type="date"
                value={filters.startDate || ''}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="endDate">إلى تاريخ</Label>
              <Input
                id="endDate"
                type="date"
                value={filters.endDate || ''}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="salesRepId">مندوب المبيعات</Label>
              <Input
                id="salesRepId"
                placeholder="اختر مندوب المبيعات"
                value={filters.salesRepId || ''}
                onChange={(e) => handleFilterChange('salesRepId', e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="productId">المنتج</Label>
              <Input
                id="productId"
                placeholder="اختر المنتج"
                value={filters.productId || ''}
                onChange={(e) => handleFilterChange('productId', e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>قائمة الطلبيات</CardTitle>
          <CardDescription>
            عرض {data.length} من أصل {pagination.totalRecords} طلبية
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>رقم الطلب</TableHead>
                  <TableHead>تاريخ الزيارة</TableHead>
                  <TableHead>مندوب المبيعات</TableHead>
                  <TableHead>الصيدلية</TableHead>
                  <TableHead>المنتج</TableHead>
                      <TableHead>الكود</TableHead>
                      <TableHead>العلامة التجارية</TableHead>
                      <TableHead>الكمية</TableHead>
                      <TableHead>السعر</TableHead>
                      <TableHead>القيمة الإجمالية</TableHead>
                      <TableHead>الحالة</TableHead>
                      <TableHead>الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8">
                      <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />
                      جاري تحميل البيانات...
                    </TableCell>
                  </TableRow>
                ) : data.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                      لا توجد طلبيات متاحة
                    </TableCell>
                  </TableRow>
                ) : (
                  data.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">
                        {order.orderId.slice(-8)}
                      </TableCell>
                      <TableCell>{formatDate(order.visitDate)}</TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{order.salesRepName}</div>
                          <div className="text-sm text-muted-foreground">{order.salesRepEmail}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{order.pharmacyName}</div>
                          <div className="text-sm text-muted-foreground">
                            {order.pharmacyArea} - {order.pharmacyCity}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{order.productName}</div>
                          <div className="text-sm text-muted-foreground">{order.productDescription}</div>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{order.productCode}</TableCell>
                      <TableCell className="text-muted-foreground">{order.productBrand}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{order.quantity}</Badge>
                      </TableCell>
                      <TableCell>{formatCurrency(order.productPrice)}</TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(order.totalValue)}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(order.orderStatus || 'pending')}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedOrder(order)}
                                className="h-8 w-8 p-0"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
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
                                  <div>
                                    <Label className="text-sm font-medium">المنتج</Label>
                                    <p className="text-sm text-muted-foreground">{selectedOrder.productName}</p>
                                  </div>
                                  <div>
                                    <Label className="text-sm font-medium">وصف المنتج</Label>
                                    <p className="text-sm text-muted-foreground">{selectedOrder.productDescription}</p>
                                  </div>
                                  <div>
                                    <Label className="text-sm font-medium">كود المنتج</Label>
                                    <p className="text-sm text-muted-foreground">{selectedOrder.productCode}</p>
                                  </div>
                                  <div>
                                    <Label className="text-sm font-medium">العلامة التجارية</Label>
                                    <p className="text-sm text-muted-foreground">{selectedOrder.productBrand}</p>
                                  </div>
                                  <div>
                                    <Label className="text-sm font-medium">الكمية</Label>
                                    <p className="text-sm text-muted-foreground">{selectedOrder.quantity}</p>
                                  </div>
                                  <div>
                                    <Label className="text-sm font-medium">سعر الوحدة</Label>
                                    <p className="text-sm text-muted-foreground">{formatCurrency(selectedOrder.productPrice)}</p>
                                  </div>
                                  <div>
                                    <Label className="text-sm font-medium">القيمة الإجمالية</Label>
                                    <p className="text-sm font-medium text-primary">{formatCurrency(selectedOrder.totalValue)}</p>
                                  </div>
                                </div>
                              </div>
                            )}
                          </DialogContent>
                          </Dialog>
                          {(!order.orderStatus || order.orderStatus === 'pending') && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleStatusUpdate(order.id, 'approve', order)}
                                disabled={updating === order.id}
                                className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleStatusUpdate(order.id, 'reject', order)}
                                disabled={updating === order.id}
                                className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">
                عرض {((pagination.currentPage - 1) * pagination.limit) + 1} إلى {Math.min(pagination.currentPage * pagination.limit, pagination.totalRecords)} من أصل {pagination.totalRecords} نتيجة
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={pagination.currentPage === 1}
                >
                  السابق
                </Button>
                <div className="flex items-center space-x-1">
                  {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                    const page = i + 1;
                    return (
                      <Button
                        key={page}
                        variant={pagination.currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => handlePageChange(page)}
                      >
                        {page}
                      </Button>
                    );
                  })}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={pagination.currentPage === pagination.totalPages}
                >
                  التالي
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Product Breakdown */}
      {statistics.productBreakdown.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>تفصيل المنتجات</CardTitle>
            <CardDescription>إحصائيات مفصلة حسب المنتج</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>اسم المنتج</TableHead>
                    <TableHead>إجمالي الكمية</TableHead>
                    <TableHead>إجمالي القيمة</TableHead>
                    <TableHead>عدد الطلبات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {statistics.productBreakdown.map((product, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{product.productName}</TableCell>
                      <TableCell>{product.totalQuantity.toLocaleString()}</TableCell>
                      <TableCell>{formatCurrency(product.totalValue)}</TableCell>
                      <TableCell>{product.orderCount}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

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
                    <p className="font-medium">{statusModal.orderData.productName}</p>
                  </div>
                  <div>
                    <span className="font-medium text-muted-foreground">الكمية:</span>
                    <p className="font-medium">{statusModal.orderData.quantity}</p>
                  </div>
                  <div>
                    <span className="font-medium text-muted-foreground">القيمة:</span>
                    <p className="font-medium">{formatCurrency(statusModal.orderData.totalValue)}</p>
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