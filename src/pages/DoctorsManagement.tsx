import React, { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { 
  Upload, 
  Download, 
  UserCheck, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  X,
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Stethoscope,
  GraduationCap
} from 'lucide-react';
import * as XLSX from 'xlsx';

interface UploadState {
  isUploading: boolean;
  progress: number;
  isDragOver: boolean;
  uploadedFile: File | null;
  isProcessed: boolean;
}

const DoctorsManagement: React.FC = () => {
  const [uploadState, setUploadState] = useState<UploadState>({
    isUploading: false,
    progress: 0,
    isDragOver: false,
    uploadedFile: null,
    isProcessed: false
  });
  
  const [searchTerm, setSearchTerm] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const fields = ['كود الطبيب', 'اسم الطبيب', 'التخصص', 'رقم الهاتف', 'العيادة/المستشفى', 'سنوات الخبرة'];
  const sampleData = ['DR001', 'د. أحمد محمد', 'طب باطني', '0123456789', 'مستشفى النور', '15'];

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setUploadState(prev => ({ ...prev, isDragOver: true }));
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setUploadState(prev => ({ ...prev, isDragOver: false }));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setUploadState(prev => ({ ...prev, isDragOver: false }));
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleFileUpload = (file: File) => {
    if (!file) return;

    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'text/csv'
    ];

    if (!allowedTypes.includes(file.type)) {
      toast({
        title: 'نوع ملف غير مدعوم',
        description: 'يرجى رفع ملف Excel أو CSV فقط',
        variant: 'destructive'
      });
      return;
    }

    setUploadState(prev => ({ 
      ...prev, 
      isUploading: true, 
      progress: 0, 
      uploadedFile: file,
      isProcessed: false 
    }));

    // محاكاة عملية الرفع
    const interval = setInterval(() => {
      setUploadState(prev => {
        const newProgress = prev.progress + 10;
        if (newProgress >= 100) {
          clearInterval(interval);
          return { 
            ...prev, 
            progress: 100, 
            isUploading: false, 
            isProcessed: true 
          };
        }
        return { ...prev, progress: newProgress };
      });
    }, 200);

    toast({
      title: 'تم رفع الملف بنجاح',
      description: `تم رفع ملف ${file.name} وجاري معالجته`,
    });
  };

  const downloadTemplate = () => {
    const wsData = [fields, sampleData];
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'قالب الأطباء');
    XLSX.writeFile(wb, 'قالب_الأطباء.xlsx', { compression: true });
    
    toast({
      title: 'تم تحميل القالب',
      description: 'تم تحميل قالب الأطباء بنجاح',
    });
  };

  const resetUpload = () => {
    setUploadState({
      isUploading: false,
      progress: 0,
      isDragOver: false,
      uploadedFile: null,
      isProcessed: false
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl shadow-lg">
              <UserCheck className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              إدارة الأطباء
            </h1>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            قم برفع وإدارة بيانات الأطباء والمختصين الطبيين بسهولة من خلال ملفات Excel أو CSV
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">إجمالي الأطباء</p>
                  <p className="text-3xl font-bold">2,847</p>
                </div>
                <UserCheck className="h-8 w-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-indigo-100 text-sm font-medium">الأطباء النشطين</p>
                  <p className="text-3xl font-bold">2,654</p>
                </div>
                <Stethoscope className="h-8 w-8 text-indigo-200" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">التخصصات</p>
                  <p className="text-3xl font-bold">45</p>
                </div>
                <GraduationCap className="h-8 w-8 text-purple-200" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-r from-violet-500 to-violet-600 text-white border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-violet-100 text-sm font-medium">الملفات المرفوعة</p>
                  <p className="text-3xl font-bold">23</p>
                </div>
                <FileText className="h-8 w-8 text-violet-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Upload Section */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Upload className="h-5 w-5 text-blue-600" />
                  رفع ملف الأطباء
                </CardTitle>
                <CardDescription>
                  اسحب وأفلت ملف Excel أو CSV هنا، أو انقر للاختيار
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div
                  className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${
                    uploadState.isDragOver
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50/50'
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                    className="hidden"
                  />
                  
                  {uploadState.uploadedFile ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-center gap-2">
                        <FileText className="h-8 w-8 text-blue-600" />
                        <span className="font-medium text-gray-700">{uploadState.uploadedFile.name}</span>
                        {uploadState.isProcessed && (
                          <CheckCircle2 className="h-5 w-5 text-green-600" />
                        )}
                      </div>
                      
                      {uploadState.isUploading && (
                        <div className="space-y-2">
                          <Progress value={uploadState.progress} className="w-full" />
                          <p className="text-sm text-gray-600">{uploadState.progress}% مكتمل</p>
                        </div>
                      )}
                      
                      {uploadState.isProcessed && (
                        <div className="flex gap-2 justify-center">
                          <Badge variant="secondary" className="bg-green-100 text-green-800">
                            تم المعالجة بنجاح
                          </Badge>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={resetUpload}
                            className="h-6"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                        <Upload className="h-8 w-8 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-lg font-medium text-gray-700">اسحب الملف هنا</p>
                        <p className="text-sm text-gray-500">أو انقر للاختيار من جهازك</p>
                      </div>
                      <p className="text-xs text-gray-400">يدعم ملفات: Excel (.xlsx, .xls) و CSV</p>
                    </div>
                  )}
                </div>

                <div className="flex gap-3">
                  <Button onClick={downloadTemplate} variant="outline" className="flex-1">
                    <Download className="h-4 w-4 mr-2" />
                    تحميل القالب
                  </Button>
                  <Button className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700">
                    <Plus className="h-4 w-4 mr-2" />
                    إضافة طبيب جديد
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Search and Filter */}
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-5 w-5 text-blue-600" />
                  البحث والتصفية
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-3">
                  <div className="flex-1">
                    <Input
                      placeholder="البحث في الأطباء..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full"
                    />
                  </div>
                  <Button variant="outline">
                    <Filter className="h-4 w-4 mr-2" />
                    تصفية
                  </Button>
                  <Button variant="outline">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Info Section */}
          <div className="space-y-6">
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg">الحقول المطلوبة</CardTitle>
                <CardDescription>
                  تأكد من وجود هذه الحقول في ملف Excel
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {fields.map((field, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                      <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-xs font-medium text-blue-600">
                        {index + 1}
                      </div>
                      <span className="text-sm font-medium">{field}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-xl border-0 bg-gradient-to-br from-blue-50 to-indigo-50">
              <CardHeader>
                <CardTitle className="text-lg text-blue-800">مثال على البيانات</CardTitle>
                <CardDescription className="text-blue-600">
                  نموذج لكيفية تنسيق البيانات
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {fields.map((field, index) => (
                    <div key={index} className="flex justify-between items-center py-1">
                      <span className="text-sm font-medium text-blue-700">{field}:</span>
                      <span className="text-sm text-blue-600 bg-white px-2 py-1 rounded">
                        {sampleData[index]}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-xl border-0 bg-gradient-to-br from-indigo-50 to-purple-50">
              <CardHeader>
                <CardTitle className="text-lg text-indigo-800">نصائح مهمة</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-indigo-700">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 mt-0.5 text-indigo-600" />
                    تأكد من صحة التخصص الطبي
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 mt-0.5 text-indigo-600" />
                    اكتب سنوات الخبرة بالأرقام
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 mt-0.5 text-indigo-600" />
                    تحقق من صحة أرقام الهواتف
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorsManagement;