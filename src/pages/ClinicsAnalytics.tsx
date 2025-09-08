import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  BarElement,
  Filler,
} from 'chart.js';
import { Line, Doughnut, Bar } from 'react-chartjs-2';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TrendingUp, Users, Activity, DollarSign, Download, Calendar, Building2, Stethoscope, Filter, RefreshCw, Tag, Package, User } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import toast from 'react-hot-toast';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  BarElement,
  Filler
);

// Mock data interfaces
interface ClinicVisit {
  _id: string;
  visitDate: string;
  doctorName: string;
  specialty: string;
  classification: string;
  brand: string;
  clinicName: string;
  product1: string;
  product2: string;
  product3: string;
  notes?: string;
}

// Mock clinic visits data
const mockClinicVisits: ClinicVisit[] = [
  {
    _id: '1',
    visitDate: '2024-01-15',
    doctorName: 'د. أحمد محمد',
    specialty: 'قلب',
    classification: 'A',
    brand: 'Brand A',
    clinicName: 'عيادة القلب المتخصصة',
    product1: 'منتج القلب 1',
    product2: 'منتج القلب 2',
    product3: 'منتج القلب 3',
    notes: 'زيارة ناجحة'
  },
  {
    _id: '2',
    visitDate: '2024-01-16',
    doctorName: 'د. فاطمة علي',
    specialty: 'أطفال',
    classification: 'B',
    brand: 'Brand B',
    clinicName: 'عيادة الأطفال الحديثة',
    product1: 'منتج الأطفال 1',
    product2: 'منتج الأطفال 2',
    product3: 'منتج الأطفال 3',
    notes: 'متابعة دورية'
  },
  {
    _id: '3',
    visitDate: '2024-01-17',
    doctorName: 'د. محمد حسن',
    specialty: 'جراحة',
    classification: 'A',
    brand: 'Brand C',
    clinicName: 'مركز الجراحة المتقدمة',
    product1: 'منتج الجراحة 1',
    product2: 'منتج الجراحة 2',
    product3: 'منتج الجراحة 3',
    notes: 'عرض منتجات جديدة'
  },
  {
    _id: '4',
    visitDate: '2024-01-18',
    doctorName: 'د. سارة أحمد',
    specialty: 'نساء وولادة',
    classification: 'B',
    brand: 'Brand A',
    clinicName: 'عيادة النساء والولادة',
    product1: 'منتج النساء 1',
    product2: 'منتج النساء 2',
    product3: 'منتج النساء 3',
    notes: 'تدريب على المنتجات'
  },
  {
    _id: '5',
    visitDate: '2024-01-19',
    doctorName: 'د. خالد محمود',
    specialty: 'عظام',
    classification: 'A',
    brand: 'Brand B',
    clinicName: 'مركز العظام الطبي',
    product1: 'منتج العظام 1',
    product2: 'منتج العظام 2',
    product3: 'منتج العظام 3',
    notes: 'اجتماع تقييم'
  },
  {
    _id: '6',
    visitDate: '2024-01-20',
    doctorName: 'د. ليلى حسن',
    specialty: 'جلدية',
    classification: 'A',
    brand: 'Brand A',
    clinicName: 'عيادة الجلدية المتطورة',
    product1: 'منتج الجلدية 1',
    product2: 'منتج الجلدية 2',
    product3: 'منتج الجلدية 3',
    notes: 'عرض تقديمي'
  },
  {
    _id: '7',
    visitDate: '2024-01-21',
    doctorName: 'د. عمر الشريف',
    specialty: 'عيون',
    classification: 'B',
    brand: 'Brand C',
    clinicName: 'مركز العيون الحديث',
    product1: 'منتج العيون 1',
    product2: 'منتج العيون 2',
    product3: 'منتج العيون 3',
    notes: 'متابعة شهرية'
  }
];

