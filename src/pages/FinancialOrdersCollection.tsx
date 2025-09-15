import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Package,
  Users,
  TrendingUp,
  RefreshCw,
  Calendar,
  Check,
  X,
  Eye,
  FileText,
  Download,
  DollarSign,
  ShoppingCart,
  BarChart3,
  Filter
} from 'lucide-react';
import { getSalesRepProductsData } from '@/api/OrdersCollection';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore } from '@/stores/authStore';

interface Product {
  productId: string;
  productName: string;
  productCode: string;
  productBrand: string;
  productPrice: number;
  quantity: number;
  totalValue: number;
}

interface Order {
  id: string;
  orderId: string;
  visitDate: string;
  createdAt: string;
  salesRepName: string;
  salesRepEmail: string;
  pharmacyName: string;
  pharmacyArea: string;
  pharmacyCity: string;
  products: Product[];
  totalOrderValue: number;
  orderStatus: string;
  FinalOrderStatus: boolean;
  FinalOrderStatusValue: string;
}

interface Statistics {
  summary: {
    totalQuantity: number;
    totalValue: number;
    totalOrders: number;
    uniqueProductsCount: number;
    averageOrderValue: number;
  };
  statusBreakdown: {
    totalAmount: number;
    pendingAmount: number;
    approvedAmount: number;
    rejectedAmount: number;
    totalRecords: number;
  };
  productBreakdown: {
    productName: string;
    totalQuantity: number;
    totalValue: number;
    orderCount: number;
  }[];
}

interface Pagination {
  currentPage: number;
  totalPages: number;
  totalRecords: number;
  limit: number;
}

