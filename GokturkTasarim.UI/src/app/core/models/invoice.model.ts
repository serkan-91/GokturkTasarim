export interface InvoiceItem {
  id?: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  taxRate: number; // e.g., 20 (%)
  totalPrice: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string; // e.g., GKT-FTR-2026-987710
  orderCode: string; // e.g., GKT-ORD-987710
  issueDate: string; // e.g., 09.08.2026
  dueDate: string; // e.g., 23.08.2026
  
  // Seller Company Details
  sellerTitle: string;
  sellerTaxDept: string;
  sellerTaxNo: string;
  sellerAddress: string;
  sellerPhone: string;
  sellerEmail: string;

  // Customer Billing Details
  buyerName: string;
  buyerCompany: string;
  buyerTaxDept: string;
  buyerTaxNo: string;
  buyerAddress: string;
  buyerPhone: string;
  buyerEmail: string;

  // Line items & totals
  items: InvoiceItem[];
  subTotal: number; // Ara Toplam
  taxTotal: number; // Toplam KDV (%20)
  discountTotal: number; // İskonto
  grandTotal: number; // Genel Toplam

  // Meta & Bank info
  paymentStatus: 'ÖDENDİ' | 'ÖDEME BEKLİYOR' | 'İPTAL';
  paymentMethod: string;
  notes: string;
  iban: string;
  bankName: string;
}
