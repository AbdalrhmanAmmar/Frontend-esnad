import { api } from './api';

export interface CoachingTotals {
  TotalPlanning: number;
  TotalPersonalSkills: number;
  TotalKnowledge: number;
  TotalSellingSkills: number;
  TotalScore: number;
}

export interface CoachingDoctorInfo {
  id: string;
  name: string;
  specialty?: string;
}

export interface CoachingUserInfo {
  id: string;
  username?: string;
  name?: string;
}

export interface CoachingVisitInfo {
  id: string;
  visitDate: string;
  doctor: CoachingDoctorInfo | null;
  medicalRep: CoachingUserInfo | null;
  supervisor: CoachingUserInfo | null;
  notes: string;
}

export interface CoachingEntry {
  coachingId: string;
  isCompleted: boolean;
  title: string;
  Recommendations: string;
  note: string;
  totals: CoachingTotals;
  visit: CoachingVisitInfo | null;
  createdAt: string;
  updatedAt: string;
}

export interface CoachingResponse {
  success: boolean;
  count: number;
  data: CoachingEntry[];
  message?: string;
}

// Fetch coaching entries for the authenticated supervisor
export const getCoachingBySupervisor = async (): Promise<CoachingResponse> => {
  try {
    const response = await api.get('/coach/supervisor');
    return response.data as CoachingResponse;
  } catch (error: any) {
    const message = error?.response?.data?.message || 'فشل في جلب بيانات الكوتشينغ';
    throw new Error(message);
  }
};

export default {
  getCoachingBySupervisor,
};