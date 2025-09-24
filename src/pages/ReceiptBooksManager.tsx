import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, Search, Filter, BookOpen, Calendar, Hash, CheckCircle, XCircle, TrendingUp, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';

// أنواع البيانات
interface ReceiptBook {
  id: string;
  bookNumber: string;
  startReceiptNumber: number;
  endReceiptNumber: number;
  totalReceipts: number;
  status: 'active' | 'used' | 'cancelled';
  createdAt: string;
  createdBy: string;
  usedReceipts?: number;
  notes?: string;
}

interface CreateReceiptBookForm {
  bookNumber: string;
  startReceiptNumber: number;
  endReceiptNumber: number;
  notes: string;
}

const ReceiptBooksManager = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [books, setBooks] = useState<ReceiptBook[]>([

  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'used' | 'cancelled'>('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState<ReceiptBook | null>(null);
  const [formData, setFormData] = useState<CreateReceiptBookForm>({
    bookNumber: '',
    startReceiptNumber: 0,
    endReceiptNumber: 0,
    notes: ''
  });
  const [loading, setLoading] = useState(false);

  // تصفية الدفاتر حسب البحث والحالة
  const filteredBooks = books.filter(book => {
    const matchesSearch = book.bookNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         book.notes?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || book.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // إنشاء رقم دفتر تلقائي
  const generateBookNumber = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const count = books.length + 1;
    return `BK-${year}-${month}-${String(count).padStart(3, '0')}`;
  };

  // فتح نموذج الإنشاء
  const handleCreateNew = () => {
    setFormData({
      bookNumber: generateBookNumber(),
      startReceiptNumber: 0,
      endReceiptNumber: 0,
      notes: ''
    });
    setIsCreateDialogOpen(true);
  };

  // فتح نموذج التعديل
  const handleEdit = (book: ReceiptBook) => {
    setSelectedBook(book);
    setFormData({
      bookNumber: book.bookNumber,
      startReceiptNumber: book.startReceiptNumber,
      endReceiptNumber: book.endReceiptNumber,
      notes: book.notes || ''
    });
    setIsEditDialogOpen(true);
  };

  // إنشاء دفتر جديد
  const handleCreate = async () => {
    if (formData.startReceiptNumber >= formData.endReceiptNumber) {
      toast({
        title: "خطأ في المدخلات",
        description: "رقم بداية الوصل يجب أن يكون أقل من رقم نهاية الوصل",
        variant: "destructive"
      });
      return;
    }

    if (formData.startReceiptNumber <= 0 || formData.endReceiptNumber <= 0) {
      toast({
        title: "خطأ في المدخلات",
        description: "يجب أن تكون أرقام الوصولات أكبر من الصفر",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      // محاكاة API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newBook: ReceiptBook = {
        id: String(Date.now()),
        bookNumber: formData.bookNumber,
        startReceiptNumber: formData.startReceiptNumber,
        endReceiptNumber: formData.endReceiptNumber,
        totalReceipts: formData.endReceiptNumber - formData.startReceiptNumber + 1,
        status: 'active',
        createdAt: new Date().toISOString().split('T')[0],
        createdBy: 'المستخدم الحالي',
        usedReceipts: 0,
        notes: formData.notes
      };

      setBooks(prev => [newBook, ...prev]);
      setIsCreateDialogOpen(false);
      setFormData({ bookNumber: '', startReceiptNumber: 0, endReceiptNumber: 0, notes: '' });
      
      toast({
        title: "تم بنجاح ✅",
        description: "تم إنشاء دفتر الوصولات الجديد بنجاح"
      });
    } catch (error) {
      toast({
        title: "خطأ",
        description: "فشل في إنشاء دفتر الوصولات",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // تحديث دفتر
  const handleUpdate = async () => {
    if (!selectedBook) return;

    if (formData.startReceiptNumber >= formData.endReceiptNumber) {
      toast({
        title: "خطأ في المدخلات",
        description: "رقم بداية الوصل يجب أن يكون أقل من رقم نهاية الوصل",
        variant: "destructive"
      });
      return;
    }

    if (formData.startReceiptNumber <= 0 || formData.endReceiptNumber <= 0) {
      toast({
        title: "خطأ في المدخلات",
        description: "يجب أن تكون أرقام الوصولات أكبر من الصفر",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      // محاكاة API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const updatedBooks = books.map(book =>
        book.id === selectedBook.id
          ? {
              ...book,
              bookNumber: formData.bookNumber,
              startReceiptNumber: formData.startReceiptNumber,
              endReceiptNumber: formData.endReceiptNumber,
              totalReceipts: formData.endReceiptNumber - formData.startReceiptNumber + 1,
              notes: formData.notes
            }
          : book
      );

      setBooks(updatedBooks);
      setIsEditDialogOpen(false);
      setSelectedBook(null);
      
      toast({
        title: "تم بنجاح ✅",
        description: "تم تحديث دفتر الوصولات بنجاح"
      });
    } catch (error) {
      toast({
        title: "خطأ",
        description: "فشل في تحديث دفتر الوصولات",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // حذف دفتر
  const handleDelete = async (book: ReceiptBook) => {
    if (!confirm(`هل أنت متأكد من حذف دفتر الوصولات ${book.bookNumber}؟`)) return;

    setLoading(true);
    try {
      // محاكاة API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const updatedBooks = books.filter(b => b.id !== book.id);
      setBooks(updatedBooks);
      
      toast({
        title: "تم بنجاح ✅",
        description: "تم حذف دفتر الوصولات بنجاح"
      });
    } catch (error) {
      toast({
        title: "خطأ",
        description: "فشل في حذف دفتر الوصولات",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // الحصول على لون الحالة
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100"><CheckCircle className="w-3 h-3 mr-1" />نشط</Badge>;
      case 'used':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800">مكتمل</Badge>;
      case 'cancelled':
        return <Badge variant="destructive" className="bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1" />ملغى</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  // تنسيق التاريخ
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd/MM/yyyy', { locale: ar });
  };

  // حساب النسبة المئوية للاستخدام
  const getUsagePercentage = (book: ReceiptBook) => {
    if (!book.usedReceipts) return 0;
    return Math.round((book.usedReceipts / book.totalReceipts) * 100);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <BookOpen className="w-8 h-8 text-primary" />
            دفتر الوصولات
          </h1>
          <p className="text-muted-foreground mt-1">إدارة دفاتر أرقام الوصولات وتتبع استخدامها</p>
        </div>
        <Button onClick={handleCreateNew} className="gap-2">
          <Plus className="w-4 h-4" />
          إنشاء دفتر جديد
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-r from-blue-50 to-blue-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الدفاتر</CardTitle>
            <BookOpen className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{books.length}</div>
            <p className="text-xs text-blue-600">دفتر</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-green-50 to-green-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">الدفاتر النشطة</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {books.filter(b => b.status === 'active').length}
            </div>
            <p className="text-xs text-green-600">دفتر نشط</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-orange-50 to-orange-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الوصولات</CardTitle>
            <Hash className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {books.reduce((sum, book) => sum + book.totalReceipts, 0)}
            </div>
            <p className="text-xs text-orange-600">وصول</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-red-200 to-red-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">الوصولات الخاطئه</CardTitle>
            <TrendingUp className="h-4 w-4 text-red-900" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {books.length > 0 ? Math.round(books.reduce((sum, book) => sum + getUsagePercentage(book), 0) / books.length) : 0}%
            </div>
            <p className="text-xs text-purple-600">نسبة الاستخدام</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            البحث والتصفية
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="search">بحث</Label>
              <div className="relative">
                <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="ابحث برقم الدفتر أو الملاحظات..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-10"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="status">حالة الدفتر</Label>
              <select
                id="status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              >
                <option value="all">جميع الحالات</option>
                <option value="active">نشط</option>
                <option value="used">مكتمل</option>
                <option value="cancelled">ملغى</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Books Table */}
      <Card>
        <CardHeader>
          <CardTitle>قائمة دفاتر الوصولات</CardTitle>
          <CardDescription>
            عرض جميع دفاتر الوصولات مع إمكانية الإدارة والتعديل
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>رقم الدفتر</TableHead>
                  <TableHead>أرقام الوصولات</TableHead>
                  <TableHead>إجمالي الوصولات</TableHead>
                  <TableHead>المستخدم</TableHead>
                  <TableHead>حالة الاستخدام</TableHead>
                  <TableHead>تاريخ الإنشاء</TableHead>
                  <TableHead>الحالة</TableHead>
                  <TableHead>الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBooks.map((book) => (
                  <TableRow key={book.id} className="hover:bg-muted/50">
                    <TableCell>
                      <div className="font-medium text-primary">{book.bookNumber}</div>
                      {book.notes && (
                        <div className="text-sm text-muted-foreground">{book.notes}</div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="font-mono text-sm">
                        {book.startReceiptNumber} - {book.endReceiptNumber}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-mono">
                        {book.totalReceipts} وصل
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{book.createdBy}</div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>مستخدم</span>
                          <span>{book.usedReceipts || 0}/{book.totalReceipts}</span>
                        </div>
                        <div className="w-full bg-secondary rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              getUsagePercentage(book) < 50 ? 'bg-green-500' :
                              getUsagePercentage(book) < 80 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${getUsagePercentage(book)}%` }}
                          />
                        </div>
                        <div className="text-xs text-muted-foreground text-center">
                          {getUsagePercentage(book)}%
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <Calendar className="w-3 h-3" />
                        {formatDate(book.createdAt)}
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(book.status)}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                            <Button
      variant="outline"
      size="sm"
      onClick={() => navigate(`/receipt-books/${book.id}`)}
      className="gap-1"
    >
      <Eye className="w-3 h-3" />
      التفاصيل
    </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(book)}
                          disabled={book.status === 'used'}
                        >
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(book)}
                          disabled={book.status === 'used'}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            
            {filteredBooks.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                {searchTerm || statusFilter !== 'all' ? 'لا توجد نتائج مطابقة للبحث' : 'لا توجد دفاتر متاحة'}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Create Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5 text-primary" />
              إنشاء دفتر وصلات جديد
            </DialogTitle>
            <DialogDescription>
              أدخل معلومات دفتر الوصلات الجديد
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="bookNumber">رقم الدفتر</Label>
              <Input
                id="bookNumber"
                value={formData.bookNumber}
                onChange={(e) => setFormData(prev => ({ ...prev, bookNumber: e.target.value }))}
                placeholder="رقم الدفتر"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startReceiptNumber">رقم بداية الوصل</Label>
                <Input
                  id="startReceiptNumber"
                  type="number"
                  min="1"
                  value={formData.startReceiptNumber || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, startReceiptNumber: parseInt(e.target.value) || 0 }))}
                  placeholder="1001"
                />
              </div>
              
              <div>
                <Label htmlFor="endReceiptNumber">رقم نهاية الوصل</Label>
                <Input
                  id="endReceiptNumber"
                  type="number"
                  min="1"
                  value={formData.endReceiptNumber || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, endReceiptNumber: parseInt(e.target.value) || 0 }))}
                  placeholder="1100"
                />
              </div>
            </div>
            
            {formData.startReceiptNumber > 0 && formData.endReceiptNumber > 0 && (
              <div className="p-3 bg-muted rounded-lg">
                <div className="text-sm text-center">
                  إجمالي عدد الوصلات: <strong>{formData.endReceiptNumber - formData.startReceiptNumber + 1}</strong>
                </div>
              </div>
            )}
            
            <div>
              <Label htmlFor="notes">ملاحظات (اختياري)</Label>
              <Input
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="ملاحظات حول الدفتر..."
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              إلغاء
            </Button>
            <Button onClick={handleCreate} disabled={loading}>
              {loading ? 'جاري الإنشاء...' : 'إنشاء الدفتر'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="w-5 h-5 text-primary" />
              تعديل دفتر الوصلات
            </DialogTitle>
            <DialogDescription>
              تعديل معلومات دفتر الوصلات المحدد
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="editBookNumber">رقم الدفتر</Label>
              <Input
                id="editBookNumber"
                value={formData.bookNumber}
                onChange={(e) => setFormData(prev => ({ ...prev, bookNumber: e.target.value }))}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="editStartReceiptNumber">رقم بداية الوصل</Label>
                <Input
                  id="editStartReceiptNumber"
                  type="number"
                  min="1"
                  value={formData.startReceiptNumber || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, startReceiptNumber: parseInt(e.target.value) || 0 }))}
                />
              </div>
              
              <div>
                <Label htmlFor="editEndReceiptNumber">رقم نهاية الوصل</Label>
                <Input
                  id="editEndReceiptNumber"
                  type="number"
                  min="1"
                  value={formData.endReceiptNumber || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, endReceiptNumber: parseInt(e.target.value) || 0 }))}
                />
              </div>
            </div>
            
            {formData.startReceiptNumber > 0 && formData.endReceiptNumber > 0 && (
              <div className="p-3 bg-muted rounded-lg">
                <div className="text-sm text-center">
                  إجمالي عدد الوصلات: <strong>{formData.endReceiptNumber - formData.startReceiptNumber + 1}</strong>
                </div>
              </div>
            )}
            
            <div>
              <Label htmlFor="editNotes">ملاحظات</Label>
              <Input
                id="editNotes"
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              إلغاء
            </Button>
            <Button onClick={handleUpdate} disabled={loading}>
              {loading ? 'جاري التحديث...' : 'تحديث الدفتر'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ReceiptBooksManager;