const FinancialOrdersCollection: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({});
  const { toast } = useToast();
  const { user } = useAuthStore();

  const fetchData = async (page = 1, filterParams = {}) => {
    try {
      setLoading(true);
      const response = await getSalesRepProductsData({
        page,
        limit: 10,
        ...filterParams
      });
      
      if (response.success) {
        setOrders(response.data);
        setStatistics(response.statistics);
        setPagination(response.pagination);
      } else {
        toast({
          title: 'خطأ',
          description: response.message || 'فشل في جلب البيانات',
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      console.error('Error fetching data:', error);
      toast({
        title: 'خطأ',
        description: error.message || 'فشل في جلب البيانات',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(currentPage, filters);
  }, [currentPage]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">موافق عليه</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">قيد المراجعة</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-200">مرفوض</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-LY', {
      style: 'currency',
      currency: 'LYD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-LY', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center space-y-4">
          <RefreshCw className="h-8 w-8 animate-spin text-primary" />
          <p className="text-lg font-medium">جاري تحميل البيانات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-8 bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-gray-900 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          مجموعة الطلبات المالية
        </h1>
        <p className="text-lg text-gray-600">عرض شامل لجميع الطلبات والإحصائيات المالية</p>
      </div>

      {/* Statistics Cards */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium opacity-90">إجمالي القيمة</CardTitle>
              <DollarSign className="h-6 w-6 opacity-80" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{formatCurrency(statistics.summary.totalValue)}</div>
              <p className="text-xs opacity-80 mt-1">
                متوسط الطلب: {formatCurrency(statistics.summary.averageOrderValue)}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium opacity-90">إجمالي الطلبات</CardTitle>
              <ShoppingCart className="h-6 w-6 opacity-80" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{statistics.summary.totalOrders}</div>
              <p className="text-xs opacity-80 mt-1">
                الكمية الإجمالية: {statistics.summary.totalQuantity}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium opacity-90">المنتجات الفريدة</CardTitle>
              <Package className="h-6 w-6 opacity-80" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{statistics.summary.uniqueProductsCount}</div>
              <p className="text-xs opacity-80 mt-1">منتج مختلف</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium opacity-90">الطلبات المعتمدة</CardTitle>
              <Check className="h-6 w-6 opacity-80" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{formatCurrency(statistics.statusBreakdown.approvedAmount)}</div>
              <p className="text-xs opacity-80 mt-1">
                قيد المراجعة: {formatCurrency(statistics.statusBreakdown.pendingAmount)}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Orders Table */}
      <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b">
          <div className="flex justify-between items-center">
            <CardTitle className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <BarChart3 className="h-6 w-6 text-blue-600" />
              قائمة الطلبات
            </CardTitle>
            <Button 
              onClick={() => fetchData(currentPage, filters)}
              className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              تحديث
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50 hover:bg-gray-100">
                  <TableHead className="font-bold text-gray-700">رقم الطلب</TableHead>
                  <TableHead className="font-bold text-gray-700">مندوب المبيعات</TableHead>
                  <TableHead className="font-bold text-gray-700">الصيدلية</TableHead>
                  <TableHead className="font-bold text-gray-700">المنطقة</TableHead>
                  <TableHead className="font-bold text-gray-700">تاريخ الزيارة</TableHead>
                  <TableHead className="font-bold text-gray-700">قيمة الطلب</TableHead>
                  <TableHead className="font-bold text-gray-700">الحالة</TableHead>
                  <TableHead className="font-bold text-gray-700">المنتجات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order, index) => (
                  <TableRow 
                    key={order.id} 
                    className={`hover:bg-blue-50 transition-colors duration-200 ${
                      index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                    }`}
                  >
                    <TableCell className="font-medium text-blue-600">
                      #{order.orderId.slice(-8)}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium text-gray-900">{order.salesRepName}</span>
                        {order.salesRepEmail && (
                          <span className="text-sm text-gray-500">{order.salesRepEmail}</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium text-gray-900">{order.pharmacyName}</span>
                        <span className="text-sm text-gray-500">{order.pharmacyCity}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        {order.pharmacyArea}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-gray-600">
                      {formatDate(order.visitDate)}
                    </TableCell>
                    <TableCell>
                      <span className="font-bold text-green-600 text-lg">
                        {formatCurrency(order.totalOrderValue)}
                      </span>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(order.FinalOrderStatusValue)}
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {order.products.slice(0, 2).map((product, idx) => (
                          <div key={idx} className="text-sm">
                            <span className="font-medium text-gray-800">{product.productName}</span>
                            <span className="text-gray-500 ml-2">({product.quantity})</span>
                          </div>
                        ))}
                        {order.products.length > 2 && (
                          <div className="text-xs text-blue-600 font-medium">
                            +{order.products.length - 2} منتج آخر
                          </div>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Product Breakdown */}
      {statistics?.productBreakdown && statistics.productBreakdown.length > 0 && (
        <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-purple-100 border-b">
            <CardTitle className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <Package className="h-6 w-6 text-purple-600" />
              تفصيل المنتجات
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {statistics.productBreakdown.map((product, index) => (
                <Card key={index} className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 hover:shadow-lg transition-all duration-300">
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <h4 className="font-bold text-gray-800 text-lg">{product.productName}</h4>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">الكمية:</span>
                        <span className="font-semibold text-blue-600">{product.totalQuantity}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">القيمة:</span>
                        <span className="font-semibold text-green-600">{formatCurrency(product.totalValue)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">عدد الطلبات:</span>
                        <span className="font-semibold text-purple-600">{product.orderCount}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex justify-center items-center space-x-2 rtl:space-x-reverse">
          <Button
            variant="outline"
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="bg-white hover:bg-gray-50"
          >
            السابق
          </Button>
          
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
              const page = i + 1;
              return (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "outline"}
                  onClick={() => setCurrentPage(page)}
                  className={currentPage === page ? "bg-blue-600 hover:bg-blue-700" : "bg-white hover:bg-gray-50"}
                >
                  {page}
                </Button>
              );
            })}
          </div>
          
          <Button
            variant="outline"
            onClick={() => setCurrentPage(prev => Math.min(pagination.totalPages, prev + 1))}
            disabled={currentPage === pagination.totalPages}
            className="bg-white hover:bg-gray-50"
          >
            التالي
          </Button>
        </div>
      )}
    </div>
  );
};

export default FinancialOrdersCollection;