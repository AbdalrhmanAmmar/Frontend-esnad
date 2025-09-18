import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { ArrowRight, Save, Loader2 } from 'lucide-react';
import { getEmployeeById, updateEmployee, UpdateEmployeeData } from '@/api/Users';
import { Employee } from '@/api/Users';

interface EditEmployeeFormData {
  firstName: string;
  lastName: string;
  username: string;
  role: string;
  teamProducts: string;
  teamArea: string;
  area: string[];
  city: string;
  district: string;
  isActive: boolean;
}

const EditEmployee: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [fetchingEmployee, setFetchingEmployee] = useState(true);
  const [formData, setFormData] = useState<EditEmployeeFormData>({
    firstName: '',
    lastName: '',
    username: '',
    role: '',
    teamProducts: '',
    teamArea: '',
    area: [],
    city: '',
    district: '',
    isActive: true
  });

  const [errors, setErrors] = useState<Partial<EditEmployeeFormData>>({});

  // Fetch employee data on component mount
  useEffect(() => {
    const fetchEmployee = async () => {
      if (!id) {
        navigate('/management/employees');
        return;
      }

      try {
        setFetchingEmployee(true);
        const response = await getEmployeeById(id);
        
        if (response.success && response.data) {
          const employee = response.data;
          setFormData({
            firstName: employee.firstName || '',
            lastName: employee.lastName || '',
            username: employee.username || '',
            role: employee.role || '',
            teamProducts: employee.teamProducts || '',
            teamArea: employee.teamArea || '',
            area: employee.area || [],
            city: employee.city || '',
            district: employee.district || '',
            isActive: employee.isActive ?? true
          });
        }
      } catch (error) {
        console.error('Error fetching employee:', error);
        toast({
          title: 'خطأ',
          description: 'فشل في جلب بيانات الموظف',
          variant: 'destructive'
        });
        navigate('/management/employees');
      } finally {
        setFetchingEmployee(false);
      }
    };

    fetchEmployee();
  }, [id, navigate, toast]);

  const handleInputChange = (field: keyof EditEmployeeFormData, value: string | string[] | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<EditEmployeeFormData> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'الاسم الأول مطلوب';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'الاسم الأخير مطلوب';
    }

    if (!formData.username.trim()) {
      newErrors.username = 'اسم المستخدم مطلوب';
    }

    if (!formData.role) {
      newErrors.role = 'الدور مطلوب';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (!id) {
      toast({
        title: 'خطأ',
        description: 'معرف الموظف غير صحيح',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);

    try {
      const updateData: UpdateEmployeeData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        username: formData.username,
        role: formData.role,
        teamProducts: formData.teamProducts,
        teamArea: formData.teamArea,
        area: formData.area,
        city: formData.city,
        district: formData.district,
        isActive: formData.isActive
      };
      
      const response = await updateEmployee(id, updateData);
      
      if (response.success) {
        toast({
          title: 'تم التحديث بنجاح',
          description: response.message || 'تم تحديث بيانات الموظف بنجاح',
          variant: 'default'
        });
        navigate('/management/employees');
      } else {
        toast({
          title: 'خطأ في التحديث',
          description: response.message || 'فشل في تحديث الموظف',
          variant: 'destructive'
        });
      }
    } catch (error: any) {
      console.error('Error updating employee:', error);
      toast({
        title: 'خطأ',
        description: error.response?.data?.message || 'حدث خطأ أثناء تحديث الموظف',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  if (fetchingEmployee) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex items-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>جاري تحميل بيانات الموظف...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="outline"
          onClick={() => navigate('/management/employees')}
        >
          <ArrowRight className="h-4 w-4 ml-2" />
          العودة إلى قائمة الموظفين
        </Button>
        <div>
          <h1 className="text-2xl font-bold">تعديل الموظف</h1>
          <p className="text-muted-foreground">تعديل بيانات الموظف الحالي</p>
        </div>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>بيانات الموظف</CardTitle>
          <CardDescription>
            قم بتعديل البيانات المطلوبة وانقر على حفظ التغييرات
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">الاسم الأول *</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  className={errors.firstName ? 'border-red-500' : ''}
                />
                {errors.firstName && (
                  <p className="text-sm text-red-500">{errors.firstName}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName">الاسم الأخير *</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  className={errors.lastName ? 'border-red-500' : ''}
                />
                {errors.lastName && (
                  <p className="text-sm text-red-500">{errors.lastName}</p>
                )}
              </div>
            </div>

            {/* Account Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="username">اسم المستخدم *</Label>
                <Input
                  id="username"
                  value={formData.username}
                  onChange={(e) => handleInputChange('username', e.target.value)}
                  className={errors.username ? 'border-red-500' : ''}
                />
                {errors.username && (
                  <p className="text-sm text-red-500">{errors.username}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">الدور *</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value) => handleInputChange('role', value)}
                >
                  <SelectTrigger className={errors.role ? 'border-red-500' : ''}>
                    <SelectValue placeholder="اختر الدور" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ADMIN">مدير</SelectItem>
                    <SelectItem value="SUPERVISOR">مشرف</SelectItem>
                    <SelectItem value="MEDICAL REP">مندوب طبي</SelectItem>
                    <SelectItem value="SALES REP">مندوب مبيعات</SelectItem>
                    <SelectItem value="MANAGER">مدير عام</SelectItem>
                    <SelectItem value="TEAM_LEAD">قائد فريق</SelectItem>
                    <SelectItem value="FINANCE">مالية</SelectItem>
                    <SelectItem value="WAREHOUSE">مخازن</SelectItem>
                  </SelectContent>
                </Select>
                {errors.role && (
                  <p className="text-sm text-red-500">{errors.role}</p>
                )}
              </div>
            </div>

            {/* Team Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="teamProducts">فريق المنتجات</Label>
                <Input
                  id="teamProducts"
                  value={formData.teamProducts}
                  onChange={(e) => handleInputChange('teamProducts', e.target.value)}
                  placeholder="مثال: منتجات القلب والأوعية الدموية"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="teamArea">منطقة الفريق</Label>
                <Input
                  id="teamArea"
                  value={formData.teamArea}
                  onChange={(e) => handleInputChange('teamArea', e.target.value)}
                  placeholder="مثال: القاهرة الكبرى"
                />
              </div>
            </div>

            {/* Location Information */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">المدينة</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  placeholder="مثال: القاهرة"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="district">المنطقة</Label>
                <Input
                  id="district"
                  value={formData.district}
                  onChange={(e) => handleInputChange('district', e.target.value)}
                  placeholder="مثال: المعادي"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="isActive">حالة الحساب</Label>
                <Select
                  value={formData.isActive.toString()}
                  onValueChange={(value) => handleInputChange('isActive', value === 'true')}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">نشط</SelectItem>
                    <SelectItem value="false">غير نشط</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Areas */}
            <div className="space-y-2">
              <Label htmlFor="area">المناطق المسؤول عنها</Label>
              <Textarea
                id="area"
                value={formData.area.join(', ')}
                onChange={(e) => {
                  const areas = e.target.value.split(',').map(area => area.trim()).filter(area => area);
                  handleInputChange('area', areas);
                }}
                placeholder="أدخل المناطق مفصولة بفاصلة، مثال: المعادي, حلوان, المقطم"
                rows={3}
              />
              <p className="text-sm text-muted-foreground">
                أدخل المناطق مفصولة بفاصلة
              </p>
            </div>

            {/* Submit Button */}
            <div className="flex gap-4">
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                    جاري الحفظ...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 ml-2" />
                    حفظ التغييرات
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/employees-management')}
                disabled={loading}
              >
                إلغاء
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default EditEmployee;