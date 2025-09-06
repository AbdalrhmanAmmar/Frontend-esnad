// lib/api/products.ts
export type GetProductsParams = {
  page?: number;
  limit?: number;
  sortField?: string;   // مثال: "CODE" أو "createdAt"
  sortOrder?: "asc" | "desc";
  brand?: string;
  company?: string;
  type?: string;        // PRODUCT_TYPE
  q?: string;           // للبحث النصّي لو ضفته لاحقًا
};

export async function getProducts(params: GetProductsParams = {}) {
  const base = "http://localhost:4000";
  const url = new URL("/api/products", base);

  const qp = new URLSearchParams();
  if (params.page) qp.set("page", String(params.page));
  if (params.limit) qp.set("limit", String(params.limit));
  if (params.sortField) qp.set("sortField", params.sortField);
  if (params.sortOrder) qp.set("sortOrder", params.sortOrder);
  if (params.brand) qp.set("brand", params.brand);
  if (params.company) qp.set("company", params.company);
  if (params.type) qp.set("type", params.type);
  if (params.q) qp.set("q", params.q);

  url.search = qp.toString();

  const res = await fetch(url.toString(), {
    method: "GET",
    headers: { "Accept": "application/json" },
    // لو بتحتاج كريدنشلز:
    // credentials: "include",
    // mode: "cors",
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`GET /products failed: ${res.status} ${text}`);
  }

  return res.json() as Promise<{
    success: boolean;
    meta: { total: number; page: number; limit: number; totalPages: number; hasNextPage: boolean; hasPrevPage: boolean; };
    data: any[];
  }>;
}

export interface AddProductData {
  CODE: string;
  PRODUCT: string;
  PRODUCT_TYPE?: string;
  BRAND?: string;
  TEAM?: string;
  COMPANY?: string;
}

export async function addProduct(productData: AddProductData) {
  const base = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000";
  const url = `${base}/api/products`;

  let res: Response | null = null;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(productData),
      // credentials: "include", // لو بتستخدم كوكيز
    });

    // جرّب تقرأ JSON، ولو فشل اقرأ نص عادي (عشان لو السيرفر رجّع HTML)
    const raw = await res.text();
    let data: any = null;
    try { data = raw ? JSON.parse(raw) : null; } catch { /* ignore */ }

    if (!res.ok) {
      const message = data?.message || data?.error || raw || `HTTP ${res.status}`;
      return { success: false, data: null, error: message };
    }

    return {
      success: true,
      data: data?.data ?? data,
      message: data?.message || "تم إضافة المنتج بنجاح",
    };
  } catch (err: any) {
    // لو fetch نفسه فشل (CORS / Network)
    return {
      success: false,
      data: null,
      error: err?.message || "Network error",
    };
  }
}

export const updateProduct = async (code: string, productData: AddProductData) => {
  const base = "http://localhost:4000";
  const url = `${base}/api/products/code/${code}`;

  try {
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(productData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return {
      success: true,
      data: data.data,
      message: data.message || 'تم تحديث المنتج بنجاح'
    };
  } catch (error) {
    console.error('Error updating product:', error);
    return {
      success: false,
      data: null,
      error: error instanceof Error ? error.message : 'حدث خطأ غير معروف'
    };
  }
};

export const deleteProduct = async (code: string) => {
  const base = "http://localhost:4000";
  const url = `${base}/api/products/code/${encodeURIComponent(code)}`;

  try {
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return {
      success: true,
      message: data.message || 'تم حذف المنتج بنجاح'
    };
  } catch (error) {
    console.error('Error deleting product:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'حدث خطأ غير معروف'
    };
  }
};

const BASE = import.meta.env.VITE_API_BASE || "http://localhost:4000";
const IMPORT_PATH = "/api/products/import"; // change if your route is '/produt/import'

export async function importProductsFile(file) {
  if (!/\.(xlsx|xls|csv)$/i.test(file.name)) {
    return { success: false, error: "Only .xlsx, .xls, or .csv files are allowed." };
    }

  const form = new FormData();
  form.append("file", file);

  try {
    const res = await fetch(`${BASE}${IMPORT_PATH}`, { method: "POST", body: form });
    const raw = await res.text();
    let data = null;
    try { data = raw ? JSON.parse(raw) : null; } catch {}

    if (!res.ok) {
      return { success: false, error: (data && data.message) || raw || `HTTP ${res.status}` };
    }
    return { success: true, data };
  } catch (e) {
    return { success: false, error: e?.message || "Network error" };
  }
}