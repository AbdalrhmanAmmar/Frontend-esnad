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
import { CalendarIcon, Search, Filter, RefreshCw, Package, Users, TrendingUp, Clock, CheckCircle, XCircle, MoreVertical, Check, X, AlertTriangle, Download } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { getSupervisorSampleRequests, SupervisorSampleRequest, SupervisorSampleRequestsResponse, updateSampleRequestBySupervisor, exportSupervisorSampleRequestsToExcel } from '@/api/SampleRequests';
import { getSupervisorMarketingActivityRequests, SupervisorMarketingActivityRequest, SupervisorMarketingActivityRequestsResponse } from '@/api/MarketingActivities';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import toast from 'react-hot-toast';

const SupervisorSampleRequests: React.FC = () => {
  const { user } = useAuthStore();
  const [requests, setRequests] = useState<SupervisorSampleRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 0,
    totalRequests: 0,
    hasNext: false,
    hasPrev: false
  });
  const [stats, setStats] = useState({
    pending: 0,
    approved: 0,
    cancelled: 0
  });
  const [medicalRepsCount, setMedicalRepsCount] = useState(0);

  // Marketing Activity Requests State
  const [marketingRequests, setMarketingRequests] = useState<SupervisorMarketingActivityRequest[]>([]);
  const [marketingLoading, setMarketingLoading] = useState(true);
  const [marketingPagination, setMarketingPagination] = useState({
    currentPage: 1,
    totalPages: 0,
    totalRequests: 0,
    hasNext: false,
    hasPrev: false
  });
  const [marketingStats, setMarketingStats] = useState({
    pending: 0,
    approved: 0,
    rejected: 0
  });
  
  // Filters
  const [filters, setFilters] = useState({
    status: 'all',
    startDate: undefined as Date | undefined,
    endDate: undefined as Date | undefined,
    search: '',
    page: 1,
    limit: 10
  });

  // Marketing Activity Filters
  const [marketingFilters, setMarketingFilters] = useState({
    status: 'all',
    startDate: undefined as Date | undefined,
    endDate: undefined as Date | undefined,
    search: '',
    page: 1,
    limit: 10
  });

  // Action states
  const [selectedRequest, setSelectedRequest] = useState<SupervisorSampleRequest | null>(null);
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);

  const fetchRequests = async () => {
    if (!user?._id) {
      console.log('No user ID found');
      return;
    }
    
    console.log('Starting to fetch requests for user:', user._id);
    setLoading(true);
    try {
      const params = {
        page: filters.page,
        limit: filters.limit,
        ...(filters.status && filters.status !== 'all' && { status: filters.status as 'pending' | 'approved' | 'cancelled' }),
        ...(filters.startDate && { startDate: filters.startDate.toISOString().split('T')[0] }),
        ...(filters.endDate && { endDate: filters.endDate.toISOString().split('T')[0] }),
        ...(filters.search && { search: filters.search })
      };
      
      console.log('API call params:', params);
      const response: SupervisorSampleRequestsResponse = await getSupervisorSampleRequests(user._id, params);
      
      console.log('Full API response:', response);
      if (response.success) {
        console.log('Response data:', response.data);
        console.log('Data length:', response.data?.length);
        setRequests(response.data);
        setPagination(response.pagination);
        setStats(response.stats);
        setMedicalRepsCount(response.medicalRepsCount);
      } else {
        console.log('Response not successful:', response);
      }
    } catch (error: any) {
      console.error('Error fetching requests:', error);
      console.error('Error details:', error.response?.data);
      toast.error(error.message || 'حدث خطأ في جلب الطلبات');
    } finally {
      setLoading(false);
    }
  };

  const fetchMarketingRequests = async () => {
    if (!user?._id) return;

    setMarketingLoading(true);
    try {
      const params = {
        page: marketingFilters.page,
        limit: marketingFilters.limit,
        status: marketingFilters.status !== 'all' ? marketingFilters.status : undefined,
        startDate: marketingFilters.startDate?.toISOString(),
        endDate: marketingFilters.endDate?.toISOString(),
        search: marketingFilters.search || undefined
      };

      const response = await getSupervisorMarketingActivityRequests(user._id, params);
      setMarketingRequests(response.data);
      setMarketingPagination(response.pagination);
      setMarketingStats(response.stats);
    } catch (error: any) {
      console.error('Error fetching marketing requests:', error);
      toast.error(error.message || 'حدث خطأ في جلب طلبات الأنشطة التسويقية');
    } finally {
      setMarketingLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [filters.page, filters.limit, filters.status]);

  useEffect(() => {
    fetchMarketingRequests();
  }, [marketingFilters.page, marketingFilters.limit, marketingFilters.status]);

  const handleSearch = () => {
    setFilters(prev => ({ ...prev, page: 1 }));
    fetchRequests();
  };

  const handleReset = () => {
    setFilters({
      status: 'all',
      startDate: undefined,
      endDate: undefined,
      search: '',
      page: 1,
      limit: 10
    });
  };

  const handleMarketingSearch = () => {
    setMarketingFilters(prev => ({ ...prev, page: 1 }));
    fetchMarketingRequests();
  };

  const handleMarketingReset = () => {
    setMarketingFilters({
      status: 'all',
      startDate: undefined,
      endDate: undefined,
      search: '',
      page: 1,
      limit: 10
    });
    fetchMarketingRequests();
  };

  const handleMarketingPageChange = (newPage: number) => {
    setMarketingFilters(prev => ({ ...prev, page: newPage }));
  };

  const getMarketingStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200"><Clock className="w-3 h-3 mr-1" />قيد الانتظار</Badge>;
      case 'approved':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200"><CheckCircle className="w-3 h-3 mr-1" />موافق عليه</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200"><XCircle className="w-3 h-3 mr-1" />مرفوض</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200"><Clock className="w-3 h-3 mr-1" />قيد الانتظار</Badge>;
      case 'approved':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200"><CheckCircle className="w-3 h-3 mr-1" />موافق عليه</Badge>;
      case 'cancelled':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200"><XCircle className="w-3 h-3 mr-1" />ملغي</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd/MM/yyyy', { locale: ar });
  };

  const handleActionRequest = (request: SupervisorSampleRequest, action: 'approve' | 'reject') => {
    setSelectedRequest(request);
    setActionType(action);
  };

  const confirmAction = async () => {
    if (!selectedRequest || !actionType || !user?._id) return;

    setActionLoading(true);
    try {
      const status = actionType === 'approve' ? 'approved' : 'cancelled';
      await updateSampleRequestBySupervisor(
        user._id,
        selectedRequest._id,
        status
      );

      toast.success(
        actionType === 'approve' 
          ? 'تم الموافقة على الطلب بنجاح' 
          : 'تم رفض الطلب بنجاح'
      );

      // Refresh the requests list
      await fetchRequests();
      
      // Reset states
      setSelectedRequest(null);
      setActionType(null);
    } catch (error: any) {
      toast.error(error.message || 'حدث خطأ أثناء تحديث الطلب');
    } finally {
      setActionLoading(false);
    }
  };

  const cancelAction = () => {
    setSelectedRequest(null);
    setActionType(null);
  };

  const handleExportToExcel = async () => {
    if (!user?._id) return;
    
    try {
      setExportLoading(true);
      
      const exportParams = {
        status: filters.status !== 'all' ? filters.status : undefined,
        startDate: filters.startDate,
        endDate: filters.endDate,
        search: filters.search || undefined
      };
      
      const blob = await exportSupervisorSampleRequestsToExcel(user._id, exportParams);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // Generate filename with current date
      const currentDate = new Date().toISOString().split('T')[0];
      const statusText = filters.status !== 'all' ? `_${filters.status}` : '';
      link.download = `sample_requests_export${statusText}_${currentDate}.xlsx`;
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('تم تصدير البيانات بنجاح');
    } catch (error: any) {
      console.error('Export error:', error);
      toast.error(error.message || 'حدث خطأ أثناء تصدير البيانات');
    } finally {
      setExportLoading(false);
    }
  };



  if (loading && requests.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-lg text-muted-foreground">جاري تحميل الطلبات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">قائمة طلبات العينات</h1>
          <p className="text-muted-foreground mt-1">إدارة ومتابعة طلبات العينات للمندوبين التابعين</p>
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
            {exportLoading ? 'جاري التصدير...' : 'تصدير إلى Excel'}
          </Button>
          <Button onClick={fetchRequests} disabled={loading} className="gap-2">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            تحديث
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">إجمالي الطلبات</p>
                <p className="text-2xl font-bold text-blue-700">{pagination.totalRequests}</p>
              </div>
              <Package className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-600">قيد الانتظار</p>
                <p className="text-2xl font-bold text-yellow-700">{stats.pending}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">موافق عليها</p>
                <p className="text-2xl font-bold text-green-700">{stats.approved}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-red-50 to-red-100 border-red-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-600">مرفوضة</p>
                <p className="text-2xl font-bold text-red-700">{stats.cancelled || 0}</p>
              </div>
              <XCircle className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">المندوبين</p>
                <p className="text-2xl font-bold text-purple-700">{medicalRepsCount}</p>
              </div>
              <Users className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            فلاتر البحث
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="space-y-2">
              <label className="text-sm font-medium">البحث</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="البحث في الملاحظات..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">الحالة</label>
              <Select value={filters.status} onValueChange={(value) => setFilters(prev => ({ ...prev, status: value, page: 1 }))}>
                <SelectTrigger>
                  <SelectValue placeholder="جميع الحالات" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الحالات</SelectItem>
                  <SelectItem value="pending">قيد الانتظار</SelectItem>
                  <SelectItem value="approved">موافق عليه</SelectItem>
                  <SelectItem value="cancelled">ملغي</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Start Date */}
            <div className="space-y-2">
              <label className="text-sm font-medium">من تاريخ</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filters.startDate ? formatDate(filters.startDate.toISOString()) : "اختر التاريخ"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={filters.startDate}
                    onSelect={(date) => setFilters(prev => ({ ...prev, startDate: date, page: 1 }))}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* End Date */}
            <div className="space-y-2">
              <label className="text-sm font-medium">إلى تاريخ</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filters.endDate ? formatDate(filters.endDate.toISOString()) : "اختر التاريخ"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={filters.endDate}
                    onSelect={(date) => setFilters(prev => ({ ...prev, endDate: date, page: 1 }))}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          
          <div className="flex gap-2 mt-4">
            <Button onClick={handleSearch} className="gap-2">
              <Search className="w-4 h-4" />
              بحث
            </Button>
            <Button variant="outline" onClick={handleReset}>
              إعادة تعيين
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Requests Table */}
      <Card>
        <CardHeader>
          <CardTitle>قائمة الطلبات</CardTitle>
        </CardHeader>
        <CardContent>
          {requests.length === 0 ? (
            <div className="text-center py-8">
              <Package className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-lg font-medium text-muted-foreground">لا توجد طلبات</p>
              <p className="text-sm text-muted-foreground">لم يتم العثور على أي طلبات بالفلاتر المحددة</p>
            </div>
          ) : (
            <div className="space-y-4">
              {requests.map((request) => (
                <Card key={request._id} className="border-l-4 border-l-primary">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 flex-1">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">المنتج</p>
                          <p className="font-semibold">{request.product.PRODUCT}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">الطبيب</p>
                          <p className="font-semibold">{request.doctor.drName}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">المندوب</p>
                          <p className="font-semibold">{request.medicalRep.username}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">الحالة</p>
                          {getStatusBadge(request.status)}
                        </div>
                      </div>
                      
                      {/* Actions Button - Only for pending requests */}
                      {request.status === 'pending' && (
                        <div className="flex-shrink-0">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              <DropdownMenuItem
                                onClick={() => handleActionRequest(request, 'approve')}
                                className="text-green-600 focus:text-green-600 focus:bg-green-50"
                              >
                                <Check className="mr-2 h-4 w-4" />
                                الموافقة على الطلب
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleActionRequest(request, 'reject')}
                                className="text-red-600 focus:text-red-600 focus:bg-red-50"
                              >
                                <X className="mr-2 h-4 w-4" />
                                رفض الطلب
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      )}

                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">تاريخ الطلب</p>
                        <p className="font-semibold">{formatDate(request.requestDate)}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">تاريخ التسليم</p>
                        <p className="font-semibold">{formatDate(request.deliveryDate)}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">الكمية</p>
                        <p className="font-semibold">{request.quantity}</p>
                      </div>
                    </div>
                    
                    {request.notes && (
                      <div className="mt-4">
                        <p className="text-sm font-medium text-muted-foreground">الملاحظات</p>
                        <p className="text-sm bg-muted p-2 rounded">{request.notes}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            عرض {((pagination.currentPage - 1) * filters.limit) + 1} إلى {Math.min(pagination.currentPage * filters.limit, pagination.totalRequests)} من {pagination.totalRequests} طلب
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              disabled={!pagination.hasPrev}
              onClick={() => setFilters(prev => ({ ...prev, page: prev.page - 1 }))}
            >
              السابق
            </Button>
            <Button
              variant="outline"
              disabled={!pagination.hasNext}
              onClick={() => setFilters(prev => ({ ...prev, page: prev.page + 1 }))}
            >
              التالي
            </Button>
          </div>
        </div>
      )}

      {/* Marketing Activity Requests Section */}
      <div className="mt-12">
        {/* Marketing Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-foreground">طلبات الأنشطة التسويقية</h2>
            <p className="text-muted-foreground mt-1">إدارة ومتابعة طلبات الأنشطة التسويقية للمندوبين التابعين</p>
          </div>
          <Button onClick={fetchMarketingRequests} disabled={marketingLoading} className="gap-2">
            <RefreshCw className={`w-4 h-4 ${marketingLoading ? 'animate-spin' : ''}`} />
            تحديث
          </Button>
        </div>

        {/* Marketing Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600">إجمالي الطلبات</p>
                  <p className="text-2xl font-bold text-purple-700">{marketingPagination.totalRequests}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-yellow-600">قيد الانتظار</p>
                  <p className="text-2xl font-bold text-yellow-700">{marketingStats.pending}</p>
                </div>
                <Clock className="w-8 h-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600">موافق عليها</p>
                  <p className="text-2xl font-bold text-green-700">{marketingStats.approved}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-r from-red-50 to-red-100 border-red-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-red-600">مرفوضة</p>
                  <p className="text-2xl font-bold text-red-700">{marketingStats.rejected}</p>
                </div>
                <XCircle className="w-8 h-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Marketing Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              فلاتر البحث - الأنشطة التسويقية
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Search */}
              <div className="space-y-2">
                <label className="text-sm font-medium">البحث</label>
                <Input
                  placeholder="ابحث في الطلبات..."
                  value={marketingFilters.search}
                  onChange={(e) => setMarketingFilters(prev => ({ ...prev, search: e.target.value, page: 1 }))}
                />
              </div>

              {/* Status Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">الحالة</label>
                <Select
                  value={marketingFilters.status}
                  onValueChange={(value) => setMarketingFilters(prev => ({ ...prev, status: value, page: 1 }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="اختر الحالة" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع الحالات</SelectItem>
                    <SelectItem value="pending">قيد الانتظار</SelectItem>
                    <SelectItem value="approved">موافق عليه</SelectItem>
                    <SelectItem value="rejected">مرفوض</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Start Date */}
              <div className="space-y-2">
                <label className="text-sm font-medium">من تاريخ</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {marketingFilters.startDate ? formatDate(marketingFilters.startDate.toISOString()) : "اختر التاريخ"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={marketingFilters.startDate}
                      onSelect={(date) => setMarketingFilters(prev => ({ ...prev, startDate: date, page: 1 }))}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* End Date */}
              <div className="space-y-2">
                <label className="text-sm font-medium">إلى تاريخ</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {marketingFilters.endDate ? formatDate(marketingFilters.endDate.toISOString()) : "اختر التاريخ"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={marketingFilters.endDate}
                      onSelect={(date) => setMarketingFilters(prev => ({ ...prev, endDate: date, page: 1 }))}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            
            <div className="flex gap-2 mt-4">
              <Button onClick={handleMarketingSearch} className="gap-2">
                <Search className="w-4 h-4" />
                بحث
              </Button>
              <Button variant="outline" onClick={handleMarketingReset}>
                إعادة تعيين
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Marketing Requests Table */}
        <Card>
          <CardHeader>
            <CardTitle>قائمة طلبات الأنشطة التسويقية</CardTitle>
          </CardHeader>
          <CardContent>
            {marketingLoading ? (
              <div className="text-center py-8">
                <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
                <p className="text-lg text-muted-foreground">جاري تحميل طلبات الأنشطة التسويقية...</p>
              </div>
            ) : marketingRequests.length === 0 ? (
              <div className="text-center py-8">
                <TrendingUp className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-lg font-medium text-muted-foreground">لا توجد طلبات أنشطة تسويقية</p>
                <p className="text-sm text-muted-foreground">لم يتم العثور على أي طلبات بالفلاتر المحددة</p>
              </div>
            ) : (
              <div className="space-y-4">
                {marketingRequests.map((request) => (
                  <Card key={request._id} className="border-l-4 border-l-purple-500">
                    <CardContent className="p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">الطبيب</p>
                          <p className="font-semibold">{request.doctor.drName}</p>
                          <p className="text-sm text-muted-foreground">{request.doctor.organizationName}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">التخصص</p>
                          <p className="font-semibold">{request.doctor.specialty}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">المندوب</p>
                          <p className="font-semibold">{request.createdBy.firstName} {request.createdBy.lastName}</p>
                          <p className="text-sm text-muted-foreground">{request.createdBy.username}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">الحالة</p>
                          {getMarketingStatusBadge(request.status)}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">تاريخ النشاط</p>
                          <p className="font-semibold">{formatDate(request.activityDate)}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">تاريخ الطلب</p>
                          <p className="font-semibold">{formatDate(request.requestDate)}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">التكلفة</p>
                          <p className="font-semibold text-green-600">{request.cost} د.ل</p>
                        </div>
                      </div>
                      
                      {request.notes && (
                        <div className="mt-4">
                          <p className="text-sm font-medium text-muted-foreground">الملاحظات</p>
                          <p className="text-sm bg-muted p-2 rounded">{request.notes}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Marketing Pagination */}
        {marketingPagination.totalPages > 1 && (
          <div className="flex items-center justify-between mt-6">
            <p className="text-sm text-muted-foreground">
              عرض {((marketingPagination.currentPage - 1) * marketingFilters.limit) + 1} إلى {Math.min(marketingPagination.currentPage * marketingFilters.limit, marketingPagination.totalRequests)} من {marketingPagination.totalRequests} طلب
            </p>
            <div className="flex gap-2">
              <Button
                 variant="outline"
                 disabled={!marketingPagination.hasPrev}
                 onClick={() => handleMarketingPageChange(marketingPagination.currentPage - 1)}
               >
                 السابق
               </Button>
               <Button
                 variant="outline"
                 disabled={!marketingPagination.hasNext}
                 onClick={() => handleMarketingPageChange(marketingPagination.currentPage + 1)}
               >
                 التالي
               </Button>
            </div>
          </div>
        )}
      </div>

      {/* Confirmation Dialog */}
      <AlertDialog open={selectedRequest !== null && actionType !== null} onOpenChange={cancelAction}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              تأكيد الإجراء
            </AlertDialogTitle>
            <AlertDialogDescription>
              {actionType === 'approve' ? (
                <span>
                  هل أنت متأكد من <span className="font-semibold text-green-600">الموافقة</span> على طلب العينة؟
                  <br />
                  <span className="text-sm text-muted-foreground mt-2 block">
                    المنتج: {selectedRequest?.product.PRODUCT}
                  </span>
                </span>
              ) : (
                <span>
                  هل أنت متأكد من <span className="font-semibold text-red-600">رفض</span> طلب العينة؟
                  <br />
                  <span className="text-sm text-muted-foreground mt-2 block">
                    المنتج: {selectedRequest?.product.PRODUCT}
                  </span>
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelAction} disabled={actionLoading}>
              إلغاء
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmAction}
              disabled={actionLoading}
              className={actionType === 'approve' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
            >
              {actionLoading ? (
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              ) : actionType === 'approve' ? (
                <Check className="mr-2 h-4 w-4" />
              ) : (
                <X className="mr-2 h-4 w-4" />
              )}
              {actionType === 'approve' ? 'موافقة' : 'رفض'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Marketing Activity Requests Section */}
      <div className="mt-12">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-foreground">طلبات النشاط التسويقي</h2>
            <p className="text-muted-foreground mt-1">إدارة ومتابعة طلبات الأنشطة التسويقية للمندوبين التابعين</p>
          </div>
          <Button onClick={fetchMarketingRequests} disabled={marketingLoading} className="gap-2">
            <RefreshCw className={`w-4 h-4 ${marketingLoading ? 'animate-spin' : ''}`} />
            تحديث
          </Button>
        </div>

        {/* Marketing Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600">إجمالي الطلبات</p>
                  <p className="text-2xl font-bold text-blue-700">{marketingPagination.totalRequests}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-yellow-600">قيد الانتظار</p>
                  <p className="text-2xl font-bold text-yellow-700">{marketingStats.pending}</p>
                </div>
                <Clock className="w-8 h-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600">موافق عليها</p>
                  <p className="text-2xl font-bold text-green-700">{marketingStats.approved}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-r from-red-50 to-red-100 border-red-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-red-600">مرفوضة</p>
                  <p className="text-2xl font-bold text-red-700">{marketingStats.rejected || 0}</p>
                </div>
                <XCircle className="w-8 h-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Marketing Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              فلاتر البحث
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              {/* Status Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">الحالة</label>
                <Select
                  value={marketingFilters.status}
                  onValueChange={(value) => setMarketingFilters(prev => ({ ...prev, status: value, page: 1 }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="اختر الحالة" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع الحالات</SelectItem>
                    <SelectItem value="pending">قيد الانتظار</SelectItem>
                    <SelectItem value="approved">موافق عليها</SelectItem>
                    <SelectItem value="rejected">مرفوضة</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Start Date */}
              <div className="space-y-2">
                <label className="text-sm font-medium">من تاريخ</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {marketingFilters.startDate ? format(marketingFilters.startDate, 'dd/MM/yyyy', { locale: ar }) : 'اختر التاريخ'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={marketingFilters.startDate}
                      onSelect={(date) => setMarketingFilters(prev => ({ ...prev, startDate: date, page: 1 }))}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* End Date */}
              <div className="space-y-2">
                <label className="text-sm font-medium">إلى تاريخ</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {marketingFilters.endDate ? format(marketingFilters.endDate, 'dd/MM/yyyy', { locale: ar }) : 'اختر التاريخ'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={marketingFilters.endDate}
                      onSelect={(date) => setMarketingFilters(prev => ({ ...prev, endDate: date, page: 1 }))}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Search */}
              <div className="space-y-2">
                <label className="text-sm font-medium">البحث</label>
                <div className="flex gap-2">
                  <Input
                    placeholder="البحث في الملاحظات..."
                    value={marketingFilters.search}
                    onChange={(e) => setMarketingFilters(prev => ({ ...prev, search: e.target.value }))}
                    className="flex-1"
                  />
                  <Button onClick={handleMarketingSearch} size="icon">
                    <Search className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button onClick={handleMarketingSearch} className="gap-2">
                <Search className="w-4 h-4" />
                بحث
              </Button>
              <Button variant="outline" onClick={handleMarketingReset}>
                إعادة تعيين
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Marketing Requests Table */}
        <Card>
          <CardHeader>
            <CardTitle>قائمة طلبات النشاط التسويقي</CardTitle>
          </CardHeader>
          <CardContent>
            {marketingLoading ? (
              <div className="text-center py-8">
                <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
                <p className="text-lg text-muted-foreground">جاري تحميل طلبات النشاط التسويقي...</p>
              </div>
            ) : marketingRequests.length === 0 ? (
              <div className="text-center py-8">
                <TrendingUp className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-lg font-medium text-muted-foreground">لا توجد طلبات نشاط تسويقي</p>
                <p className="text-sm text-muted-foreground">لم يتم العثور على أي طلبات بالفلاتر المحددة</p>
              </div>
            ) : (
              <div className="space-y-4">
                {marketingRequests.map((request) => (
                  <Card key={request._id} className="border-l-4 border-l-orange-500">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 flex-1">
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">نوع النشاط</p>
                            <p className="font-semibold">{request.activityType?.name || 'غير محدد'}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">الطبيب</p>
                            <p className="font-semibold">{request.doctor.drName}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">المندوب</p>
                            <p className="font-semibold">{`${request.createdBy.firstName} ${request.createdBy.lastName}`}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">الحالة</p>
                            {getMarketingStatusBadge(request.status)}
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">تاريخ النشاط</p>
                          <p className="font-semibold">{formatDate(request.activityDate)}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">التكلفة</p>
                          <p className="font-semibold">{request.cost} ريال</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">التخصص</p>
                          <p className="font-semibold">{request.doctor.specialty || 'غير محدد'}</p>
                        </div>
                      </div>
                      
                      {request.notes && (
                        <div className="mt-4">
                          <p className="text-sm font-medium text-muted-foreground">الملاحظات</p>
                          <p className="text-sm bg-muted p-2 rounded">{request.notes}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Marketing Pagination */}
        {marketingPagination.totalPages > 1 && (
          <div className="flex items-center justify-between mt-6">
            <p className="text-sm text-muted-foreground">
              عرض {((marketingPagination.currentPage - 1) * marketingFilters.limit) + 1} إلى {Math.min(marketingPagination.currentPage * marketingFilters.limit, marketingPagination.totalRequests)} من {marketingPagination.totalRequests} طلب
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleMarketingPageChange(marketingPagination.currentPage - 1)}
                disabled={!marketingPagination.hasPrev || marketingLoading}
              >
                السابق
              </Button>
              <span className="flex items-center px-3 py-1 text-sm">
                {marketingPagination.currentPage} من {marketingPagination.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleMarketingPageChange(marketingPagination.currentPage + 1)}
                disabled={!marketingPagination.hasNext || marketingLoading}
              >
                التالي
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SupervisorSampleRequests;