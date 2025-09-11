import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DatePicker, { registerLocale } from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { ar } from 'date-fns/locale';

// Register Arabic locale
registerLocale('ar', ar);
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowRight, Calendar, TrendingUp, User, FileText, DollarSign, Activity } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { useMedicalRepStore } from "@/stores/medicalRepStore";
import { MedicalRepDoctor } from "@/api/MedicalRep";
import { createMarketingActivityRequest, MarketingActivityRequest, getAllMarketingActivities } from "@/api/MarketingActivities";
import toast from "react-hot-toast";

interface MarketingRequestData {
  requestDate: string;
  activityDate: string;
  activityType: string;
  doctorId: string;
  cost: number;
  notes: string;
}

export default function MarketingRequestForm() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { doctors } = useMedicalRepStore();
  const [isLoading, setIsLoading] = useState(false);

  
  const [formData, setFormData] = useState<MarketingRequestData>({
    requestDate: new Date().toISOString().split('T')[0],
    activityDate: '',
    activityType: '',
    doctorId: '',
    cost: 0,
    notes: ''
  });
  
  const [selectedActivityDate, setSelectedActivityDate] = useState<Date | null>(null);
  const [marketingActivities, setMarketingActivities] = useState<any[]>([]);
  const [activitiesLoading, setActivitiesLoading] = useState(false);

  // جلب الأنشطة التسويقية من API
  const fetchMarketingActivities = async () => {
    try {
      setActivitiesLoading(true);
      const response = await getAllMarketingActivities();
      
      if (response.success && response.data?.activities) {
        setMarketingActivities(response.data.activities);
      } else {
        setMarketingActivities([]);
        toast.error('لم يتم العثور على أنشطة تسويقية');
      }
    } catch (error: any) {
      console.error('Error fetching marketing activities:', error);
      setMarketingActivities([]);
      toast.error('حدث خطأ أثناء جلب الأنشطة التسويقية');
    } finally {
      setActivitiesLoading(false);
    }
  };



  useEffect(() => {
    if (doctors.length === 0) {
      toast.error("يرجى زيارة صفحة 'بياناتي' أولاً لتحميل بيانات الأطباء");
    }
    fetchMarketingActivities();
  }, [doctors.length]);

  const handleInputChange = (field: keyof MarketingRequestData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if data is loaded
    if (doctors.length === 0) {
      toast.error("يرجى زيارة صفحة 'بياناتي' أولاً لتحميل بيانات الأطباء");
      return;
    }


    
    if (!formData.activityDate || !formData.activityType || !formData.doctorId || formData.cost <= 0) {
      toast.error('يرجى ملء جميع الحقول المطلوبة بشكل صحيح');
      return;
    }

    if (marketingActivities.length === 0) {
      toast.error('لا توجد أنشطة تسويقية متاحة. يرجى المحاولة لاحقاً');
      return;
    }

    if (formData.activityDate.trim() === '' || formData.activityType.trim() === '' || formData.doctorId.trim() === '') {
      toast.error('يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    if (new Date(formData.activityDate) < new Date(formData.requestDate)) {
      toast.error('تاريخ النشاط لا يمكن أن يكون قبل تاريخ الطلب');
      return;
    }

    setIsLoading(true);
    
    try {
      const requestData: MarketingActivityRequest = {
        activityDate: formData.activityDate,
        activityType: formData.activityType,
        doctor: formData.doctorId,
        cost: formData.cost,
        notes: formData.notes
      };

      const result = await createMarketingActivityRequest(requestData);
      
      if (result.success) {
        toast.success('تم إرسال طلب النشاط التسويقي بنجاح! سيتم مراجعته قريباً');
        // إعادة تعيين النموذج
        setFormData({
          requestDate: new Date().toISOString().split('T')[0],
          activityDate: '',
          activityType: '',
          doctorId: '',
          cost: 0,
          notes: ''
        });
        setSelectedActivityDate(null);
        navigate('/dashboard'); // Navigate to dashboard
      } else {
        toast.error(result.message || 'حدث خطأ أثناء إرسال الطلب');
      }
    } catch (error: any) {
      console.error('Error submitting marketing request:', error);
      toast.error('حدث خطأ أثناء إرسال الطلب. يرجى المحاولة مرة أخرى');
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading state if no data
  if (doctors.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground mb-4">جاري تحميل البيانات...</p>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
            <p className="text-sm text-yellow-800 mb-3">لا يمكن إنشاء طلب تسويقي بدون تحميل بيانات الأطباء أولاً</p>
            <Button 
              onClick={() => navigate('/my-data')}
              className="w-full"
              variant="outline"
            >
              انتقل إلى صفحة بياناتي
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">بعد تحميل البيانات، يمكنك العودة لإنشاء الطلب التسويقي</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <TrendingUp className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">نموذج طلب تسويقي</h1>
        </div>
        <p className="text-muted-foreground">قم بملء البيانات المطلوبة لطلب النشاط التسويقي</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            بيانات الطلب التسويقي
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Request Date */}
              <div className="space-y-2">
                <Label htmlFor="requestDate" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  تاريخ الطلب
                </Label>
                <Input
                  id="requestDate"
                  type="date"
                  value={formData.requestDate}
                  disabled
                  className="bg-muted"
                />
              </div>

              {/* Activity Date */}
              <div className="space-y-2">
                <Label htmlFor="activityDate" className="flex items-center gap-2 justify-end">
                   <span>تاريخ النشاط *</span>
                   <Calendar className="h-4 w-4" />
                 </Label>
                <div className="relative">
                  <DatePicker
                    selected={selectedActivityDate}
                    onChange={(date) => {
                      setSelectedActivityDate(date);
                      handleInputChange('activityDate', date ? date.toISOString().split('T')[0] : '');
                    }}
                    dateFormat="yyyy-MM-dd"
                    placeholderText="اختر تاريخ النشاط"
                    minDate={new Date()}
                    className="w-full text-right pr-10 pl-4 py-2 bg-background border-2 border-primary/20 hover:border-primary focus:border-primary transition-all duration-200 rounded-lg shadow-sm focus:shadow-md focus:ring-2 focus:ring-primary/20 outline-none"
                    calendarClassName="custom-datepicker"
                    popperClassName="z-50"
                    showPopperArrow={false}
                    locale="ar"
                  />
                  <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-primary pointer-events-none" />
                </div>
              </div>

              {/* Activity Type */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  نوع النشاط *
                </Label>
                <Select
                  value={formData.activityType}
                  onValueChange={(value) => handleInputChange('activityType', value)}
                  disabled={activitiesLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={activitiesLoading ? "جاري تحميل الأنشطة..." : "اختر نوع النشاط"} />
                  </SelectTrigger>
                  <SelectContent>
                    {marketingActivities.length > 0 ? (
                      marketingActivities
                        .filter(activity => activity.isActive)
                        .map((activity) => (
                          <SelectItem key={activity._id} value={activity._id}>
                            {activity.arabic}
                          </SelectItem>
                        ))
                    ) : (
                      !activitiesLoading && (
                        <SelectItem value="" disabled>
                          لا توجد أنشطة تسويقية متاحة
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* Doctor */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  اسم الطبيب *
                </Label>
                <Select
                  value={formData.doctorId}
                  onValueChange={(value) => handleInputChange('doctorId', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="اختر الطبيب" />
                  </SelectTrigger>
                  <SelectContent>
                    {doctors.map((doctor) => (
                      <SelectItem key={doctor._id} value={doctor._id}>
                        <div className="flex flex-col text-right">
                          <span className="font-medium">{doctor.name}</span>
                          <span className="text-sm text-muted-foreground">
                            {doctor.specialty} - {doctor.organizationName}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Cost */}
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="cost" className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  التكلفة (دينار ليبي) *
                </Label>
                <Input
                  id="cost"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.cost}
                  onChange={(e) => handleInputChange('cost', parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                  required
                />
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">
                ملاحظات
              </Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="أضف أي ملاحظات إضافية حول النشاط التسويقي..."
                rows={4}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-6">
              <Button
                type="submit"
                disabled={isLoading}
                className="flex-1"
              >
                {isLoading ? 'جاري الإرسال...' : 'إرسال الطلب'}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(-1)}
                className="px-8"
              >
                إلغاء
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}