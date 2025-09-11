import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import {
  Search,
  Download,
  Filter,
  Pill,
  MapPin,
  Building2,
  User,
  Calendar,
  FileSpreadsheet,
  Loader2,
  Plus
} from 'lucide-react';
import { getPharmacies, exportPharmacies } from '../api/Pharmacies';
import toast from 'react-hot-toast';

interface Pharmacy {
  _id: string;
  customerSystemDescription: string;
  area: string;
  city: string;
  district: string;
  adminId?: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface PharmaciesResponse {
  success: boolean;
  data: Pharmacy[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

const PharmaciesManagement = () => {
  const navigate = useNavigate();
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10
  });
  
  // Filters
  const [filters, setFilters] = useState({
    search: '',
    area: '',
    city: '',
    district: '',
    page: 1,
    limit: 10
  });

  const fetchPharmacies = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value) {
          params.append(key, value.toString());
        }
      });

      const response = await getPharmacies(params.toString());
      
      if (response.success) {
        setPharmacies(response.data);
        setPagination(response.pagination);
      } else {
        toast.error('فشل في جلب بيانات الصيدليات');
      }
    } catch (error) {
      console.error('Error fetching pharmacies:', error);
      toast.error('حدث خطأ أثناء جلب البيانات');
    } finally {
      setLoading(false);
    }
  };

  const handleExportToExcel = async () => {
    try {
      setExporting(true);
      const params = new URLSearchParams();
      
      // إضافة الفلاتر للتصدير
      if (filters.search) params.append('search', filters.search);
      if (filters.area) params.append('area', filters.area);
      if (filters.city) params.append('city', filters.city);
      if (filters.district) params.append('district', filters.district);

      const response = await exportPharmacies(params.toString());
      
      // إنشاء رابط التحميل
      const blob = new Blob([response], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      const currentDate = new Date().toISOString().split('T')[0];
      link.download = `Pharmacies_Export_${currentDate}.xlsx`;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('تم تصدير البيانات بنجاح!');
    } catch (error) {
      console.error('Error exporting pharmacies:', error);
      toast.error('فشل في تصدير البيانات');
    } finally {
      setExporting(false);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1 // إعادة تعيين الصفحة عند تغيير الفلتر
    }));
  };

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      area: '',
      city: '',
      district: '',
      page: 1,
      limit: 10
    });
  };

  useEffect(() => {
    fetchPharmacies();
  }, [filters]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6" dir="rtl">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full">
              <Pill className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                إدارة الصيدليات
              </h1>
              <p className="text-gray-600">
                إدارة شاملة لبيانات الصيدليات مع إمكانية البحث والفلترة والتصدير
              </p>
            </div>
          </div>
          <Button
             onClick={() => navigate('/management/pharmacies/add')}
             className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white border-0 flex items-center gap-2"
           >
            <Plus className="w-4 h-4" />
            إضافة صيدلية جديدة
          </Button>
        </div>

        {/* Filters Card */}
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-blue-600" />
              البحث والفلترة
            </CardTitle>
            <CardDescription>
              استخدم الفلاتر أدناه للبحث عن الصيدليات المطلوبة
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="search">البحث العام</Label>
                <div className="relative">
                  <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="search"
                    placeholder="ابحث في جميع الحقول..."
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    className="pr-10"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="area">المنطقة</Label>
                <Input
                  id="area"
                  placeholder="فلترة حسب المنطقة"
                  value={filters.area}
                  onChange={(e) => handleFilterChange('area', e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="city">المدينة</Label>
                <Input
                  id="city"
                  placeholder="فلترة حسب المدينة"
                  value={filters.city}
                  onChange={(e) => handleFilterChange('city', e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="district">الحي</Label>
                <Input
                  id="district"
                  placeholder="فلترة حسب الحي"
                  value={filters.district}
                  onChange={(e) => handleFilterChange('district', e.target.value)}
                />
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={clearFilters}
                className="flex items-center gap-2"
              >
                مسح الفلاتر
              </Button>
              
              <Button
                onClick={handleExportToExcel}
                disabled={exporting || loading}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white border-0 flex items-center gap-2"
              >
                {exporting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
                {exporting ? 'جاري التصدير...' : 'تصدير إلى Excel'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results Card */}
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <FileSpreadsheet className="w-5 h-5 text-blue-600" />
                  قائمة الصيدليات
                </CardTitle>
                <CardDescription>
                  إجمالي النتائج: {pagination.totalItems} صيدلية
                </CardDescription>
              </div>
              
              <div className="flex items-center gap-2">
                <Label htmlFor="limit">عدد النتائج:</Label>
                <Select
                  value={filters.limit.toString()}
                  onValueChange={(value) => handleFilterChange('limit', value)}
                >
                  <SelectTrigger className="w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="25">25</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                <span className="mr-2 text-gray-600">جاري تحميل البيانات...</span>
              </div>
            ) : pharmacies.length === 0 ? (
              <Alert>
                <AlertDescription>
                  لا توجد صيدليات مطابقة للفلاتر المحددة
                </AlertDescription>
              </Alert>
            ) : (
              <div className="space-y-4">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-right">#</TableHead>
                        <TableHead className="text-right">وصف النظام</TableHead>
                        <TableHead className="text-right">المنطقة</TableHead>
                        <TableHead className="text-right">المدينة</TableHead>
                        <TableHead className="text-right">الحي</TableHead>
                        <TableHead className="text-right">المسؤول</TableHead>
                        <TableHead className="text-right">تاريخ الإنشاء</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pharmacies.map((pharmacy, index) => (
                        <TableRow key={pharmacy._id}>
                          <TableCell className="font-medium">
                            {(pagination.currentPage - 1) * pagination.itemsPerPage + index + 1}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Pill className="w-4 h-4 text-blue-600" />
                              <span className="font-medium">{pharmacy.customerSystemDescription}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="flex items-center gap-1 w-fit">
                              <MapPin className="w-3 h-3" />
                              {pharmacy.area}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="flex items-center gap-1 w-fit">
                              <Building2 className="w-3 h-3" />
                              {pharmacy.city}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <span className="text-gray-600">{pharmacy.district}</span>
                          </TableCell>
                          <TableCell>
                            {pharmacy.adminId ? (
                              <div className="flex items-center gap-2">
                                <User className="w-4 h-4 text-gray-500" />
                                <div>
                                  <div className="font-medium">
                                    {pharmacy.adminId.firstName} {pharmacy.adminId.lastName}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    {pharmacy.adminId.email}
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <span className="text-gray-400">غير محدد</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-gray-500" />
                              <span className="text-sm">
                                {new Date(pharmacy.createdAt).toLocaleDateString('ar-EG')}
                              </span>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <div className="flex justify-center">
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious
                            onClick={() => handlePageChange(pagination.currentPage - 1)}
                            className={pagination.currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                          />
                        </PaginationItem>
                        
                        {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                          const pageNumber = i + 1;
                          return (
                            <PaginationItem key={pageNumber}>
                              <PaginationLink
                                onClick={() => handlePageChange(pageNumber)}
                                isActive={pagination.currentPage === pageNumber}
                                className="cursor-pointer"
                              >
                                {pageNumber}
                              </PaginationLink>
                            </PaginationItem>
                          );
                        })}
                        
                        {pagination.totalPages > 5 && (
                          <PaginationItem>
                            <PaginationEllipsis />
                          </PaginationItem>
                        )}
                        
                        <PaginationItem>
                          <PaginationNext
                            onClick={() => handlePageChange(pagination.currentPage + 1)}
                            className={pagination.currentPage === pagination.totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PharmaciesManagement;