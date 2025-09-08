import api from './api';

// إنشاء نشاط تسويقي جديد
export const createMarketingActivity = async (english: string, arabic: string) => {
  try {
    const response = await api.post('/marketing-activities', {
      english,
      arabic
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'حدث خطأ أثناء إنشاء النشاط التسويقي');
  }
};

// جلب جميع الأنشطة التسويقية مع التصفح والبحث
export const getAllMarketingActivities = async (
  page: number = 1,
  limit: number = 10,
  search?: string,
  isActive?: boolean
) => {
  try {
    const params: any = {
      page,
      limit
    };

    if (search) {
      params.search = search;
    }

    if (isActive !== undefined) {
      params.isActive = isActive;
    }

    const response = await api.get('/marketing-activities', { params });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'حدث خطأ أثناء جلب الأنشطة التسويقية');
  }
};

// رفع ملف Excel للأنشطة التسويقية
export const importMarketingActivitiesFile = async (file: File) => {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post('/marketing-activities/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'حدث خطأ أثناء رفع الملف');
  }
};

// تصدير الأنشطة التسويقية إلى Excel
export const exportMarketingActivitiesToExcel = async (isActive?: boolean) => {
  try {
    const params: any = {};
    if (isActive !== undefined) {
      params.isActive = isActive;
    }

    const response = await api.get('/marketing-activities/export-excel', {
      params,
      responseType: 'blob'
    });

    // إنشاء رابط التحميل
    const blob = new Blob([response.data], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });
    
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    
    const filename = `marketing-activities-${new Date().toISOString().split('T')[0]}.xlsx`;
    link.setAttribute('download', filename);
    
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);

    return {
      success: true,
      message: 'تم تصدير البيانات بنجاح'
    };
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'حدث خطأ أثناء تصدير البيانات');
  }
};

// تحديث نشاط تسويقي
export const updateMarketingActivity = async (
  id: string,
  english: string,
  arabic: string,
  isActive: boolean
) => {
  try {
    const response = await api.put(`/marketing-activities/${id}`, {
      english,
      arabic,
      isActive
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'حدث خطأ أثناء تحديث النشاط التسويقي');
  }
};

// حذف نشاط تسويقي
export const deleteMarketingActivity = async (id: string) => {
  try {
    const response = await api.delete(`/marketing-activities/${id}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'حدث خطأ أثناء حذف النشاط التسويقي');
  }
};

// جلب نشاط تسويقي واحد
export const getMarketingActivityById = async (id: string) => {
  try {
    const response = await api.get(`/marketing-activities/${id}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'حدث خطأ أثناء جلب النشاط التسويقي');
  }
};