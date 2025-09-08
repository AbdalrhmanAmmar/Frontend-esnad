import { create } from 'zustand';
import { MedicalRepDoctor, MedicalRepProduct } from '../api/MedicalRep';

interface MedicalRepState {
  doctors: MedicalRepDoctor[];
  products: MedicalRepProduct[];
  isLoaded: boolean;
  setDoctors: (doctors: MedicalRepDoctor[]) => void;
  setProducts: (products: MedicalRepProduct[]) => void;
  setData: (doctors: MedicalRepDoctor[], products: MedicalRepProduct[]) => void;
  clearData: () => void;
}

export const useMedicalRepStore = create<MedicalRepState>((set) => ({
  doctors: [],
  products: [],
  isLoaded: false,
  setDoctors: (doctors) => set({ doctors }),
  setProducts: (products) => set({ products }),
  setData: (doctors, products) => set({ doctors, products, isLoaded: true }),
  clearData: () => set({ doctors: [], products: [], isLoaded: false }),
}));