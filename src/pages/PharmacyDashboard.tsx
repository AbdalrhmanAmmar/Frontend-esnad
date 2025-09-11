import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Calendar, Filter, TrendingUp, TrendingDown, Package, DollarSign, Pill, BarChart3 } from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler
} from 'chart.js';
import { Line, Bar, Doughnut, Pie } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler
);

// Mock Data
const mockPharmacies = [
  { id: 1, name: 'صيدلية النهضة', location: 'الرياض', type: 'مستقلة' },
  { id: 2, name: 'صيدلية الدواء', location: 'جدة', type: 'سلسلة' },
  { id: 3, name: 'صيدلية العافية', location: 'الدمام', type: 'مستقلة' },
  { id: 4, name: 'صيدلية الشفاء', location: 'مكة', type: 'سلسلة' },
  { id: 5, name: 'صيدلية الحياة', location: 'المدينة', type: 'مستقلة' }
];

const mockBrands = [
  { id: 1, name: 'فايزر', category: 'أدوية' },
  { id: 2, name: 'نوفارتيس', category: 'أدوية' },
  { id: 3, name: 'جونسون آند جونسون', category: 'منتجات صحية' },
  { id: 4, name: 'روش', category: 'أدوية' },
  { id: 5, name: 'سانوفي', category: 'أدوية' }
];

const mockProducts = [
  { id: 1, name: 'باراسيتامول 500mg', brandId: 1, category: 'مسكنات' },
  { id: 2, name: 'أموكسيسيلين 250mg', brandId: 2, category: 'مضادات حيوية' },
  { id: 3, name: 'إيبوبروفين 400mg', brandId: 3, category: 'مسكنات' },
  { id: 4, name: 'أوميبرازول 20mg', brandId: 4, category: 'أدوية المعدة' },
  { id: 5, name: 'لوراتادين 10mg', brandId: 5, category: 'مضادات الحساسية' }
];

const mockSalesData = [
  // يناير 2024
  { pharmacyId: 1, productId: 1, brandId: 1, quantity: 150, revenue: 4500, date: '2024-01-15', month: 'يناير' },
  { pharmacyId: 2, productId: 2, brandId: 2, quantity: 200, revenue: 8000, date: '2024-01-16', month: 'يناير' },
  { pharmacyId: 3, productId: 3, brandId: 3, quantity: 120, revenue: 3600, date: '2024-01-17', month: 'يناير' },
  { pharmacyId: 4, productId: 4, brandId: 4, quantity: 180, revenue: 5400, date: '2024-01-18', month: 'يناير' },
  { pharmacyId: 5, productId: 5, brandId: 5, quantity: 90, revenue: 2700, date: '2024-01-19', month: 'يناير' },
  { pharmacyId: 1, productId: 2, brandId: 2, quantity: 300, revenue: 12000, date: '2024-01-20', month: 'يناير' },
  { pharmacyId: 2, productId: 1, brandId: 1, quantity: 250, revenue: 7500, date: '2024-01-21', month: 'يناير' },
  { pharmacyId: 3, productId: 4, brandId: 4, quantity: 160, revenue: 4800, date: '2024-01-22', month: 'يناير' },
  
  // فبراير 2024
  { pharmacyId: 1, productId: 3, brandId: 3, quantity: 220, revenue: 6600, date: '2024-02-05', month: 'فبراير' },
  { pharmacyId: 2, productId: 4, brandId: 4, quantity: 180, revenue: 7200, date: '2024-02-08', month: 'فبراير' },
  { pharmacyId: 3, productId: 1, brandId: 1, quantity: 190, revenue: 5700, date: '2024-02-12', month: 'فبراير' },
  { pharmacyId: 4, productId: 2, brandId: 2, quantity: 240, revenue: 9600, date: '2024-02-15', month: 'فبراير' },
  { pharmacyId: 5, productId: 3, brandId: 3, quantity: 130, revenue: 3900, date: '2024-02-18', month: 'فبراير' },
  
  // مارس 2024
  { pharmacyId: 1, productId: 5, brandId: 5, quantity: 280, revenue: 8400, date: '2024-03-02', month: 'مارس' },
  { pharmacyId: 2, productId: 3, brandId: 3, quantity: 320, revenue: 9600, date: '2024-03-05', month: 'مارس' },
  { pharmacyId: 3, productId: 2, brandId: 2, quantity: 210, revenue: 8400, date: '2024-03-08', month: 'مارس' },
  { pharmacyId: 4, productId: 1, brandId: 1, quantity: 350, revenue: 10500, date: '2024-03-12', month: 'مارس' },
  { pharmacyId: 5, productId: 4, brandId: 4, quantity: 170, revenue: 5100, date: '2024-03-15', month: 'مارس' },
  
  // أبريل 2024
  { pharmacyId: 1, productId: 4, brandId: 4, quantity: 400, revenue: 12000, date: '2024-04-03', month: 'أبريل' },
  { pharmacyId: 2, productId: 5, brandId: 5, quantity: 290, revenue: 8700, date: '2024-04-07', month: 'أبريل' },
  { pharmacyId: 3, productId: 3, brandId: 3, quantity: 260, revenue: 7800, date: '2024-04-10', month: 'أبريل' },
  { pharmacyId: 4, productId: 5, brandId: 5, quantity: 310, revenue: 9300, date: '2024-04-14', month: 'أبريل' },
  { pharmacyId: 5, productId: 1, brandId: 1, quantity: 200, revenue: 6000, date: '2024-04-18', month: 'أبريل' }
];

