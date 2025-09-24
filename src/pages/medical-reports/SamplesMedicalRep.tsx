import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { CalendarIcon, Search, Filter, RefreshCw, Package, Users, TrendingUp, Clock, CheckCircle, XCircle, Download, User } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { 
  getSampleRequestsByUserId, 
  UserSampleRequest, 
  UserSampleRequestsResponse,
  exportUserSampleRequestsToExcel 
} from '@/api/SampleRequests';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface Filters {
  status: 'all' | 'pending' | 'approved' | 'cancelled';
  startDate?: Date;
  endDate?: Date;
  search: string;
  doctor?: string;
  product?: string;
}

const SamplesMedicalRep: React.FC = () => {
  const { user } = useAuthStore();
  const [requests, setRequests] = useState<UserSampleRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [exportLoading, setExportLoading] = useState(false);
  const [userInfo, setUserInfo] = useState<any>(null);

  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalRequests: 0,
    hasNext: false,
    hasPrev: false
  });
  
  const [stats, setStats] = useState({
    pending: 0,
    approved: 0,
    cancelled: 0,
    total: 0
  });

  const [filters, setFilters] = useState<Filters>({
    status: 'all',
    search: '',
  });

  const fetchRequests = async () => {
    if (!user?._id) return;
    
    try {
      setLoading(true);
      const params = {
        page: pagination.currentPage,
        limit: 10,
        status: filters.status !== 'all' ? filters.status : undefined,
        startDate: filters.startDate ? format(filters.startDate, 'yyyy-MM-dd') : undefined,
        endDate: filters.endDate ? format(filters.endDate, 'yyyy-MM-dd') : undefined,
        search: filters.search || undefined,
        doctor: filters.doctor || undefined,
        product: filters.product || undefined,
      };
      
      const response: UserSampleRequestsResponse = await getSampleRequestsByUserId(user._id, params);
      setRequests(response.data || []);
      setPagination(response.pagination);
      setStats(response.stats);
      setUserInfo(response.userInfo);
      
    } catch (error: any) {
      console.error('Error fetching requests:', error);
      toast({
        title: 'خطأ',
        description: error.message || 'حدث خطأ أثناء جلب الطلبات',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [user?._id, pagination.currentPage, filters]);

  const handleSearch = (searchTerm: string) => {
    setFilters(prev => ({ ...prev, search: searchTerm }));
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const handleReset = () => {
    setFilters({
      status: 'all',
      search: '',
    });
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">قيد الانتظار</Badge>;
      case 'approved':
        return <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-200">موافق عليه</Badge>;
      case 'cancelled':
        return <Badge variant="secondary" className="bg-red-100 text-red-800 hover:bg-red-200">ملغى</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd/MM/yyyy', { locale: ar });
  };

  const handleExportToExcel = async () => {
    if (!user?._id) return;
    
    try {
      setExportLoading(true);
      
      const exportParams = {
        status: filters.status !== 'all' ? filters.status : undefined,
        startDate: filters.startDate ? format(filters.startDate, 'yyyy-MM-dd') : undefined,
        endDate: filters.endDate ? format(filters.endDate, 'yyyy-MM-dd') : undefined,
        search: filters.search || undefined,
        doctor: filters.doctor || undefined,
        product: filters.product || undefined,
      };
      
      const blob = await exportUserSampleRequestsToExcel(user._id, exportParams);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // Generate filename with current date and user info
      const currentDate = new Date().toISOString().split('T')[0];
      const statusText = filters.status !== 'all' ? `_${filters.status}` : '';
      const userText = userInfo ? `_${userInfo.username}` : '';
      link.download = `sample_requests${userText}${statusText}_${currentDate}.xlsx`;
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast({
        title: 'نجح التصدير',
        description: 'تم تصدير البيانات بنجاح',
      });
    } catch (error: any) {
      console.error('Export error:', error);
      toast({
        title: 'خطأ في التصدير',
        description: error.message || 'حدث خطأ أثناء تصدير البيانات',
        variant: 'destructive',
      });
    } finally {
      setExportLoading(false);
    }
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'MEDICAL REP':
        return 'مندوب طبي';
      case 'ADMIN':
        return 'مسؤول';
      case 'SUPERVISOR':
        return 'مشرف';
      default:
        return role;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6 max-w-7xl">
      {/* Header with User Info */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">طلبات العينات</h1>
          <p className="text-muted-foreground mt-1">عرض ومتابعة طلبات العينات</p>
          
          {userInfo && (
            <div className="flex items-center gap-2 mt-2 p-3 bg-muted rounded-lg">
              <User className="w-4 h-4" />
              <span className="font-medium">{userInfo.name}</span>
              <Badge variant="outline">{getRoleDisplayName(userInfo.role)}</Badge>
              <span className="text-sm text-muted-foreground">@{userInfo.username}</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button 
            onClick={handleExportToExcel} 
            disabled={exportLoading || loading}
            variant="outline"
            className="gap-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white border-0"
          >
            {exportLoading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            {exportLoading ? 'جاري التصدير...' : 'تصدير Excel'}
          </Button>
          <Button onClick={fetchRequests} disabled={loading} className="gap-2">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            تحديث
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-700">إجمالي الطلبات</CardTitle>
            <Package className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-800">{stats.total}</div>
            <p className="text-xs text-blue-600 mt-1">جميع الطلبات</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-yellow-700">قيد الانتظار</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-800">{stats.pending}</div>
            <p className="text-xs text-yellow-600 mt-1">في انتظار المراجعة</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-700">موافق عليها</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-800">{stats.approved}</div>
            <p className="text-xs text-green-600 mt-1">تمت الموافقة</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-red-700">ملغاة</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-800">{stats.cancelled}</div>
            <p className="text-xs text-red-600 mt-1">تم الإلغاء</p>
          </CardContent>
        </Card>
      </div>

      {/* Additional Stats for Supervisor */}
      {userInfo?.role === 'SUPERVISOR' && stats.medicalRepsCount !== undefined && (
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-700">المندوبين التابعين</CardTitle>
            <Users className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-800">{stats.medicalRepsCount}</div>
            <p className="text-xs text-purple-600 mt-1">عدد المندوبين تحت الإشراف</p>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            الفلاتر والبحث
          </CardTitle>
          <CardDescription>
            تصفية الطلبات حسب المعايير المطلوبة
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="البحث في الملاحظات والمنتجات..."
                value={filters.search}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Status Filter */}
            <Select value={filters.status} onValueChange={(value: any) => setFilters(prev => ({ ...prev, status: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="حالة الطلب" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الحالات</SelectItem>
                <SelectItem value="pending">قيد الانتظار</SelectItem>
                <SelectItem value="approved">موافق عليه</SelectItem>
                <SelectItem value="cancelled">ملغى</SelectItem>
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

          <div className="flex justify-end gap-2">
            <Button onClick={handleReset} variant="outline" className="gap-2">
              <RefreshCw className="w-4 h-4" />
              إعادة تعيين
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Requests Table */}
      <Card>
        <CardHeader>
          <CardTitle>قائمة الطلبات</CardTitle>
          <CardDescription>
            عرض {requests.length} من أصل {pagination.totalRequests} طلب - الصفحة {pagination.currentPage} من {pagination.totalPages}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-center">#</TableHead>
                  <TableHead className="text-center">تاريخ الطلب</TableHead>
                  <TableHead className="text-center">تاريخ التسليم</TableHead>
                  <TableHead className="text-center">المنتج</TableHead>
                  <TableHead className="text-center">الدكتور</TableHead>
                  {userInfo?.role !== 'MEDICAL REP' && (
                    <TableHead className="text-center">المندوب</TableHead>
                  )}
                  <TableHead className="text-center">الكمية</TableHead>
                  <TableHead className="text-center">الحالة</TableHead>
                  <TableHead className="text-center">الملاحظات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={userInfo?.role !== 'MEDICAL REP' ? 9 : 8} className="text-center py-8">
                      <div className="flex flex-col items-center justify-center text-muted-foreground">
                        <Package className="w-12 h-12 mb-4 opacity-50" />
                        <p className="text-lg">لا توجد طلبات عينات</p>
                        <p className="text-sm">لم يتم العثور على أي طلبات تطابق معايير البحث</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  requests.map((request, index) => (
                    <TableRow key={request._id}>
                      <TableCell className="text-center font-medium">
                        {(pagination.currentPage - 1) * 10 + index + 1}
                      </TableCell>
                      <TableCell className="text-center">
                        {formatDate(request.requestDate)}
                      </TableCell>
                      <TableCell className="text-center">
                        {formatDate(request.deliveryDate)}
                      </TableCell>
                      <TableCell>
                        <div className="text-center">
                          <div className="font-medium">{request.product.PRODUCT}</div>
                          {request.product.CODE && (
                            <div className="text-xs text-muted-foreground">كود: {request.product.CODE}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-center">
                          <div className="font-medium">{request.doctor.drName}</div>
                          {request.doctor.specialty && (
                            <div className="text-xs text-muted-foreground">{request.doctor.specialty}</div>
                          )}
                        </div>
                      </TableCell>
                      {userInfo?.role !== 'MEDICAL REP' && request.medicalRep && (
                        <TableCell className="text-center">
                          <div className="font-medium">{request.medicalRep.username}</div>
                          {request.medicalRep.firstName && (
                            <div className="text-xs text-muted-foreground">
                              {request.medicalRep.firstName} {request.medicalRep.lastName}
                            </div>
                          )}
                        </TableCell>
                      )}
                      <TableCell className="text-center">
                        <Badge variant="outline" className="font-mono text-lg">
                          {request.quantity}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        {getStatusBadge(request.status)}
                      </TableCell>
                      <TableCell>
                        <div 
                          className="max-w-xs truncate text-center" 
                          title={request.notes}
                        >
                          {request.notes || '—'}
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
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-muted-foreground">
                عرض {requests.length} عنصر من أصل {pagination.totalRequests}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage - 1 }))}
                  disabled={!pagination.hasPrev || loading}
                >
                  السابق
                </Button>
                
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                    const pageNum = i + 1;
                    return (
                      <Button
                        key={pageNum}
                        variant={pagination.currentPage === pageNum ? "default" : "outline"}
                        size="sm"
                        onClick={() => setPagination(prev => ({ ...prev, currentPage: pageNum }))}
                        disabled={loading}
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage + 1 }))}
                  disabled={!pagination.hasNext || loading}
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

export default SamplesMedicalRep;