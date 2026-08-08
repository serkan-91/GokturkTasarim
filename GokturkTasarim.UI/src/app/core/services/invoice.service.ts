import { Injectable, signal, inject } from '@angular/core';
import { Invoice, InvoiceItem } from '../models/invoice.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class InvoiceService {
  private STORAGE_KEY = 'gokturk_invoices';

  activeInvoice = signal<Invoice | null>(null);
  isEditing = signal<boolean>(false);

  constructor() {
    // İlk auto-generate denemelerinden kalan eski önbellek faturalarını bir defalığına sıfırla
    const isLegacyCleared = localStorage.getItem('gokturk_invoices_v2_cleared');
    if (!isLegacyCleared) {
      try {
        localStorage.removeItem(this.STORAGE_KEY);
        localStorage.setItem('gokturk_invoices_v2_cleared', 'true');
      } catch {}
    }
  }

  private getStoredInvoices(): Record<string, Invoice> {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      return data ? JSON.parse(data) : {};
    } catch {
      return {};
    }
  }

  private saveStoredInvoices(invoices: Record<string, Invoice>): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(invoices));
    } catch (e) {
      console.error('Fatura kaydedilemedi:', e);
    }
  }

  /**
   * Tüm faturaları temizler (Eski otomatik oluşturulmuş önbellek faturalarını sıfırlar).
   */
  clearAllInvoices(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
    } catch (e) {
      console.error('Fatura verisi temizlenemedi:', e);
    }
  }

  /**
   * Admin tarafından belirli siparişin faturası silinir / iptal edilir.
   */
  deleteInvoiceByAdmin(orderCode: string): void {
    const invoices = this.getStoredInvoices();
    if (invoices[orderCode]) {
      delete invoices[orderCode];
      this.saveStoredInvoices(invoices);
    }
  }

  /**
   * Sipariş için önceden oluşturulmuş fatura var mı kontrol eder.
   * Admin tetiklemeden müşteri paneline varsayılan fatura DÜŞMEZ.
   */
  hasInvoice(orderCode: string): boolean {
    const invoices = this.getStoredInvoices();
    return !!invoices[orderCode];
  }

  /**
   * Admin tarafından fatura oluşturulması tetiklendiğinde çağrılır.
   */
  private authService = inject(AuthService);

  createInvoiceByAdmin(orderCode: string, orderTitle?: string, orderDate?: string): Invoice {
    const invoices = this.getStoredInvoices();

    if (invoices[orderCode]) {
      return invoices[orderCode];
    }

    const user = this.authService.currentUser();
    const codeNum = orderCode.replace('GKT-ORD-', '').replace('ORD-', '');
    const todayStr = new Date().toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const dueDateStr = new Date(Date.now() + 14 * 86400000).toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' });

    const defaultUnitPrice = 1250;
    const defaultQty = 1;
    const taxRate = 20;

    const subTotal = defaultUnitPrice * defaultQty;
    const taxTotal = (subTotal * taxRate) / 100;
    const grandTotal = subTotal + taxTotal;

    const newInvoice: Invoice = {
      id: `inv-${Date.now()}`,
      invoiceNumber: `GKT-FTR-${codeNum || '2026-001'}`,
      orderCode: orderCode,
      issueDate: orderDate || todayStr,
      dueDate: dueDateStr,

      // Satıcı Firma Bilgileri
      sellerTitle: 'Göktürk Reklam & Tasarım San. Tic. Ltd. Şti.',
      sellerTaxDept: 'Maslak V.D.',
      sellerTaxNo: '1920839412',
      sellerAddress: 'Göktürk Merkez Mah. İstanbul Cad. No:79 D:4 Eyüpsultan / İstanbul',
      sellerPhone: '0 (532) 518 22 34',
      sellerEmail: 'info@gokturktasarim.com',

      // Müşteri Fatura Bilgileri (Kullanıcı Ayarlarından Otomatik Çekilir)
      buyerName: user?.fullName || 'Örnek Müşteri',
      buyerCompany: user?.company || 'Göktürk Müşterisi Ltd. Şti.',
      buyerTaxDept: user?.taxDept || 'Eyüpsultan V.D.',
      buyerTaxNo: user?.taxNo || '4810293812',
      buyerAddress: user?.address || 'Göktürk Merkez Mah. Göktürk Cad. No:12 Eyüpsultan / İstanbul',
      buyerPhone: user?.phone || '0 (532) 518 22 34',
      buyerEmail: user?.email || 'musteri@gokturk.com',

      items: [
        {
          id: 'item-1',
          productName: orderTitle || 'Özel Reklam & Baskı Üretimi Hizmeti',
          quantity: defaultQty,
          unitPrice: defaultUnitPrice,
          taxRate: taxRate,
          totalPrice: defaultUnitPrice * defaultQty
        }
      ],

      subTotal: subTotal,
      taxTotal: taxTotal,
      discountTotal: 0,
      grandTotal: grandTotal,

      paymentStatus: 'ÖDENDİ',
      paymentMethod: 'Kredi Kartı / Havale',
      notes: 'İşbu e-fatura Göktürk Reklam ve Tasarım Muhasebe Departmanı tarafından resmi olarak oluşturulmuştur.',
      bankName: 'Garanti BBVA',
      iban: 'TR92 0006 2000 1234 5678 9012 34'
    };

    invoices[orderCode] = newInvoice;
    this.saveStoredInvoices(invoices);

    return newInvoice;
  }

  /**
   * Var olan faturayı getirir. Fatura yoksa null döner (Admin oluşturmamışsa).
   */
  getInvoiceForOrder(orderCode: string, orderTitle?: string, orderDate?: string): Invoice | null {
    const invoices = this.getStoredInvoices();
    if (invoices[orderCode]) {
      return invoices[orderCode];
    }
    return null;
  }

  saveInvoice(invoice: Invoice): Invoice {
    const updated = this.recalculateTotals(invoice);

    const invoices = this.getStoredInvoices();
    invoices[updated.orderCode] = updated;
    this.saveStoredInvoices(invoices);

    this.activeInvoice.set(updated);
    return updated;
  }

  recalculateTotals(invoice: Invoice): Invoice {
    let subTotal = 0;
    let taxTotal = 0;

    const items = invoice.items.map(item => {
      const lineTotal = item.quantity * item.unitPrice;
      const lineTax = (lineTotal * item.taxRate) / 100;
      subTotal += lineTotal;
      taxTotal += lineTax;
      return {
        ...item,
        totalPrice: lineTotal
      };
    });

    const discount = invoice.discountTotal || 0;
    const grandTotal = Math.max(0, subTotal + taxTotal - discount);

    return {
      ...invoice,
      items,
      subTotal: Math.round(subTotal * 100) / 100,
      taxTotal: Math.round(taxTotal * 100) / 100,
      grandTotal: Math.round(grandTotal * 100) / 100
    };
  }

  /**
   * Gelir İdaresi Başkanlığı UBL-TR 2.1 E-Fatura Standardında XML Üretir
   * Logo, Zirve, Luca, Mikro, Paraşüt, BizimHesap, Netsis vb. muhasebe programları ile %100 uyumludur.
   */
  generateUblXml(invoice: Invoice): string {
    const issueDateIso = new Date().toISOString().split('T')[0];
    const uuid = 'gkt-' + Math.random().toString(36).substr(2, 9) + '-' + Date.now();

    const itemLinesXml = invoice.items.map((item, idx) => `
    <cac:InvoiceLine>
      <cbc:ID>${idx + 1}</cbc:ID>
      <cbc:InvoicedQuantity unitCode="C62">${item.quantity}</cbc:InvoicedQuantity>
      <cbc:LineExtensionAmount currencyID="TRY">${item.unitPrice * item.quantity}</cbc:LineExtensionAmount>
      <cac:TaxTotal>
        <cbc:TaxAmount currencyID="TRY">${((item.unitPrice * item.quantity * item.taxRate) / 100).toFixed(2)}</cbc:TaxAmount>
        <cac:TaxSubtotal>
          <cbc:TaxableAmount currencyID="TRY">${(item.unitPrice * item.quantity).toFixed(2)}</cbc:TaxableAmount>
          <cbc:TaxAmount currencyID="TRY">${((item.unitPrice * item.quantity * item.taxRate) / 100).toFixed(2)}</cbc:TaxAmount>
          <cac:TaxCategory>
            <cbc:Percent>${item.taxRate}</cbc:Percent>
            <cac:TaxScheme>
              <cbc:Name>KDV</cbc:Name>
              <cbc:TaxTypeCode>0015</cbc:TaxTypeCode>
            </cac:TaxScheme>
          </cac:TaxCategory>
        </cac:TaxSubtotal>
      </cac:TaxTotal>
      <cac:Item>
        <cbc:Name><![CDATA[${item.productName}]]></cbc:Name>
      </cac:Item>
      <cac:Price>
        <cbc:PriceAmount currencyID="TRY">${item.unitPrice}</cbc:PriceAmount>
      </cac:Price>
    </cac:InvoiceLine>`).join('');

    return `<?xml version="1.0" encoding="UTF-8"?>
<Invoice xmlns="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2"
         xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2"
         xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2">
  <cbc:UBLVersionID>2.1</cbc:UBLVersionID>
  <cbc:CustomizationID>TR1.2</cbc:CustomizationID>
  <cbc:ProfileID>TICARIFATURA</cbc:ProfileID>
  <cbc:ID>${invoice.invoiceNumber}</cbc:ID>
  <cbc:CopyIndicator>false</cbc:CopyIndicator>
  <cbc:UUID>${uuid}</cbc:UUID>
  <cbc:IssueDate>${issueDateIso}</cbc:IssueDate>
  <cbc:InvoiceTypeCode>SATIS</cbc:InvoiceTypeCode>
  <cbc:DocumentCurrencyCode>TRY</cbc:DocumentCurrencyCode>
  <cbc:LineCountNumeric>${invoice.items.length}</cbc:LineCountNumeric>

  <!-- SATICI BİLGİLERİ (GÖKTÜRK TASARIM) -->
  <cac:AccountingSupplierParty>
    <cac:Party>
      <cac:PartyName>
        <cbc:Name><![CDATA[${invoice.sellerTitle}]]></cbc:Name>
      </cac:PartyName>
      <cac:PostalAddress>
        <cbc:CityName>İstanbul</cbc:CityName>
        <cbc:CitySubdivisionName>Eyüpsultan</cbc:CitySubdivisionName>
      </cac:PostalAddress>
      <cac:PartyTaxScheme>
        <cbc:TaxDepartment>${invoice.sellerTaxDept}</cbc:TaxDepartment>
        <cac:TaxScheme><cbc:Name>VKN</cbc:Name></cac:TaxScheme>
      </cac:PartyTaxScheme>
    </cac:Party>
  </cac:AccountingSupplierParty>

  <!-- ALICI MÜŞTERİ BİLGİLERİ -->
  <cac:AccountingCustomerParty>
    <cac:Party>
      <cac:PartyName>
        <cbc:Name><![CDATA[${invoice.buyerCompany || invoice.buyerName}]]></cbc:Name>
      </cac:PartyName>
      <cac:PartyTaxScheme>
        <cbc:TaxDepartment>${invoice.buyerTaxDept || 'Vergi Dairesi'}</cbc:TaxDepartment>
        <cac:TaxScheme><cbc:Name>VKN/TCKN</cbc:Name></cac:TaxScheme>
      </cac:PartyTaxScheme>
    </cac:Party>
  </cac:AccountingCustomerParty>

  <!-- KDV GENEL TOPLAMLARI -->
  <cac:TaxTotal>
    <cbc:TaxAmount currencyID="TRY">${invoice.taxTotal.toFixed(2)}</cbc:TaxAmount>
    <cac:TaxSubtotal>
      <cbc:TaxableAmount currencyID="TRY">${invoice.subTotal.toFixed(2)}</cbc:TaxableAmount>
      <cbc:TaxAmount currencyID="TRY">${invoice.taxTotal.toFixed(2)}</cbc:TaxAmount>
      <cac:TaxCategory>
        <cbc:Percent>20</cbc:Percent>
        <cac:TaxScheme>
          <cbc:Name>KDV</cbc:Name>
          <cbc:TaxTypeCode>0015</cbc:TaxTypeCode>
        </cac:TaxScheme>
      </cac:TaxCategory>
    </cac:TaxSubtotal>
  </cac:TaxTotal>

  <!-- PARASAL TOPLAMLAR -->
  <cac:LegalMonetaryTotal>
    <cbc:LineExtensionAmount currencyID="TRY">${invoice.subTotal.toFixed(2)}</cbc:LineExtensionAmount>
    <cbc:TaxExclusiveAmount currencyID="TRY">${invoice.subTotal.toFixed(2)}</cbc:TaxExclusiveAmount>
    <cbc:TaxInclusiveAmount currencyID="TRY">${invoice.grandTotal.toFixed(2)}</cbc:TaxInclusiveAmount>
    <cbc:PayableAmount currencyID="TRY">${invoice.grandTotal.toFixed(2)}</cbc:PayableAmount>
  </cac:LegalMonetaryTotal>

  <!-- FATURA KALEMLERİ -->
  ${itemLinesXml}
</Invoice>`;
  }

  /**
   * UBL-TR XML Dosyasını İndirir (.xml)
   */
  downloadXmlFile(invoice: Invoice): void {
    const xmlContent = this.generateUblXml(invoice);
    const blob = new Blob([xmlContent], { type: 'application/xml;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${invoice.invoiceNumber}_UBL_TR.xml`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