interface Filters {
  fromDate: string;
  toDate: string;
  pharmacyId: string;
  brandId: string;
  productId: string;
}

const PharmacyDashboard = () => {
  const [filters, setFilters] = useState<Filters>({
    fromDate: '',
    toDate: '',
    pharmacyId: 'all',
    brandId: 'all',
    productId: 'all'
  });

  const [filteredData, setFilteredData] = useState(mockSalesData);
  const [statistics, setStatistics] = useState({
    totalRevenue: 0,
    totalQuantity: 0,
    totalPharmacies: 0,
    averageOrderValue: 0
  });

  // Filter data based on selected filters
  useEffect(() => {
    let filtered = mockSalesData;

    if (filters.fromDate) {
      filtered = filtered.filter(item => item.date >= filters.fromDate);
    }
    if (filters.toDate) {
      filtered = filtered.filter(item => item.date <= filters.toDate);
    }
    if (filters.pharmacyId && filters.pharmacyId !== 'all') {
      filtered = filtered.filter(item => item.pharmacyId.toString() === filters.pharmacyId);
    }
    if (filters.brandId && filters.brandId !== 'all') {
      filtered = filtered.filter(item => item.brandId.toString() === filters.brandId);
    }
    if (filters.productId && filters.productId !== 'all') {
      filtered = filtered.filter(item => item.productId.toString() === filters.productId);
    }

    setFilteredData(filtered);

    // Calculate statistics
    const totalRevenue = filtered.reduce((sum, item) => sum + item.revenue, 0);
    const totalQuantity = filtered.reduce((sum, item) => sum + item.quantity, 0);
    const uniquePharmacies = new Set(filtered.map(item => item.pharmacyId)).size;
    const averageOrderValue = filtered.length > 0 ? totalRevenue / filtered.length : 0;

    setStatistics({
      totalRevenue,
      totalQuantity,
      totalPharmacies: uniquePharmacies,
      averageOrderValue
    });
  }, [filters]);

  const handleFilterChange = (key: keyof Filters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      fromDate: '',
      toDate: '',
      pharmacyId: 'all',
      brandId: 'all',
      productId: 'all'
    });
  };

  // Chart data preparation
  const chartData = {
    pharmacyRevenue: mockPharmacies.map(pharmacy => {
      const revenue = filteredData
        .filter(item => item.pharmacyId === pharmacy.id)
        .reduce((sum, item) => sum + item.revenue, 0);
      return { name: pharmacy.name, value: revenue };
    }),
    brandPerformance: mockBrands.map(brand => {
      const revenue = filteredData
        .filter(item => item.brandId === brand.id)
        .reduce((sum, item) => sum + item.revenue, 0);
      return { name: brand.name, value: revenue };
    }),
    productSales: mockProducts.map(product => {
      const quantity = filteredData
        .filter(item => item.productId === product.id)
        .reduce((sum, item) => sum + item.quantity, 0);
      return { name: product.name, value: quantity };
    })
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-LY', {
      style: 'currency',
      currency: 'LYD'
    }).format(amount);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">لوحة تحكم الصيدليات</h1>
          <p className="text-muted-foreground mt-1">تحليل شامل لأداء الصيدليات والمبيعات</p>
        </div>
        <div className="flex items-center gap-2">
          <BarChart3 className="w-8 h-8 text-primary" />
          <Badge variant="secondary" className="text-sm">
            {filteredData.length} عملية بيع
          </Badge>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            الفلاتر
          </CardTitle>
          <CardDescription>
            استخدم الفلاتر لتخصيص البيانات المعروضة
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fromDate">من تاريخ</Label>
              <Input
                id="fromDate"
                type="date"
                value={filters.fromDate}
                onChange={(e) => handleFilterChange('fromDate', e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="toDate">إلى تاريخ</Label>
              <Input
                id="toDate"
                type="date"
                value={filters.toDate}
                onChange={(e) => handleFilterChange('toDate', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>الصيدلية</Label>
              <Select value={filters.pharmacyId} onValueChange={(value) => handleFilterChange('pharmacyId', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر الصيدلية" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الصيدليات</SelectItem>
                  {mockPharmacies.map(pharmacy => (
                    <SelectItem key={pharmacy.id} value={pharmacy.id.toString()}>
                      {pharmacy.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>العلامة التجارية</Label>
              <Select value={filters.brandId} onValueChange={(value) => handleFilterChange('brandId', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر العلامة التجارية" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع العلامات التجارية</SelectItem>
                  {mockBrands.map(brand => (
                    <SelectItem key={brand.id} value={brand.id.toString()}>
                      {brand.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>المنتج</Label>
              <Select value={filters.productId} onValueChange={(value) => handleFilterChange('productId', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر المنتج" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع المنتجات</SelectItem>
                  {mockProducts.map(product => (
                    <SelectItem key={product.id} value={product.id.toString()}>
                      {product.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="flex gap-2 mt-4">
            <Button onClick={clearFilters} variant="outline" size="sm">
              مسح الفلاتر
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الإيرادات</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(statistics.totalRevenue)}
            </div>
            <p className="text-xs text-muted-foreground">
              من {filteredData.length} عملية بيع
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الكمية</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {statistics.totalQuantity.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              وحدة مباعة
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">عدد الصيدليات</CardTitle>
            <Pill className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {statistics.totalPharmacies}
            </div>
            <p className="text-xs text-muted-foreground">
              صيدلية نشطة
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">متوسط قيمة الطلب</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {formatCurrency(statistics.averageOrderValue)}
            </div>
            <p className="text-xs text-muted-foreground">
              لكل عملية بيع
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pharmacy Revenue Chart */}
        <Card>
          <CardHeader>
            <CardTitle>إيرادات الصيدليات</CardTitle>
            <CardDescription>توزيع الإيرادات حسب الصيدلية</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {chartData.pharmacyRevenue.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full bg-gradient-to-r from-blue-500 to-purple-600`} />
                    <span className="text-sm font-medium">{item.name}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold">{formatCurrency(item.value)}</div>
                    <div className="w-32 bg-gray-200 rounded-full h-2 mt-1">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(item.value / Math.max(...chartData.pharmacyRevenue.map(d => d.value))) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Brand Performance Chart */}
        <Card>
          <CardHeader>
            <CardTitle>أداء العلامات التجارية</CardTitle>
            <CardDescription>إيرادات العلامات التجارية</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {chartData.brandPerformance.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full bg-gradient-to-r from-green-500 to-teal-600`} />
                    <span className="text-sm font-medium">{item.name}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold">{formatCurrency(item.value)}</div>
                    <div className="w-32 bg-gray-200 rounded-full h-2 mt-1">
                      <div 
                        className="bg-gradient-to-r from-green-500 to-teal-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(item.value / Math.max(...chartData.brandPerformance.map(d => d.value))) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Product Sales Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>مبيعات المنتجات</CardTitle>
            <CardDescription>الكميات المباعة حسب المنتج</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {chartData.productSales.map((item, index) => (
                <div key={index} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-2">
                    <Package className="w-5 h-5 text-orange-500" />
                    <Badge variant="outline">{item.value} وحدة</Badge>
                  </div>
                  <h4 className="font-medium text-sm mb-2">{item.name}</h4>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-orange-500 to-red-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(item.value / Math.max(...chartData.productSales.map(d => d.value))) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Advanced Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Monthly Revenue Trend - Line Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-500" />
              اتجاه الإيرادات الشهرية
            </CardTitle>
            <CardDescription>تطور الإيرادات عبر الأشهر</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <Line
                data={{
                  labels: ['يناير', 'فبراير', 'مارس', 'أبريل'],
                  datasets: [
                    {
                      label: 'الإيرادات (د.ل)',
                      data: [
                        filteredData.filter(item => item.month === 'يناير').reduce((sum, item) => sum + item.revenue, 0),
                        filteredData.filter(item => item.month === 'فبراير').reduce((sum, item) => sum + item.revenue, 0),
                        filteredData.filter(item => item.month === 'مارس').reduce((sum, item) => sum + item.revenue, 0),
                        filteredData.filter(item => item.month === 'أبريل').reduce((sum, item) => sum + item.revenue, 0)
                      ],
                      borderColor: 'rgb(59, 130, 246)',
                      backgroundColor: 'rgba(59, 130, 246, 0.1)',
                      borderWidth: 3,
                      fill: true,
                      tension: 0.4,
                      pointBackgroundColor: 'rgb(59, 130, 246)',
                      pointBorderColor: '#fff',
                      pointBorderWidth: 2,
                      pointRadius: 6,
                      pointHoverRadius: 8
                    }
                  ]
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'top' as const,
                      labels: {
                        font: {
                          family: 'Cairo, sans-serif',
                          size: 12
                        }
                      }
                    },
                    tooltip: {
                      backgroundColor: 'rgba(0, 0, 0, 0.8)',
                      titleColor: '#fff',
                      bodyColor: '#fff',
                      borderColor: 'rgb(59, 130, 246)',
                      borderWidth: 1,
                      cornerRadius: 8,
                      displayColors: false
                    }
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      grid: {
                        color: 'rgba(0, 0, 0, 0.1)'
                      },
                      ticks: {
                        font: {
                          family: 'Cairo, sans-serif'
                        },
                        callback: function(value) {
                          return value.toLocaleString('ar-LY') + ' د.ل';
                        }
                      }
                    },
                    x: {
                      grid: {
                        display: false
                      },
                      ticks: {
                        font: {
                          family: 'Cairo, sans-serif'
                        }
                      }
                    }
                  }
                }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Pharmacy Performance - Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-green-500" />
              أداء الصيدليات
            </CardTitle>
            <CardDescription>مقارنة إيرادات الصيدليات</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <Bar
                data={{
                  labels: mockPharmacies.map(pharmacy => pharmacy.name),
                  datasets: [
                    {
                      label: 'إجمالي الإيرادات',
                      data: mockPharmacies.map(pharmacy => 
                        filteredData
                          .filter(item => item.pharmacyId === pharmacy.id)
                          .reduce((sum, item) => sum + item.revenue, 0)
                      ),
                      backgroundColor: [
                        'rgba(34, 197, 94, 0.8)',
                        'rgba(59, 130, 246, 0.8)',
                        'rgba(168, 85, 247, 0.8)',
                        'rgba(245, 158, 11, 0.8)',
                        'rgba(239, 68, 68, 0.8)'
                      ],
                      borderColor: [
                        'rgb(34, 197, 94)',
                        'rgb(59, 130, 246)',
                        'rgb(168, 85, 247)',
                        'rgb(245, 158, 11)',
                        'rgb(239, 68, 68)'
                      ],
                      borderWidth: 2,
                      borderRadius: 8,
                      borderSkipped: false
                    }
                  ]
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      display: false
                    },
                    tooltip: {
                      backgroundColor: 'rgba(0, 0, 0, 0.8)',
                      titleColor: '#fff',
                      bodyColor: '#fff',
                      cornerRadius: 8,
                      displayColors: false
                    }
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      grid: {
                        color: 'rgba(0, 0, 0, 0.1)'
                      },
                      ticks: {
                        font: {
                          family: 'Cairo, sans-serif'
                        },
                        callback: function(value) {
                          return value.toLocaleString('ar-LY') + ' د.ل';
                        }
                      }
                    },
                    x: {
                      grid: {
                        display: false
                      },
                      ticks: {
                        font: {
                          family: 'Cairo, sans-serif',
                          size: 10
                        },
                        maxRotation: 45
                      }
                    }
                  }
                }}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Product Distribution Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Product Sales Distribution - Doughnut Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Pill className="w-5 h-5 text-purple-500" />
              توزيع مبيعات المنتجات
            </CardTitle>
            <CardDescription>نسبة مبيعات كل منتج</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80 flex items-center justify-center">
              <Doughnut
                data={{
                  labels: mockProducts.map(product => product.name),
                  datasets: [
                    {
                      data: mockProducts.map(product => 
                        filteredData
                          .filter(item => item.productId === product.id)
                          .reduce((sum, item) => sum + item.quantity, 0)
                      ),
                      backgroundColor: [
                        'rgba(239, 68, 68, 0.8)',
                        'rgba(245, 158, 11, 0.8)',
                        'rgba(34, 197, 94, 0.8)',
                        'rgba(59, 130, 246, 0.8)',
                        'rgba(168, 85, 247, 0.8)'
                      ],
                      borderColor: [
                        'rgb(239, 68, 68)',
                        'rgb(245, 158, 11)',
                        'rgb(34, 197, 94)',
                        'rgb(59, 130, 246)',
                        'rgb(168, 85, 247)'
                      ],
                      borderWidth: 3,
                      hoverOffset: 10
                    }
                  ]
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'bottom' as const,
                      labels: {
                        font: {
                          family: 'Cairo, sans-serif',
                          size: 11
                        },
                        padding: 20,
                        usePointStyle: true,
                        pointStyle: 'circle'
                      }
                    },
                    tooltip: {
                      backgroundColor: 'rgba(0, 0, 0, 0.8)',
                      titleColor: '#fff',
                      bodyColor: '#fff',
                      cornerRadius: 8,
                      displayColors: false,
                      callbacks: {
                        label: function(context) {
                          const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
                          const percentage = ((context.parsed / total) * 100).toFixed(1);
                          return `${context.label}: ${context.parsed} وحدة (${percentage}%)`;
                        }
                      }
                    }
                  },
                  cutout: '60%'
                }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Brand Revenue Distribution - Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-emerald-500" />
              توزيع إيرادات العلامات التجارية
            </CardTitle>
            <CardDescription>نسبة إيرادات كل علامة تجارية</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80 flex items-center justify-center">
              <Pie
                data={{
                  labels: mockBrands.map(brand => brand.name),
                  datasets: [
                    {
                      data: mockBrands.map(brand => 
                        filteredData
                          .filter(item => item.brandId === brand.id)
                          .reduce((sum, item) => sum + item.revenue, 0)
                      ),
                      backgroundColor: [
                        'rgba(16, 185, 129, 0.8)',
                        'rgba(59, 130, 246, 0.8)',
                        'rgba(245, 158, 11, 0.8)',
                        'rgba(168, 85, 247, 0.8)',
                        'rgba(239, 68, 68, 0.8)'
                      ],
                      borderColor: [
                        'rgb(16, 185, 129)',
                        'rgb(59, 130, 246)',
                        'rgb(245, 158, 11)',
                        'rgb(168, 85, 247)',
                        'rgb(239, 68, 68)'
                      ],
                      borderWidth: 3,
                      hoverOffset: 15
                    }
                  ]
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'bottom' as const,
                      labels: {
                        font: {
                          family: 'Cairo, sans-serif',
                          size: 11
                        },
                        padding: 20,
                        usePointStyle: true,
                        pointStyle: 'circle'
                      }
                    },
                    tooltip: {
                      backgroundColor: 'rgba(0, 0, 0, 0.8)',
                      titleColor: '#fff',
                      bodyColor: '#fff',
                      cornerRadius: 8,
                      displayColors: false,
                      callbacks: {
                        label: function(context) {
                          const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
                          const percentage = ((context.parsed / total) * 100).toFixed(1);
                          return `${context.label}: ${context.parsed.toLocaleString('ar-LY')} د.ل (${percentage}%)`;
                        }
                      }
                    }
                  }
                }}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Data Table */}
      <Card>
        <CardHeader>
          <CardTitle>تفاصيل المبيعات</CardTitle>
          <CardDescription>جدول تفصيلي بجميع عمليات البيع</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-right p-2 font-medium">التاريخ</th>
                  <th className="text-right p-2 font-medium">الصيدلية</th>
                  <th className="text-right p-2 font-medium">المنتج</th>
                  <th className="text-right p-2 font-medium">العلامة التجارية</th>
                  <th className="text-right p-2 font-medium">الكمية</th>
                  <th className="text-right p-2 font-medium">الإيراد</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((item, index) => {
                  const pharmacy = mockPharmacies.find(p => p.id === item.pharmacyId);
                  const product = mockProducts.find(p => p.id === item.productId);
                  const brand = mockBrands.find(b => b.id === item.brandId);
                  
                  return (
                    <tr key={index} className="border-b hover:bg-muted/50">
                      <td className="p-2">{format(new Date(item.date), 'dd/MM/yyyy', { locale: ar })}</td>
                      <td className="p-2">{pharmacy?.name}</td>
                      <td className="p-2">{product?.name}</td>
                      <td className="p-2">{brand?.name}</td>
                      <td className="p-2">{item.quantity}</td>
                      <td className="p-2 font-medium text-green-600">{formatCurrency(item.revenue)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PharmacyDashboard;