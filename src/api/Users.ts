import api from './api';

export interface CreateAdminData {
  firstName: string;
  lastName: string;
  username: string;
  password: string;
}

export interface AdminResponse {
  success: boolean;
  message: string;
  admin?: {
    id: string;
    username: string;
    role: string;
  };
}

export const createAdmin = async (adminData: CreateAdminData): Promise<AdminResponse> => {
  try {
    const response = await api.post('/setup/create-admin', adminData);
    return response.data;
  } catch (error: any) {
    if (error.response?.data) {
      return error.response.data;
    }
    throw new Error('حدث خطأ في الاتصال بالخادم');
  }
};

// Interface for admin list item
export interface AdminListItem {
  id: string;
  fullName: string;
  username: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  status: string;
  roleDisplay: string;
}

// Interface for pagination
export interface Pagination {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  limit: number;
}

// Interface for statistics
export interface Statistics {
  total: number;
  byRole: {
    [key: string]: {
      total: number;
      active: number;
      inactive: number;
    };
  };
}

// Interface for filters
export interface Filters {
  applied: {
    role?: string;
    isActive?: string;
    search?: string;
  };
  available: {
    roles: string[];
    status: boolean[];
  };
}

// Interface for getAllAdmins response
export interface GetAllAdminsResponse {
  success: boolean;
  message: string;
  data: {
    admins: AdminListItem[];
    pagination: Pagination;
    statistics: Statistics;
    filters: Filters;
  };
}

// Interface for getAllAdmins query parameters
export interface GetAllAdminsParams {
  page?: number;
  limit?: number;
  role?: string;
  isActive?: boolean;
  search?: string;
}

export const getAllAdmins = async (params?: GetAllAdminsParams): Promise<GetAllAdminsResponse> => {
  try {
    const queryParams = new URLSearchParams();
    
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.role) queryParams.append('role', params.role);
    if (params?.isActive !== undefined) queryParams.append('isActive', params.isActive.toString());
    if (params?.search) queryParams.append('search', params.search);
    
    const response = await api.get(`/setup/all-admins?${queryParams.toString()}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'فشل في جلب بيانات المديرين');
  }
};

// Interface for export params
export interface ExportAdminsParams {
  role?: string;
  isActive?: boolean;
}

// Export admins to Excel
export const exportAdminsToExcel = async (params?: ExportAdminsParams): Promise<Blob> => {
  try {
    const queryParams = new URLSearchParams();
    
    if (params?.role) queryParams.append('role', params.role);
    if (params?.isActive !== undefined) queryParams.append('isActive', params.isActive.toString());
    
    const response = await api.get(`/setup/export-excel?${queryParams.toString()}`, {
      responseType: 'blob'
    });
    
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'فشل في تصدير البيانات');
  }
};

// Interface for update admin status
export interface UpdateAdminStatusData {
  adminId: string;
  isActive: boolean;
}

export interface UpdateAdminStatusResponse {
  success: boolean;
  message: string;
  admin?: {
    id: string;
    isActive: boolean;
  };
}

// Update admin status
export const updateAdminStatus = async (data: UpdateAdminStatusData): Promise<UpdateAdminStatusResponse> => {
  try {
    const response = await api.patch(`/setup/update-admin-status/${data.adminId}`, {
      isActive: data.isActive
    });
    return response.data;
  } catch (error: any) {
    if (error.response?.data) {
      return error.response.data;
    }
    throw new Error('فشل في تحديث حالة المدير');
  }
};