// Mock data for analytics
const mockAnalyticsData = {
  kpis: {
    totalVisits: 2847,
    totalRevenue: 125600,
    activeClinic: 45,
    avgVisitsPerDay: 23.7,
    growthRate: 12.5,
    satisfactionRate: 94.2
  },
  monthlyTrends: {
    labels: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'],
    visits: [180, 220, 195, 267, 289, 312, 298, 345, 378, 392, 415, 428],
    revenue: [8500, 11200, 9800, 13400, 14500, 15600, 14900, 17250, 18900, 19600, 20750, 21400]
  },
  specialtyDistribution: {
    labels: ['طب الأطفال', 'طب الباطنة', 'طب الأسنان', 'طب العيون', 'طب الجلدية', 'طب النساء', 'طب العظام'],
    data: [25, 20, 18, 12, 10, 8, 7]
  },
  clinicComparison: {
    labels: ['عيادة النور', 'عيادة الشفاء', 'عيادة الأمل', 'عيادة السلام', 'عيادة الحياة'],
    visits: [450, 380, 320, 290, 250],
    revenue: [22500, 19000, 16000, 14500, 12500]
  },
  productPerformance: {
    labels: ['المنتج الأول', 'المنتج الثاني', 'المنتج الثالث', 'المنتج الرابع', 'المنتج الخامس'],
    sales: [85, 72, 68, 45, 38],
    satisfaction: [92, 88, 85, 78, 75]
  },
  timeAnalysis: {
    labels: ['8:00', '9:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'],
    visits: [12, 25, 35, 42, 38, 28, 45, 52, 38, 22]
  }
};

