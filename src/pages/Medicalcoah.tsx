import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { 
  CalendarIcon, 
  Search, 
  Filter, 
  RefreshCw, 
  Users, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  UserCheck,
  Star,
  Award,
  Target
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';

interface MedicalRepEvaluation {
  _id: string;
  medicalRepId: string;
  medicalRepName: string;
  evaluationPeriod: string;
  performanceScore: number;
  status: 'pending' | 'completed' | 'in_progress';
  lastEvaluationDate: string;
  nextEvaluationDate: string;
  department: string;
  region: string;
}

const Medicalcoah: React.FC = () => {
  const { user } = useAuthStore();
  const [evaluations, setEvaluations] = useState<MedicalRepEvaluation[]>([]);
  const [loading, setLoading] = useState(false);
  
  const [stats, setStats] = useState({
    totalReps: 0,
    pendingEvaluations: 0,
    completedEvaluations: 0,
    inProgressEvaluations: 0
  });

  const [filters, setFilters] = useState({
    status: 'all',
    startDate: undefined as Date | undefined,
    endDate: undefined as Date | undefined,
    search: '',
    department: 'all',
    region: 'all'
  });

  // Mock data - replace with actual API call
  useEffect(() => {
    // Simulate loading
    setLoading(true);
    setTimeout(() => {
      setEvaluations([]);
      setStats({
        totalReps: 0,
        pendingEvaluations: 0,
        completedEvaluations: 0,
        inProgressEvaluations: 0
      });
      setLoading(false);
    }, 1000);
  }, []);

  const handleReset = () => {
    setFilters({
      status: 'all',
      startDate: undefined,
      endDate: undefined,
      search: '',
      department: 'all',
      region: 'all'
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-300">قيد الانتظار</Badge>;
      case 'completed':
        return <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-300">مكتمل</Badge>;
      case 'in_progress':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-blue-300">قيد التنفيذ</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-lg font-medium">جاري تحميل البيانات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">تقييم المندوبين الطبيين</h1>
          <p className="text-gray-600 mt-1">إدارة وتقييم أداء المندوبين الطبيين</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleReset} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            إعادة تعيين
          </Button>
          <Button size="sm" disabled>
            <Target className="w-4 h-4 mr-2" />
            إضافة تقييم
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-700">إجمالي المندوبين</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-800">{stats.totalReps}</div>
            <p className="text-xs text-blue-600 mt-1">جميع المندوبين</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-yellow-700">قيد الانتظار</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-800">{stats.pendingEvaluations}</div>
            <p className="text-xs text-yellow-600 mt-1">تقييمات معلقة</p>
          </CardContent>
        </Card>

        

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-700">مكتملة</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-800">{stats.completedEvaluations}</div>
            <p className="text-xs text-green-600 mt-1">تقييمات مكتملة</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            الفلاتر والبحث
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="البحث في أسماء المندوبين..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="pl-10"
              />
            </div>

            {/* Status Filter */}
            <Select value={filters.status} onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="حالة التقييم" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الحالات</SelectItem>
                <SelectItem value="pending">قيد الانتظار</SelectItem>
                <SelectItem value="in_progress">قيد التنفيذ</SelectItem>
                <SelectItem value="completed">مكتمل</SelectItem>
              </SelectContent>
            </Select>

   

        

            {/* Start Date */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="justify-start text-left font-normal w-full">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {filters.startDate ? format(filters.startDate, 'dd/MM/yyyy', { locale: ar }) : 'من تاريخ'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={filters.startDate}
                  onSelect={(date) => setFilters(prev => ({ ...prev, startDate: date }))}
                  initialFocus
                />
              </PopoverContent>
            </Popover>

            {/* End Date */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="justify-start text-left font-normal w-full">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {filters.endDate ? format(filters.endDate, 'dd/MM/yyyy', { locale: ar }) : 'إلى تاريخ'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={filters.endDate}
                  onSelect={(date) => setFilters(prev => ({ ...prev, endDate: date }))}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCheck className="w-5 h-5" />
            تقييمات المندوبين الطبيين
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Empty State */}
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
              <UserCheck className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              لا يوجد مندوب حالياً بحاجة إلى تقييم
            </h3>
            <p className="text-gray-600 mb-6 max-w-md">
              جميع المندوبين الطبيين قد تم تقييمهم مؤخراً. ستظهر هنا التقييمات الجديدة عند استحقاقها.
            </p>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4" />
                <span>تقييمات دورية</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4" />
                <span>متابعة الأداء</span>
              </div>
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4" />
                <span>تحسين الجودة</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">تقارير الأداء</h3>
                <p className="text-sm text-gray-600">عرض تقارير أداء المندوبين</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Award className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">معايير التقييم</h3>
                <p className="text-sm text-gray-600">إدارة معايير ومقاييس التقييم</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">إدارة المندوبين</h3>
                <p className="text-sm text-gray-600">عرض وإدارة بيانات المندوبين</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div> */}
    </div>
  );
};

export default Medicalcoah;