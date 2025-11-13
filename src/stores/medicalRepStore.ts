// stores/medicalRepStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { MedicalRepDoctor, MedicalRepProduct } from '../api/MedicalRep';

interface MedicalRepState {
  doctors: MedicalRepDoctor[];
  products: MedicalRepProduct[];
  isLoaded: boolean;
  isLoading: boolean;
  lastFetched: Date | null;
  setDoctors: (doctors: MedicalRepDoctor[]) => void;
  setProducts: (products: MedicalRepProduct[]) => void;
  setData: (doctors: MedicalRepDoctor[], products: MedicalRepProduct[]) => void;
  setLoading: (loading: boolean) => void;
  clearData: () => void;
}

export const useMedicalRepStore = create<MedicalRepState>()(
  persist(
    (set) => ({
      doctors: [],
      products: [],
      isLoaded: false,
      isLoading: false,
      lastFetched: null,
      setDoctors: (doctors) => set({ doctors }),
      setProducts: (products) => set({ products }),
      setData: (doctors, products) => set({ 
        doctors, 
        products, 
        isLoaded: true,
        isLoading: false,
        lastFetched: new Date()
      }),
      setLoading: (isLoading) => set({ isLoading }),
      clearData: () => set({ 
        doctors: [], 
        products: [], 
        isLoaded: false,
        lastFetched: null 
      }),
    }),
    {
      name: 'medical-rep-store',
    }
  )
);