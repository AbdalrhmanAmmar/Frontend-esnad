// lib/api/doctors.ts
import api from './api';

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
    const formData = new FormData();
    formData.append('file', file);

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