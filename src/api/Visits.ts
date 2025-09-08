import api from './api';

// Interfaces
export interface VisitProduct {
  productId: string;
  messageId: string;
}

export interface CreateVisitRequest {
  visitDate: string;
  doctorId: string;
  products: VisitProduct[];
  notes?: string;
  withSupervisor: boolean;
  supervisorId?: string;
}

export interface VisitResponse {
  _id: string;
  medicalRepId: {
    _id: string;
    firstName: string;
    lastName: string;
    username: string;
  };
  adminId: string;
  visitDate: string;
  doctorId: {
    _id: string;
    drName: string;
    specialization: string;
    phone: string;
    organizationName: string;
  };
  products: {
    productId: {
      _id: string;
      CODE: string;
      PRODUCT: string;
      BRAND: string;
      messages: any[];
    };
    messageId: string;
    _id: string;
  }[];
  notes: string;
  withSupervisor: boolean;
  supervisorId?: {
    _id: string;
    firstName: string;
    lastName: string;
    username: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

// API Functions
export const createVisit = async (medicalRepId: string, visitData: CreateVisitRequest): Promise<ApiResponse<VisitResponse>> => {
  try {
    const response = await api.post(`/medical-rep/${medicalRepId}/visits`, visitData);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'حدث خطأ أثناء إنشاء الزيارة');
  }
};

export const getVisits = async (medicalRepId: string): Promise<ApiResponse<VisitResponse[]>> => {
  try {
    const response = await api.get(`/medical-rep/${medicalRepId}/visits`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'حدث خطأ أثناء جلب الزيارات');
  }
};

export const getVisitById = async (medicalRepId: string, visitId: string): Promise<ApiResponse<VisitResponse>> => {
  try {
    const response = await api.get(`/medical-rep/${medicalRepId}/visits/${visitId}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'حدث خطأ أثناء جلب الزيارة');
  }
};

export const updateVisit = async (medicalRepId: string, visitId: string, visitData: Partial<CreateVisitRequest>): Promise<ApiResponse<VisitResponse>> => {
  try {
    const response = await api.put(`/medical-rep/${medicalRepId}/visits/${visitId}`, visitData);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'حدث خطأ أثناء تحديث الزيارة');
  }
};

export const deleteVisit = async (medicalRepId: string, visitId: string): Promise<ApiResponse<null>> => {
  try {
    const response = await api.delete(`/medical-rep/${medicalRepId}/visits/${visitId}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'حدث خطأ أثناء حذف الزيارة');
  }
};