const ClinicsAnalytics: React.FC = () => {
  // Data states
  const [visits, setVisits] = useState<ClinicVisit[]>(mockClinicVisits);
  const [filteredVisits, setFilteredVisits] = useState<ClinicVisit[]>(mockClinicVisits);
  const [loading, setLoading] = useState(false);
  
  // Filter states
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState('all');
  const [selectedSpecialty, setSelectedSpecialty] = useState('all');
  const [selectedClassification, setSelectedClassification] = useState('all');
  const [selectedBrand, setSelectedBrand] = useState('all');
  const [selectedClinic, setSelectedClinic] = useState('all');
  const [selectedProduct1, setSelectedProduct1] = useState('all');
  const [selectedProduct2, setSelectedProduct2] = useState('all');
  const [selectedProduct3, setSelectedProduct3] = useState('all');
  const [selectedPeriod, setSelectedPeriod] = useState('monthly');

  // Get unique values for filters
  const uniqueDoctors = [...new Set(visits.map(visit => visit.doctorName))];
  const uniqueSpecialties = [...new Set(visits.map(visit => visit.specialty))];
  const uniqueClassifications = [...new Set(visits.map(visit => visit.classification))];
  const uniqueBrands = [...new Set(visits.map(visit => visit.brand))];
  const uniqueClinics = [...new Set(visits.map(visit => visit.clinicName))];
  const uniqueProducts1 = [...new Set(visits.map(visit => visit.product1))];
  const uniqueProducts2 = [...new Set(visits.map(visit => visit.product2))];
  const uniqueProducts3 = [...new Set(visits.map(visit => visit.product3))];

  // Apply filters
  useEffect(() => {
    let filtered = visits;

    // Date filter
    if (fromDate) {
      filtered = filtered.filter(visit => new Date(visit.visitDate) >= new Date(fromDate));
    }
    if (toDate) {
      filtered = filtered.filter(visit => new Date(visit.visitDate) <= new Date(toDate));
    }

    // Other filters
    if (selectedDoctor !== 'all') {
      filtered = filtered.filter(visit => visit.doctorName === selectedDoctor);
    }
    if (selectedSpecialty !== 'all') {
      filtered = filtered.filter(visit => visit.specialty === selectedSpecialty);
    }
    if (selectedClassification !== 'all') {
      filtered = filtered.filter(visit => visit.classification === selectedClassification);
    }
    if (selectedBrand !== 'all') {
      filtered = filtered.filter(visit => visit.brand === selectedBrand);
    }
    if (selectedClinic !== 'all') {
      filtered = filtered.filter(visit => visit.clinicName === selectedClinic);
    }
    if (selectedProduct1 !== 'all') {
      filtered = filtered.filter(visit => visit.product1 === selectedProduct1);
    }
    if (selectedProduct2 !== 'all') {
      filtered = filtered.filter(visit => visit.product2 === selectedProduct2);
    }
    if (selectedProduct3 !== 'all') {
      filtered = filtered.filter(visit => visit.product3 === selectedProduct3);
    }

    setFilteredVisits(filtered);
  }, [visits, fromDate, toDate, selectedDoctor, selectedSpecialty, selectedClassification, selectedBrand, selectedClinic, selectedProduct1, selectedProduct2, selectedProduct3]);

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => {
      setVisits(mockClinicVisits);
      setLoading(false);
      toast.success('تم تحديث البيانات بنجاح');
    }, 1000);
  };

  const clearFilters = () => {
    setFromDate('');
    setToDate('');
    setSelectedDoctor('all');
    setSelectedSpecialty('all');
    setSelectedClassification('all');
    setSelectedBrand('all');
    setSelectedClinic('all');
    setSelectedProduct1('all');
    setSelectedProduct2('all');
    setSelectedProduct3('all');
    toast.success('تم مسح جميع الفلاتر');
  };

  // Update analytics data based on filtered visits
  const updatedAnalyticsData = {
    ...mockAnalyticsData,
    kpis: {
      ...mockAnalyticsData.kpis,
      totalVisits: filteredVisits.length,
      activeClinic: uniqueClinics.length
    }
  };

  // Chart options with RTL support and professional styling
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        rtl: true,
        labels: {
          font: {
            family: 'Cairo, sans-serif',
            size: 12
          },
          usePointStyle: true,
          padding: 20
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: '#3b82f6',
        borderWidth: 1,
        cornerRadius: 8,
        titleFont: {
          family: 'Cairo, sans-serif',
          size: 14,
          weight: 'bold'
        },
        bodyFont: {
          family: 'Cairo, sans-serif',
          size: 12
        }
      }
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        },
        ticks: {
          font: {
            family: 'Cairo, sans-serif',
            size: 11
          }
        }
      },
      y: {
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        },
        ticks: {
          font: {
            family: 'Cairo, sans-serif',
            size: 11
          }
        }
      }
    }
  };

  // Monthly trends chart data
  const monthlyTrendsData = {
    labels: mockAnalyticsData.monthlyTrends.labels,
    datasets: [
      {
        label: 'عدد الزيارات',
        data: mockAnalyticsData.monthlyTrends.visits,
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#3b82f6',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 6
      },
      {
        label: 'الإيرادات (بالآلاف)',
        data: mockAnalyticsData.monthlyTrends.revenue.map(r => r / 1000),
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#10b981',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 6
      }
    ]
  };

  // Specialty distribution chart data
  const specialtyData = {
    labels: mockAnalyticsData.specialtyDistribution.labels,
    datasets: [
      {
        data: mockAnalyticsData.specialtyDistribution.data,
        backgroundColor: [
          '#3b82f6',
          '#10b981',
          '#f59e0b',
          '#ef4444',
          '#8b5cf6',
          '#06b6d4',
          '#84cc16'
        ],
        borderColor: '#ffffff',
        borderWidth: 3,
        hoverBorderWidth: 4
      }
    ]
  };

  // Clinic comparison chart data
  const clinicComparisonData = {
    labels: mockAnalyticsData.clinicComparison.labels,
    datasets: [
      {
        label: 'عدد الزيارات',
        data: mockAnalyticsData.clinicComparison.visits,
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: '#3b82f6',
        borderWidth: 2,
        borderRadius: 8,
        borderSkipped: false
      },
      {
        label: 'الإيرادات (بالآلاف)',
        data: mockAnalyticsData.clinicComparison.revenue.map(r => r / 1000),
        backgroundColor: 'rgba(16, 185, 129, 0.8)',
        borderColor: '#10b981',
        borderWidth: 2,
        borderRadius: 8,
        borderSkipped: false
      }
    ]
  };



  return (
    <div className="p-6 space-y-6 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">تحليلات العيادات المتقدمة</h1>
          <p className="text-gray-600">لوحة تحكم شاملة لمراقبة أداء العيادات والإحصائيات التفصيلية</p>
        </div>
        
        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3">
          <Button onClick={handleRefresh} disabled={loading} variant="outline" size="sm">
            <RefreshCw className={`h-4 w-4 ml-2 ${loading ? 'animate-spin' : ''}`} />
            تحديث البيانات
          </Button>
          <Button onClick={clearFilters} variant="outline" size="sm">
            <Filter className="h-4 w-4 ml-2" />
            مسح الفلاتر
          </Button>
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="اختر الفترة" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">يومي</SelectItem>
              <SelectItem value="weekly">أسبوعي</SelectItem>
              <SelectItem value="monthly">شهري</SelectItem>
              <SelectItem value="yearly">سنوي</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            تصدير التقرير
          </Button>
        </div>
      </div>

      {/* Filters Section */}
      <Card className="p-6 shadow-lg border-0">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="h-5 w-5 text-blue-500" />
          <h3 className="text-lg font-semibold text-gray-900">فلاتر البحث المتقدمة</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {/* Date Range */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2 text-gray-700">
              <Calendar className="h-4 w-4" />
              من تاريخ
            </label>
            <Input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="w-full"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2 text-gray-700">
              <Calendar className="h-4 w-4" />
              إلى تاريخ
            </label>
            <Input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="w-full"
            />
          </div>

          {/* Doctor Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2 text-gray-700">
              <User className="h-4 w-4" />
              الطبيب
            </label>
            <Select value={selectedDoctor} onValueChange={setSelectedDoctor}>
              <SelectTrigger>
                <SelectValue placeholder="اختر الطبيب" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الأطباء</SelectItem>
                {uniqueDoctors.map(doctor => (
                  <SelectItem key={doctor} value={doctor}>{doctor}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Specialty Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2 text-gray-700">
              <Stethoscope className="h-4 w-4" />
              التخصص
            </label>
            <Select value={selectedSpecialty} onValueChange={setSelectedSpecialty}>
              <SelectTrigger>
                <SelectValue placeholder="اختر التخصص" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع التخصصات</SelectItem>
                {uniqueSpecialties.map(specialty => (
                  <SelectItem key={specialty} value={specialty}>{specialty}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Classification Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2 text-gray-700">
              <Tag className="h-4 w-4" />
              التصنيف
            </label>
            <Select value={selectedClassification} onValueChange={setSelectedClassification}>
              <SelectTrigger>
                <SelectValue placeholder="اختر التصنيف" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع التصنيفات</SelectItem>
                {uniqueClassifications.map(classification => (
                  <SelectItem key={classification} value={classification}>{classification}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Brand Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2 text-gray-700">
              <Tag className="h-4 w-4" />
              العلامة التجارية
            </label>
            <Select value={selectedBrand} onValueChange={setSelectedBrand}>
              <SelectTrigger>
                <SelectValue placeholder="اختر العلامة التجارية" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع العلامات التجارية</SelectItem>
                {uniqueBrands.map(brand => (
                  <SelectItem key={brand} value={brand}>{brand}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Clinic Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2 text-gray-700">
              <Building2 className="h-4 w-4" />
              العيادة
            </label>
            <Select value={selectedClinic} onValueChange={setSelectedClinic}>
              <SelectTrigger>
                <SelectValue placeholder="اختر العيادة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع العيادات</SelectItem>
                {uniqueClinics.map(clinic => (
                  <SelectItem key={clinic} value={clinic}>{clinic}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Product 1 Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2 text-gray-700">
              <Package className="h-4 w-4" />
              المنتج الأول
            </label>
            <Select value={selectedProduct1} onValueChange={setSelectedProduct1}>
              <SelectTrigger>
                <SelectValue placeholder="اختر المنتج الأول" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع المنتجات</SelectItem>
                {uniqueProducts1.map(product => (
                  <SelectItem key={product} value={product}>{product}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Product 2 Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2 text-gray-700">
              <Package className="h-4 w-4" />
              المنتج الثاني
            </label>
            <Select value={selectedProduct2} onValueChange={setSelectedProduct2}>
              <SelectTrigger>
                <SelectValue placeholder="اختر المنتج الثاني" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع المنتجات</SelectItem>
                {uniqueProducts2.map(product => (
                  <SelectItem key={product} value={product}>{product}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Product 3 Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2 text-gray-700">
              <Package className="h-4 w-4" />
              المنتج الثالث
            </label>
            <Select value={selectedProduct3} onValueChange={setSelectedProduct3}>
              <SelectTrigger>
                <SelectValue placeholder="اختر المنتج الثالث" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع المنتجات</SelectItem>
                {uniqueProducts3.map(product => (
                  <SelectItem key={product} value={product}>{product}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {/* Filter Summary */}
        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-gray-600">
            عرض <span className="font-semibold text-blue-600">{filteredVisits.length}</span> من أصل <span className="font-semibold text-blue-600">{visits.length}</span> زيارة
          </p>
        </div>
      </Card>

      {/* New Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Doctors Performance Chart */}
        <Card className="p-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-blue-500" />
              أداء الأطباء
            </CardTitle>
            <CardDescription>
              عدد الزيارات لكل طبيب - {uniqueDoctors.length} طبيب نشط
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <Bar 
                data={{
                  labels: uniqueDoctors,
                  datasets: [
                    {
                      label: 'عدد الزيارات',
                      data: uniqueDoctors.map(doctor => 
                        filteredVisits.filter(v => v.doctorName === doctor).length
                      ),
                      backgroundColor: [
                        'rgba(59, 130, 246, 0.8)',
                        'rgba(16, 185, 129, 0.8)',
                        'rgba(245, 101, 101, 0.8)',
                        'rgba(251, 191, 36, 0.8)',
                        'rgba(139, 92, 246, 0.8)',
                        'rgba(236, 72, 153, 0.8)',
                        'rgba(6, 182, 212, 0.8)'
                      ],
                      borderColor: [
                        'rgb(59, 130, 246)',
                        'rgb(16, 185, 129)',
                        'rgb(245, 101, 101)',
                        'rgb(251, 191, 36)',
                        'rgb(139, 92, 246)',
                        'rgb(236, 72, 153)',
                        'rgb(6, 182, 212)'
                      ],
                      borderWidth: 2,
                      borderRadius: 8
                    }
                  ]
                }} 
                options={{
                  ...chartOptions,
                  plugins: {
                    ...chartOptions.plugins,
                    legend: {
                      display: false
                    }
                  },
                  scales: {
                    ...chartOptions.scales,
                    x: {
                      ...chartOptions.scales.x,
                      ticks: {
                        maxRotation: 45,
                        minRotation: 45
                      }
                    }
                  }
                }} 
              />
            </div>
          </CardContent>
        </Card>

        {/* Brands Performance Chart */}
        <Card className="p-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Tag className="h-5 w-5 text-green-500" />
              أداء العلامات التجارية
            </CardTitle>
            <CardDescription>
              توزيع الزيارات حسب العلامة التجارية - {uniqueBrands.length} علامة تجارية
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <Doughnut 
                data={{
                  labels: uniqueBrands,
                  datasets: [
                    {
                      data: uniqueBrands.map(brand => 
                        filteredVisits.filter(v => v.brand === brand).length
                      ),
                      backgroundColor: [
                        'rgba(59, 130, 246, 0.8)',
                        'rgba(16, 185, 129, 0.8)',
                        'rgba(245, 101, 101, 0.8)',
                        'rgba(251, 191, 36, 0.8)',
                        'rgba(139, 92, 246, 0.8)'
                      ],
                      borderColor: [
                        'rgb(59, 130, 246)',
                        'rgb(16, 185, 129)',
                        'rgb(245, 101, 101)',
                        'rgb(251, 191, 36)',
                        'rgb(139, 92, 246)'
                      ],
                      borderWidth: 3
                    }
                  ]
                }} 
                options={{
                  ...chartOptions,
                  plugins: {
                    ...chartOptions.plugins,
                    legend: {
                      position: 'bottom',
                      labels: {
                        padding: 20,
                        usePointStyle: true,
                        font: {
                          size: 12
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

      {/* Second Row of Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Clinics Performance Chart */}
        <Card className="p-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-purple-500" />
              أداء العيادات
            </CardTitle>
            <CardDescription>
              عدد الزيارات لكل عيادة - {uniqueClinics.length} عيادة نشطة
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <Bar 
                data={{
                  labels: uniqueClinics.map(clinic => clinic.length > 15 ? clinic.substring(0, 15) + '...' : clinic),
                  datasets: [
                    {
                      label: 'عدد الزيارات',
                      data: uniqueClinics.map(clinic => 
                        filteredVisits.filter(v => v.clinicName === clinic).length
                      ),
                      backgroundColor: 'rgba(139, 92, 246, 0.8)',
                      borderColor: 'rgb(139, 92, 246)',
                      borderWidth: 2,
                      borderRadius: 8
                    }
                  ]
                }} 
                options={{
                  ...chartOptions,
                  indexAxis: 'y',
                  plugins: {
                    ...chartOptions.plugins,
                    legend: {
                      display: false
                    }
                  }
                }} 
              />
            </div>
          </CardContent>
        </Card>

        {/* Products Performance Chart */}
        <Card className="p-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-orange-500" />
              أداء المنتجات
            </CardTitle>
            <CardDescription>
              مقارنة أداء المنتجات الثلاثة
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <Bar 
                data={{
                  labels: ['المنتج الأول', 'المنتج الثاني', 'المنتج الثالث'],
                  datasets: [
                    {
                      label: 'عدد مرات الاستخدام',
                      data: [
                        filteredVisits.length,
                        filteredVisits.length,
                        filteredVisits.length
                      ],
                      backgroundColor: [
                        'rgba(245, 101, 101, 0.8)',
                        'rgba(251, 191, 36, 0.8)',
                        'rgba(16, 185, 129, 0.8)'
                      ],
                      borderColor: [
                        'rgb(245, 101, 101)',
                        'rgb(251, 191, 36)',
                        'rgb(16, 185, 129)'
                      ],
                      borderWidth: 2,
                      borderRadius: 12
                    }
                  ]
                }} 
                options={{
                  ...chartOptions,
                  plugins: {
                    ...chartOptions.plugins,
                    legend: {
                      display: false
                    }
                  }
                }} 
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Trends */}
        <Card className="shadow-lg border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-500" />
              اتجاهات الزيارات والإيرادات الشهرية (البيانات المفلترة)
            </CardTitle>
            <CardDescription>
              مقارنة شهرية لعدد الزيارات والإيرادات المحققة - عرض {filteredVisits.length} من أصل {visits.length} زيارة
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <Line data={{
                ...monthlyTrendsData,
                datasets: monthlyTrendsData.datasets.map(dataset => ({
                  ...dataset,
                  label: dataset.label + ` (${filteredVisits.length} زيارة مفلترة)`
                }))
              }} options={chartOptions} />
            </div>
          </CardContent>
        </Card>

        {/* Specialty Distribution */}
        <Card className="shadow-lg border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-green-500" />
              توزيع الزيارات حسب التخصص (البيانات المفلترة)
            </CardTitle>
            <CardDescription>
              نسبة الزيارات لكل تخصص طبي - إجمالي {filteredVisits.length} زيارة
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <Doughnut 
                data={{
                  ...specialtyData,
                  labels: [...new Set(filteredVisits.map(v => v.specialty))],
                  datasets: [{
                    ...specialtyData.datasets[0],
                    data: [...new Set(filteredVisits.map(v => v.specialty))].map(specialty => 
                      filteredVisits.filter(v => v.specialty === specialty).length
                    )
                  }]
                }} 
                options={{
                  ...chartOptions,
                  plugins: {
                    ...chartOptions.plugins,
                    legend: {
                      ...chartOptions.plugins.legend,
                      position: 'right' as const
                    }
                  }
                }} 
              />
            </div>
          </CardContent>
        </Card>

        {/* Clinic Comparison */}
        <Card className="shadow-lg border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-purple-500" />
              مقارنة أداء العيادات (البيانات المفلترة)
            </CardTitle>
            <CardDescription>
              مقارنة الزيارات والإيرادات بين العيادات المختلفة - {uniqueClinics.length} عيادة نشطة
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <Bar 
                data={{
                  labels: [...new Set(filteredVisits.map(v => v.clinicName))],
                  datasets: [
                    {
                      ...clinicComparisonData.datasets[0],
                      label: `عدد الزيارات (${filteredVisits.length} إجمالي)`,
                      data: [...new Set(filteredVisits.map(v => v.clinicName))].map(clinic => 
                        filteredVisits.filter(v => v.clinicName === clinic).length
                      )
                    },
                    {
                      ...clinicComparisonData.datasets[1],
                      label: 'الإيرادات المقدرة (بالآلاف)',
                      data: [...new Set(filteredVisits.map(v => v.clinicName))].map(clinic => 
                        Math.round(filteredVisits.filter(v => v.clinicName === clinic).length * 500 / 1000)
                      )
                    }
                  ]
                }} 
                options={{
                  ...chartOptions,
                  scales: {
                    ...chartOptions.scales,
                    x: {
                      ...chartOptions.scales.x,
                      stacked: false
                    },
                    y: {
                      ...chartOptions.scales.y,
                      stacked: false
                    }
                  }
                }} 
              />
            </div>
          </CardContent>
        </Card>

        {/* Product Performance Area Chart */}
        <Card className="shadow-lg border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-orange-500" />
              أداء المنتجات
            </CardTitle>
            <CardDescription>
              تحليل شامل لأداء المنتجات ورضا العملاء
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <Line 
                data={{
                  labels: mockAnalyticsData.productPerformance.labels,
                  datasets: [
                    {
                      label: 'المبيعات (%)',
                      data: mockAnalyticsData.productPerformance.sales,
                      borderColor: '#f59e0b',
                      backgroundColor: 'rgba(245, 158, 11, 0.1)',
                      borderWidth: 3,
                      fill: true,
                      tension: 0.4,
                      pointBackgroundColor: '#f59e0b',
                      pointBorderColor: '#ffffff',
                      pointBorderWidth: 2,
                      pointRadius: 6
                    },
                    {
                      label: 'رضا العملاء (%)',
                      data: mockAnalyticsData.productPerformance.satisfaction,
                      borderColor: '#8b5cf6',
                      backgroundColor: 'rgba(139, 92, 246, 0.1)',
                      borderWidth: 3,
                      fill: true,
                      tension: 0.4,
                      pointBackgroundColor: '#8b5cf6',
                      pointBorderColor: '#ffffff',
                      pointBorderWidth: 2,
                      pointRadius: 6
                    }
                  ]
                }} 
                options={chartOptions} 
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Summary Statistics */}
      <Card className="shadow-lg border-0">
        <CardHeader>
          <CardTitle>ملخص الإحصائيات</CardTitle>
          <CardDescription>
            نظرة عامة على الأداء العام للعيادات
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600 mb-2">
                {mockAnalyticsData.kpis.avgVisitsPerDay}
              </div>
              <div className="text-sm text-gray-600">متوسط الزيارات اليومية</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600 mb-2">
                {(mockAnalyticsData.kpis.totalRevenue / mockAnalyticsData.kpis.totalVisits).toFixed(0)} ر.س
              </div>
              <div className="text-sm text-gray-600">متوسط الإيراد لكل زيارة</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600 mb-2">
                {mockAnalyticsData.kpis.growthRate}%
              </div>
              <div className="text-sm text-gray-600">معدل النمو الشهري</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClinicsAnalytics;