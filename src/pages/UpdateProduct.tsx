import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { ArrowRight, Save, X } from 'lucide-react';
import { updateProduct, getProducts } from '@/api/Products';
import toast from 'react-hot-toast';

interface Product {
  CODE: string;
  PRODUCT: string;
  PRODUCT_TYPE: string;
  BRAND: string;
  COMPANY: string;
  TEAM: string;
}

const UpdateProduct = () => {
  const navigate = useNavigate();
  const { code } = useParams<{ code: string }>();
  const [loading, setLoading] = useState(false);
  const [loadingProduct, setLoadingProduct] = useState(true);
  const [formData, setFormData] = useState<Product>({
    CODE: '',
    PRODUCT: '',
    PRODUCT_TYPE: '',
    BRAND: '',
    COMPANY: '',
    TEAM: ''
  });

  useEffect(() => {
    const loadProduct = async () => {
      if (!code) {
        toast.error('كود المنتج غير موجود');
        navigate('/management/data/products');
        return;
      }

      try {
        const response = await getProducts();
        if (response.success) {
          const product = response.data.find((p: Product) => p.CODE === code);
          if (product) {
            setFormData({
              CODE: product.CODE || '',
              PRODUCT: product.PRODUCT || '',
              PRODUCT_TYPE: product.PRODUCT_TYPE || '',
              BRAND: product.BRAND || '',
              COMPANY: product.COMPANY || '',
              TEAM: product.TEAM || ''
            });
          } else {
            toast.error('المنتج غير موجود');
            navigate('/management/data/products');
          }
        } else {
          toast.error('فشل في تحميل بيانات المنتج');
        }
      } catch (error) {
        toast.error('حدث خطأ في تحميل بيانات المنتج');
      } finally {
        setLoadingProduct(false);
      }
    };

    loadProduct();
  }, [code, navigate]);

  const handleInputChange = (field: keyof Product, value: string | number | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.CODE || !formData.PRODUCT) {
      toast.error('يرجى ملء الحقول المطلوبة');
      return;
    }

    setLoading(true);
    const loadingToastId = toast.loading('جاري تحديث المنتج...');

    try {
      const result = await updateProduct(code!, formData);
      
      if (result.success) {
        toast.success('تم تحديث المنتج بنجاح', { id: loadingToastId });
        setTimeout(() => {
          navigate('/management/data/products');
        }, 1000);
      } else {
        toast.error(result.error || 'فشل في تحديث المنتج', { id: loadingToastId });
      }
    } catch (error) {
      toast.error('حدث خطأ غير متوقع', { id: loadingToastId });
    } finally {
      setLoading(false);
    }
  };

  if (loadingProduct) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">جاري تحميل بيانات المنتج...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/management">إدارة البيانات</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator>
            <ArrowRight className="h-4 w-4" />
          </BreadcrumbSeparator>
          <BreadcrumbItem>
            <BreadcrumbLink href="/management/data/products">إدارة المنتجات</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator>
            <ArrowRight className="h-4 w-4" />
          </BreadcrumbSeparator>
          <BreadcrumbItem>
            <BreadcrumbPage>تحديث المنتج</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">تحديث المنتج</h1>
        <Button 
          variant="outline" 
          onClick={() => navigate('/management/data/products')}
          className="flex items-center gap-2"
        >
          <X className="h-4 w-4" />
          إلغاء
        </Button>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>معلومات المنتج</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="code">كود المنتج *</Label>
                <Input
                  id="code"
                  value={formData.CODE}
                  onChange={(e) => handleInputChange('CODE', e.target.value)}
                  placeholder="أدخل كود المنتج"
                  required
                  disabled
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="product">اسم المنتج *</Label>
                <Input
                  id="product"
                  value={formData.PRODUCT}
                  onChange={(e) => handleInputChange('PRODUCT', e.target.value)}
                  placeholder="أدخل اسم المنتج"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="product_type">النوع</Label>
                <Input
                  id="product_type"
                  value={formData.PRODUCT_TYPE}
                  onChange={(e) => handleInputChange('PRODUCT_TYPE', e.target.value)}
                  placeholder="أدخل نوع المنتج"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="brand">العلامة التجارية</Label>
                <Input
                  id="brand"
                  value={formData.BRAND}
                  onChange={(e) => handleInputChange('BRAND', e.target.value)}
                  placeholder="أدخل العلامة التجارية"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="company">الشركة</Label>
                <Input
                  id="company"
                  value={formData.COMPANY}
                  onChange={(e) => handleInputChange('COMPANY', e.target.value)}
                  placeholder="أدخل اسم الشركة"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="team">الفريق</Label>
                <Input
                  id="team"
                  value={formData.TEAM}
                  onChange={(e) => handleInputChange('TEAM', e.target.value)}
                  placeholder="أدخل اسم الفريق"
                />
              </div>
            </div>

            <div className="flex justify-end gap-4 pt-6">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => navigate('/management/data/products')}
                disabled={loading}
              >
                إلغاء
              </Button>
              <Button type="submit" disabled={loading} className="flex items-center gap-2">
                <Save className="h-4 w-4" />
                {loading ? 'جاري التحديث...' : 'تحديث المنتج'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
};

export default UpdateProduct;