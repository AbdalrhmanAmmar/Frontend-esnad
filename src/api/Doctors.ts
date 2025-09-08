// lib/api/doctors.ts
import api from './api';
import { useAuthStore } from '@/stores/authStore';

const DOCTORS_IMPORT_PATH = "/doctors/import";

export type GetDoctorsParams = {
  page?: number;
  limit?: number;
  city?: string;
  specialty?: string;
  brand?: string;
  search?: string;
};

// Import doctors file using axios
export const importDoctorsFile = async (file: File) => {
  try {
    // الحصول على معرف المستخدم المسجل
    const { user } = useAuthStore.getState();
    
    const formData = new FormData();
    formData.append('file', file);
    if (user?._id) {
      formData.append('adminId', user._id);
    }

    const response = await api.post(DOCTORS_IMPORT_PATH, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    const result = response.data;
    console.log('Import doctors response:', result);

    if (result.success) {
      return {
        success: true,
        message: `تم رفع ملف الأطباء بنجاح. تم إدراج/تحديث ${result.insertedOrUpserted || 0} طبيب، وتحديث ${result.updated || 0} طبيب، وتجاهل ${result.skipped || 0} سجل.`
      };
    } else {
      return { success: false, message: result.message || 'فشل في رفع ملف الأطباء' };
    }
  } catch (error: any) {
    console.error('Error importing doctors file:', error);
    const errorMessage = error.response?.data?.message || 'حدث خطأ أثناء رفع ملف الأطباء';
    return { success: false, message: errorMessage };
  }
};

// Get doctors using axios
export async function getDoctors(params: GetDoctorsParams = {}) {
  try {
    const response = await api.get('/doctors', {
      params: {
        page: params.page,
        limit: params.limit,
        city: params.city,
        specialty: params.specialty,
        brand: params.brand,
        search: params.search,
      }
    });

    return response.data as {
      success: boolean;
      data: any[];
      meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
      };
    };
  } catch (error: any) {
    console.error('Error fetching doctors:', error);
    const errorMessage = error.response?.data?.message || 'فشل في جلب بيانات الأطباء';
    throw new Error(errorMessage);
  }
}

// إضافة طبيب جديد
export interface AddDoctorData {
  drName: string;
  organizationType?: string;
  organizationName?: string;
  specialty?: string;
  telNumber?: string;
  profile?: string;
  district?: string;
  city: string;
  area?: string;
  brand: string;
  segment?: string;
  targetFrequency?: number;
  keyOpinionLeader?: boolean;
  teamProducts?: string;
  teamArea?: string;
}

export async function createDoctor(doctorData: AddDoctorData) {
  try {
    // الحصول على معرف المستخدم المسجل
    const { user } = useAuthStore.getState();
    
    const dataWithAdminId = {
      ...doctorData,
      adminId: user?._id
    };
    
    const response = await api.post('/doctors', dataWithAdminId);

    return {
      success: true,
      data: response.data.data,
      message: response.data.message || 'تم إضافة الطبيب بنجاح'
    };
  } catch (error: any) {
    console.error('Error adding doctor:', error);
    const errorMessage = error.response?.data?.message || 'فشل في إضافة الطبيب';
    return {
      success: false,
      data: null,
      error: errorMessage
    };
  }
}

// تحديث طبيب موجود
export const updateDoctor = async (doctorId: string, doctorData: Partial<AddDoctorData>) => {
  try {
    const { user } = useAuthStore.getState();
    if (!user) {
      throw new Error('المستخدم غير مسجل الدخول');
    }

    const response = await api.put(`/doctors/${doctorId}`, doctorData);
    
    if (response.data.success) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || 'فشل في تحديث الطبيب');
    }
  } catch (error: any) {
    console.error('Error updating doctor:', error);
    throw error;
  }
};

// الحصول على بيانات طبيب واحد
export const getDoctorById = async (doctorId: string) => {
  try {
    const response = await api.get(`/doctors/${doctorId}`);
    
    if (response.data.success) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || 'فشل في جلب بيانات الطبيب');
    }
  } catch (error: any) {
    console.error('Error fetching doctor:', error);
    throw error;
  }
};

// تصدير الأطباء إلى ملف Excel
export const exportDoctors = async (params: GetDoctorsParams = {}) => {
  try {
    const response = await api.get('/doctors/export', {
      params: {
        search: params.search,
        city: params.city,
        specialty: params.specialty,
        brand: params.brand,
      },
      responseType: 'blob', // مهم لتحميل الملفات
    });

    // إنشاء رابط تحميل
    const blob = new Blob([response.data], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });
    
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    
    // تحديد اسم الملف مع التاريخ
    const currentDate = new Date().toISOString().split('T')[0];
    link.download = `doctors_export_${currentDate}.xlsx`;
    
    // تحميل الملف
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // تنظيف الذاكرة
    window.URL.revokeObjectURL(url);
    
    return { success: true, message: 'تم تصدير ملف الأطباء بنجاح' };
  } catch (error: any) {
    console.error('Error exporting doctors:', error);
    const errorMessage = error.response?.data?.message || 'فشل في تصدير ملف الأطباء';
    throw new Error(errorMessage);
  }
};