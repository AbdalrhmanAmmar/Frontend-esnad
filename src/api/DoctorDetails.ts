import { api } from './api';

export interface DoctorInfo {
  name: string;
  specialty: string;
  brand: string;
  city: string;
  area: string;
}

export interface MedicalRepInfo {
  name: string;
  email: string;
  phone: string;
}

export interface VisitDetails {
  visitDate: string;
  visitTime: string;
  visitType: string;
  visitStatus: string;
}

export interface SampleDetail {
  productName: string;
  category: string;
  samplesCount: number;
  notes: string;
}

export interface SamplesInfo {
  totalSamples: number;
  samplesDetails: SampleDetail[];
  totalProducts: number;
}

export interface AdditionalInfo {
  notes: string;
  feedback: string;
  nextVisitPlanned: string | null;
}

export interface Visit {
  visitId: string;
  doctorInfo: DoctorInfo;
  medicalRepInfo: MedicalRepInfo;
  visitDetails: VisitDetails;
  samplesInfo: SamplesInfo;
  additionalInfo: AdditionalInfo;
}

export interface Statistics {
  totalVisits: number;
  totalSamplesDistributed: number;
  uniqueMedicalReps: number;
  uniqueProducts: number;
  lastVisitDate: string | null;
  firstVisitDate: string | null;
}

export interface DoctorDetailsResponse {
  success: boolean;
  message: string;
  data: {
    searchQuery: string;
    foundDoctors: number;
    statistics: Statistics;
    visits: Visit[];
  };
}

export const getDoctorDetails = async (doctorName: string): Promise<DoctorDetailsResponse> => {
  try {
    const response = await api.get(`/automation/doctor-details?doctorName=${encodeURIComponent(doctorName)}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'حدث خطأ في جلب بيانات الدكتور');
  }
};