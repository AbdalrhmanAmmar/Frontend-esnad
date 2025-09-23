import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { getSalesRepFinalOrders } from '@/api/FinancialCollector';
import {
  Search,
  Filter,
  Download,
  Eye,
  Calendar,
  MapPin,
  User,
  Package,
  DollarSign,
  TrendingUp,
  BarChart3,
  PieChart,
  Users,
  ShoppingCart,
  Building2,
  Activity
} from 'lucide-react';
import { Bar, Pie, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { useAuthStore } from '@/stores/authStore';


ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface Product {
  productId: string;
  productName: string;
  productCode: string;
  productBrand: string;
  price: number;
  quantity: number;
  totalValue: number;
}

interface OrderData {
  orderId: string;
  visitDate: string;
  salesRepName: string;
  pharmacyName: string;
  pharmacyAddress: string;
  pharmacyArea: string;
  products: Product[];
  totalOrderValue: number;
  orderStatus: string;
  FinalOrderStatusValue: string;
  createdAt: string;
}

interface ApiResponse {
  success: boolean;
  message: string;
  data: OrderData[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalRecords: number;
    limit: number;
  };
}

interface Filters {
  search: string;
  area: string;
  salesRep: string;
  status: string;
  dateFrom: string;
  dateTo: string;
}

const AdminDashboard: React.FC = () => {
  const user = useAuthStore()
  const [ordersData, setOrdersData] = useState<OrderData[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [filters, setFilters] = useState<Filters>({
    search: '',
    area: 'all',
    salesRep: 'all',
    status: 'all',
    dateFrom: '',
    dateTo: ''
  });

      const filteredData = React.useMemo(() => {
    return ordersData.filter(order => {
      const matchesSearch = !filters.search || 
        order.pharmacyName.toLowerCase().includes(filters.search.toLowerCase()) ||
        order.salesRepName.toLowerCase().includes(filters.search.toLowerCase()) ||
        order.orderId.toLowerCase().includes(filters.search.toLowerCase());
      
      const matchesArea = !filters.area || filters.area === 'all' || order.pharmacyArea === filters.area;
      const matchesSalesRep = !filters.salesRep || filters.salesRep === 'all' || order.salesRepName === filters.salesRep;
      const matchesStatus = !filters.status || filters.status === 'all' || order.FinalOrderStatusValue === filters.status;
      
      return matchesSearch && matchesArea && matchesSalesRep && matchesStatus;
    });
  }, [ordersData, filters]);

  // إحصائيات محسوبة
  const stats = React.useMemo(() => {
    const totalOrders = filteredData.length;
    const totalRevenue = filteredData.reduce((sum, order) => sum + order.totalOrderValue, 0);
    const uniquePharmacies = new Set(filteredData.map(order => order.pharmacyName)).size;
    const uniqueSalesReps = new Set(filteredData.map(order => order.salesRepName)).size;
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    return {
      totalOrders,
      totalRevenue,
      uniquePharmacies,
      uniqueSalesReps,
      avgOrderValue
    };
  }, [filteredData]);

  // بيانات الرسوم البيانية
  const chartData = React.useMemo(() => {
    // أداء مندوبي المبيعات
    const salesRepPerformance = filteredData.reduce((acc, order) => {
      const rep = order.salesRepName;
      if (!acc[rep]) {
        acc[rep] = { orders: 0, revenue: 0 };
      }
      acc[rep].orders += 1;
      acc[rep].revenue += order.totalOrderValue;
      return acc;
    }, {} as Record<string, { orders: number; revenue: number }>);

    // أداء المناطق
    const areaPerformance = filteredData.reduce((acc, order) => {
      const area = order.pharmacyArea;
      if (!acc[area]) {
        acc[area] = { orders: 0, revenue: 0 };
      }
      acc[area].orders += 1;
      acc[area].revenue += order.totalOrderValue;
      return acc;
    }, {} as Record<string, { orders: number; revenue: number }>);

    // أداء المنتجات
    const productSales = ordersData.reduce((acc, order) => {
      order.products.forEach(product => {
        const brand = product.productBrand;
        if (!acc[brand]) {
          acc[brand] = { quantity: 0, revenue: 0 };
        }
        acc[brand].quantity += product.quantity;
        acc[brand].revenue += product.totalValue;
      });
      return acc;
    }, {} as Record<string, { quantity: number; revenue: number }>);

    // أداء الصيدليات
    const pharmacyPerformance = ordersData.reduce((acc, order) => {
      const pharmacy = order.pharmacyName;
      if (!acc[pharmacy]) {
        acc[pharmacy] = { orders: 0, revenue: 0 };
      }
      acc[pharmacy].orders += 1;
      acc[pharmacy].revenue += order.totalOrderValue;
      return acc;
    }, {} as Record<string, { orders: number; revenue: number }>);

    return {
      salesRepPerformance,
      areaPerformance,
      productSales,
      pharmacyPerformance
    };
  }, [filteredData]);

  // جلب البيانات من API
  const AdminId = user.user._id
  console.log(AdminId)
  const fetchOrders = async (page: number = 1) => {
    try {
      setLoading(true);
      const result: ApiResponse = await getSalesRepFinalOrders(AdminId, page, 10);
      
      if (result.success) {
        setOrdersData(result.data);
        setCurrentPage(result.pagination.currentPage);
        setTotalPages(result.pagination.totalPages);
        setTotalRecords(result.pagination.totalRecords);
      } else {
        toast({
          title: 'خطأ',
          description: result.message || 'فشل في جلب البيانات',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast({
        title: 'خطأ في الاتصال',
        description: 'تعذر الاتصال بالخادم',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // تصفية البيانات


  // الحصول على القيم الفريدة للفلاتر
  const uniqueAreas = [...new Set(ordersData.map(order => order.pharmacyArea))];
  const uniqueSalesReps = [...new Set(ordersData.map(order => order.salesRepName))];
  const uniqueStatuses = [...new Set(ordersData.map(order => order.FinalOrderStatusValue))];

  const handlePageChange = (page: number) => {
    fetchOrders(page);
  };

  const resetFilters = () => {
    setFilters({
      search: '',
      area: 'all',
      salesRep: 'all',
      status: 'all',
      dateFrom: '',
      dateTo: ''
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* العنوان الرئيسي */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">لوحة تحكم الأدمن</h1>
          <p className="text-muted-foreground mt-2">إدارة ومراقبة جميع الطلبات النهائية</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            تصدير البيانات
          </Button>
        </div>
      </div>

      {/* بطاقات الإحصائيات */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-300">إجمالي الطلبات</CardTitle>
            <ShoppingCart className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">{stats.totalOrders}</div>
            <p className="text-xs text-blue-600 dark:text-blue-400">طلب نهائي</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200 dark:border-green-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-700 dark:text-green-300">إجمالي الإيرادات</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600 dark:text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900 dark:text-green-100">{stats.totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-green-600 dark:text-green-400">دينار ليبي</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-purple-200 dark:border-purple-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-700 dark:text-purple-300">عدد الصيدليات</CardTitle>
            <Building2 className="h-4 w-4 text-purple-600 dark:text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">{stats.uniquePharmacies}</div>
            <p className="text-xs text-purple-600 dark:text-purple-400">صيدلية فريدة</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 border-orange-200 dark:border-orange-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-700 dark:text-orange-300">مندوبي المبيعات</CardTitle>
            <Users className="h-4 w-4 text-orange-600 dark:text-orange-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-900 dark:text-orange-100">{stats.uniqueSalesReps}</div>
            <p className="text-xs text-orange-600 dark:text-orange-400">مندوب نشط</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-teal-50 to-teal-100 dark:from-teal-950 dark:to-teal-900 border-teal-200 dark:border-teal-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-teal-700 dark:text-teal-300">متوسط قيمة الطلب</CardTitle>
            <TrendingUp className="h-4 w-4 text-teal-600 dark:text-teal-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-teal-900 dark:text-teal-100">{stats.avgOrderValue.toFixed(0)}</div>
            <p className="text-xs text-teal-600 dark:text-teal-400">دينار ليبي</p>
          </CardContent>
        </Card>
      </div>

      {/* الفلاتر */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            فلترة البيانات
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">البحث</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="ابحث في الطلبات..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">المنطقة</label>
              <Select value={filters.area} onValueChange={(value) => setFilters(prev => ({ ...prev, area: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر المنطقة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع المناطق</SelectItem>
                  {uniqueAreas.map(area => (
                    <SelectItem key={area} value={area}>{area}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">مندوب المبيعات</label>
              <Select value={filters.salesRep} onValueChange={(value) => setFilters(prev => ({ ...prev, salesRep: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر المندوب" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع المندوبين</SelectItem>
                  {uniqueSalesReps.map(rep => (
                    <SelectItem key={rep} value={rep}>{rep}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">الحالة</label>
              <Select value={filters.status} onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر الحالة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الحالات</SelectItem>
                  {uniqueStatuses.map(status => (
                    <SelectItem key={status} value={status}>{status}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-2 mt-4">
            <Button onClick={resetFilters} variant="outline" size="sm">
              إعادة تعيين الفلاتر
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* التحليلات والرسوم البيانية */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* أداء مندوبي المبيعات */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              أداء مندوبي المبيعات
            </CardTitle>
            <CardDescription>إجمالي الإيرادات لكل مندوب مبيعات</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <Bar
                data={{
                  labels: Object.keys(chartData.salesRepPerformance).slice(0, 10),
                  datasets: [
                    {
                      label: 'الإيرادات',
                      data: Object.values(chartData.salesRepPerformance).slice(0, 10).map(rep => rep.revenue),
                      backgroundColor: 'rgba(59, 130, 246, 0.8)',
                      borderColor: 'rgba(59, 130, 246, 1)',
                      borderWidth: 1,
                      borderRadius: 4,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'top' as const,
                    },
                    tooltip: {
                      callbacks: {
                        label: function(context) {
                          return `الإيرادات: ${context.parsed.y.toLocaleString()} د.ل`;
                        }
                      }
                    }
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: {
                        callback: function(value) {
                          return value.toLocaleString() + ' د.ل';
                        }
                      }
                    },
                    x: {
                      ticks: {
                        maxRotation: 45,
                        minRotation: 45
                      }
                    }
                  },
                }}
              />
            </div>
          </CardContent>
        </Card>

        {/* أداء المناطق */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              أداء المناطق
            </CardTitle>
            <CardDescription>توزيع الطلبات حسب المناطق</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <Doughnut
                data={{
                  labels: Object.keys(chartData.areaPerformance).slice(0, 8),
                  datasets: [
                    {
                      data: Object.values(chartData.areaPerformance).slice(0, 8).map(area => area.orders),
                      backgroundColor: [
                        'rgba(239, 68, 68, 0.8)',
                        'rgba(245, 158, 11, 0.8)',
                        'rgba(34, 197, 94, 0.8)',
                        'rgba(59, 130, 246, 0.8)',
                        'rgba(147, 51, 234, 0.8)',
                        'rgba(236, 72, 153, 0.8)',
                        'rgba(20, 184, 166, 0.8)',
                        'rgba(156, 163, 175, 0.8)',
                      ],
                      borderColor: [
                        'rgba(239, 68, 68, 1)',
                        'rgba(245, 158, 11, 1)',
                        'rgba(34, 197, 94, 1)',
                        'rgba(59, 130, 246, 1)',
                        'rgba(147, 51, 234, 1)',
                        'rgba(236, 72, 153, 1)',
                        'rgba(20, 184, 166, 1)',
                        'rgba(156, 163, 175, 1)',
                      ],
                      borderWidth: 2,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'right' as const,
                    },
                    tooltip: {
                      callbacks: {
                        label: function(context) {
                          const label = context.label || '';
                          const value = context.parsed;
                          const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
                          const percentage = ((value / total) * 100).toFixed(1);
                          return `${label}: ${value} طلب (${percentage}%)`;
                        }
                      }
                    }
                  },
                }}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* مخططات المنتجات والصيدليات */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* أفضل المنتجات مبيعاً */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              أفضل المنتجات مبيعاً
            </CardTitle>
            <CardDescription>المنتجات الأكثر مبيعاً حسب الكمية</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <Bar
                data={{
                  labels: Object.keys(chartData.productSales)
                    .sort((a, b) => chartData.productSales[b].quantity - chartData.productSales[a].quantity)
                    .slice(0, 8),
                  datasets: [
                    {
                      label: 'الكمية المباعة',
                      data: Object.keys(chartData.productSales)
                        .sort((a, b) => chartData.productSales[b].quantity - chartData.productSales[a].quantity)
                        .slice(0, 8)
                        .map(product => chartData.productSales[product].quantity),
                      backgroundColor: 'rgba(34, 197, 94, 0.8)',
                      borderColor: 'rgba(34, 197, 94, 1)',
                      borderWidth: 1,
                      borderRadius: 4,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'top' as const,
                    },
                    tooltip: {
                      callbacks: {
                        label: function(context) {
                          return `الكمية: ${context.parsed.y.toLocaleString()} قطعة`;
                        }
                      }
                    }
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: {
                        callback: function(value) {
                          return value.toLocaleString() + ' قطعة';
                        }
                      }
                    },
                    x: {
                      ticks: {
                        maxRotation: 45,
                        minRotation: 45
                      }
                    }
                  },
                }}
              />
            </div>
          </CardContent>
        </Card>

        {/* أفضل الصيدليات */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              أفضل الصيدليات
            </CardTitle>
            <CardDescription>الصيدليات الأكثر طلباً وإيراداً</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <Pie
                data={{
                  labels: Object.keys(chartData.pharmacyPerformance).slice(0, 8),
                  datasets: [
                    {
                      data: Object.values(chartData.pharmacyPerformance).slice(0, 8).map(pharmacy => pharmacy.orders),
                      backgroundColor: [
                        'rgba(147, 51, 234, 0.8)',
                        'rgba(236, 72, 153, 0.8)',
                        'rgba(59, 130, 246, 0.8)',
                        'rgba(34, 197, 94, 0.8)',
                        'rgba(245, 158, 11, 0.8)',
                        'rgba(239, 68, 68, 0.8)',
                        'rgba(20, 184, 166, 0.8)',
                        'rgba(156, 163, 175, 0.8)',
                      ],
                      borderColor: [
                        'rgba(147, 51, 234, 1)',
                        'rgba(236, 72, 153, 1)',
                        'rgba(59, 130, 246, 1)',
                        'rgba(34, 197, 94, 1)',
                        'rgba(245, 158, 11, 1)',
                        'rgba(239, 68, 68, 1)',
                        'rgba(20, 184, 166, 1)',
                        'rgba(156, 163, 175, 1)',
                      ],
                      borderWidth: 2,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'right' as const,
                      labels: {
                        boxWidth: 12,
                        padding: 8,
                        font: {
                          size: 11
                        }
                      }
                    },
                    tooltip: {
                      callbacks: {
                        label: function(context) {
                          const label = context.label || '';
                          const value = context.parsed;
                          const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
                          const percentage = ((value / total) * 100).toFixed(1);
                          return `${label}: ${value} طلب (${percentage}%)`;
                        }
                      }
                    }
                  },
                }}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* أفضل المناطق أداءً */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            أفضل المناطق أداءً
          </CardTitle>
          <CardDescription>المناطق الأكثر إيراداً وطلبات</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(chartData.areaPerformance)
              .sort(([,a], [,b]) => b.revenue - a.revenue)
              .slice(0, 3)
              .map(([area, data], index) => (
                <div key={area} className={`p-4 rounded-lg border-2 ${
                  index === 0 ? 'bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-300 dark:from-yellow-950 dark:to-yellow-900 dark:border-yellow-700' :
                  index === 1 ? 'bg-gradient-to-br from-gray-50 to-gray-100 border-gray-300 dark:from-gray-950 dark:to-gray-900 dark:border-gray-700' :
                  'bg-gradient-to-br from-orange-50 to-orange-100 border-orange-300 dark:from-orange-950 dark:to-orange-900 dark:border-orange-700'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-sm">{area}</h3>
                    <Badge variant={index === 0 ? 'default' : 'secondary'}>
                      #{index + 1}
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">الإيرادات: {data.revenue.toLocaleString()} د.ل</p>
                    <p className="text-xs text-muted-foreground">الطلبات: {data.orders}</p>
                  </div>
                </div>
              ))
            }
          </div>
        </CardContent>
      </Card>



      {/* جدول البيانات */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>جميع الطلبات النهائية ({filteredData.length})</span>
            <Badge variant="secondary">{totalRecords} إجمالي</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-start p-3 font-medium">رقم الطلب</th>
                  <th className="text-start p-3 font-medium">تاريخ الزيارة</th>
                  <th className="text-start p-3 font-medium">مندوب المبيعات</th>
                  <th className="text-start p-3 font-medium">الصيدلية</th>
                  <th className="text-start p-3 font-medium">المنطقة</th>
                  <th className="text-start p-3 font-medium">قيمة الطلب</th>
               
                </tr>
              </thead>
              <tbody>
                {filteredData.map((order) => (
                  <tr key={order.orderId} className="border-b hover:bg-muted/50">
                    <td className="p-3">
                      <div className="font-mono text-sm">{order.orderId.slice(-8)}</div>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          {new Date(order.visitDate).toLocaleDateString('ar-EG')}
                        </span>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">{order.salesRepName}</span>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="max-w-xs">
                        <div className="font-medium text-sm">{order.pharmacyName}</div>
                        {order.pharmacyAddress && (
                          <div className="text-xs text-muted-foreground mt-1">{order.pharmacyAddress}</div>
                        )}
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{order.pharmacyArea}</span>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex items-end gap-2">
                        <DollarSign className="h-4 w-4 text-green-600" />
                        <span className="font-semibold text-green-700 dark:text-green-400">
                          {order.totalOrderValue.toLocaleString()} د.ل
                        </span>
                      </div>
                    </td>
             
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* التنقل بين الصفحات */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-muted-foreground">
                عرض {((currentPage - 1) * 10) + 1} إلى {Math.min(currentPage * 10, totalRecords)} من {totalRecords} نتيجة
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  السابق
                </Button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const page = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                  return (
                    <Button
                      key={page}
                      variant={page === currentPage ? "default" : "outline"}
                      size="sm"
                      onClick={() => handlePageChange(page)}
                    >
                      {page}
                    </Button>
                  );
                })}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  التالي
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;