import { OrderItem } from './store/orderStore';

export interface InvoiceDetails {
  invoiceNumber: string;
  orderId: string;
  invoiceDate: string;
  sellerDetails: {
    legalName: string;
    tradeName: string;
    gstinOrAadhaar: string;
    address: string;
    stateCode: string;
  };
  buyerDetails: {
    legalName: string;
    tradeName?: string;
    phone: string;
    shippingAddress: string;
    gstin?: string;
  };
  itemSummary: {
    commodity: string;
    hsnCode: string;
    quantityKg: number;
    unitPriceRs: number;
    taxableAmountRs: number;
    cgstRate: number;
    sgstRate: number;
    igstRate: number;
    taxAmountRs: number;
    platformFeeRs: number;
    totalAmountRs: number;
  };
  escrowDetails: {
    txHash: string;
    status: string;
    settlementNode: string;
  };
}

export const COMMODITY_HSN_CODES: Record<string, string> = {
  Wheat: '10019020',
  Tomato: '07020000',
  Mustard: '12075000',
  Soybean: '12019000',
  Potato: '07019000',
  Onion: '07031010',
  Chana: '07132000',
  Maize: '10059000',
  Default: '07099990',
};

export function buildInvoiceDataFromOrder(order: OrderItem): InvoiceDetails {
  const hsnCode = COMMODITY_HSN_CODES[order.commodity] || COMMODITY_HSN_CODES.Default;
  const taxable = order.totalPrice;
  const platformFee = order.platformCommissionAmount || Math.round(order.totalPrice * 0.04);
  // Agricultural raw produce is exempt from GST under Notification No. 2/2017-Central Tax (Rate)
  const isExempt = true;
  const tax = isExempt ? 0 : Math.round(taxable * 0.05);

  return {
    invoiceNumber: `INV-${order.id.replace('ORD-', '')}-${new Date().getFullYear()}`,
    orderId: order.id,
    invoiceDate: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
    sellerDetails: {
      legalName: 'Kisan Agrarian Cooperative / Direct Farmer Producer',
      tradeName: 'Fasal Matrix Producer Hub',
      gstinOrAadhaar: 'EXEMPT-AGRI-PRODUCE-SEC2(47)',
      address: order.farmAddress || 'Khasra 412, Jaitpura Farm, Phulera Tehsil, Rajasthan',
      stateCode: '08 (Rajasthan)',
    },
    buyerDetails: {
      legalName: order.buyerName || 'Verified Consignee',
      phone: order.buyerPhone || '+91 98000 00000',
      shippingAddress: order.shippingAddress || 'Direct Destination Delivery',
    },
    itemSummary: {
      commodity: order.commodity,
      hsnCode,
      quantityKg: order.quantityKg,
      unitPriceRs: order.unitPrice,
      taxableAmountRs: taxable,
      cgstRate: 0,
      sgstRate: 0,
      igstRate: 0,
      taxAmountRs: tax,
      platformFeeRs: platformFee,
      totalAmountRs: taxable,
    },
    escrowDetails: {
      txHash: order.escrowTxHash || `ESCROW-${order.id}-SETTLED`,
      status: order.escrowLocked ? 'HELD_IN_NODAL_ACCOUNT' : 'RELEASED_TO_FARMER',
      settlementNode: 'RBI-Compliant Scheduled Commercial Bank Escrow',
    },
  };
}

export function generateInvoiceHtml(order: OrderItem): string {
  const inv = buildInvoiceDataFromOrder(order);

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Tax Invoice - ${inv.invoiceNumber}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; color: #18181b; padding: 32px; background: #ffffff; }
    .invoice-card { max-width: 800px; margin: 0 auto; border: 1px solid #e4e4e7; border-radius: 8px; padding: 36px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
    .header { display: flex; justify-content: space-between; border-bottom: 2px solid #16a34a; padding-bottom: 20px; margin-bottom: 24px; }
    .brand { font-size: 24px; font-weight: 800; color: #16a34a; letter-spacing: -0.5px; }
    .badge { display: inline-block; font-size: 11px; font-weight: 600; text-transform: uppercase; background: #dcfce7; color: #15803d; padding: 4px 8px; border-radius: 4px; margin-top: 4px; }
    .inv-title { font-size: 18px; font-weight: 700; text-align: right; color: #27272a; }
    .inv-meta { font-size: 12px; color: #71717a; text-align: right; margin-top: 4px; }
    .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 28px; }
    .section-title { font-size: 12px; font-weight: 700; text-transform: uppercase; color: #a1a1aa; margin-bottom: 6px; letter-spacing: 0.5px; }
    .party-name { font-size: 15px; font-weight: 700; color: #18181b; }
    .party-info { font-size: 13px; color: #52525b; line-height: 1.5; margin-top: 4px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 28px; font-size: 13px; }
    th { background: #f4f4f5; text-align: left; padding: 10px 12px; font-weight: 600; color: #3f3f46; border-bottom: 1px solid #e4e4e7; }
    td { padding: 12px; border-bottom: 1px solid #f4f4f5; color: #27272a; }
    .text-right { text-align: right; }
    .total-box { display: flex; justify-content: flex-end; margin-bottom: 28px; }
    .total-table { width: 320px; font-size: 13px; }
    .total-row { display: flex; justify-content: space-between; padding: 6px 0; color: #52525b; }
    .grand-total { display: flex; justify-content: space-between; padding: 10px 0; border-top: 2px solid #18181b; font-size: 16px; font-weight: 800; color: #18181b; }
    .escrow-box { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 6px; padding: 16px; font-size: 12px; color: #166534; line-height: 1.5; }
    .escrow-title { font-weight: 700; margin-bottom: 4px; display: flex; align-items: center; gap: 6px; }
    .footer-note { margin-top: 32px; font-size: 11px; color: #a1a1aa; text-align: center; border-top: 1px solid #f4f4f5; padding-top: 16px; }
    @media print {
      body { padding: 0; background: none; }
      .invoice-card { border: none; box-shadow: none; padding: 0; }
    }
  </style>
</head>
<body>
  <div class="invoice-card">
    <div class="header">
      <div>
        <div class="brand">FASAL MATRIX</div>
        <div class="badge">GST-Compliant Agrarian Bill of Supply</div>
      </div>
      <div>
        <div class="inv-title">TAX INVOICE / RECEIPT</div>
        <div class="inv-meta">Invoice #: <strong>${inv.invoiceNumber}</strong></div>
        <div class="inv-meta">Date: ${inv.invoiceDate}</div>
        <div class="inv-meta">Order ID: ${inv.orderId}</div>
      </div>
    </div>

    <div class="grid-2">
      <div>
        <div class="section-title">Sold By (Farmer Producer)</div>
        <div class="party-name">${inv.sellerDetails.legalName}</div>
        <div class="party-info">
          Trade: ${inv.sellerDetails.tradeName}<br>
          Origin: ${inv.sellerDetails.address}<br>
          State: ${inv.sellerDetails.stateCode}<br>
          GSTIN / Status: <strong>${inv.sellerDetails.gstinOrAadhaar}</strong>
        </div>
      </div>
      <div>
        <div class="section-title">Billed & Shipped To (Buyer)</div>
        <div class="party-name">${inv.buyerDetails.legalName}</div>
        <div class="party-info">
          Phone: ${inv.buyerDetails.phone}<br>
          Delivery Address: ${inv.buyerDetails.shippingAddress}<br>
          Place of Supply: Inter-State / Intra-State Direct Logistics
        </div>
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th>#</th>
          <th>Description of Produce</th>
          <th>HSN/SAC</th>
          <th class="text-right">Qty (Kg)</th>
          <th class="text-right">Rate (₹/Kg)</th>
          <th class="text-right">Taxable Value</th>
          <th class="text-right">GST Rate</th>
          <th class="text-right">Total (₹)</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>1</td>
          <td><strong>${inv.itemSummary.commodity}</strong> (Field Assayed Lot)</td>
          <td>${inv.itemSummary.hsnCode}</td>
          <td class="text-right">${inv.itemSummary.quantityKg.toLocaleString('en-IN')}</td>
          <td class="text-right">₹${inv.itemSummary.unitPriceRs.toFixed(2)}</td>
          <td class="text-right">₹${inv.itemSummary.taxableAmountRs.toLocaleString('en-IN')}</td>
          <td class="text-right">0.0% (Exempt)</td>
          <td class="text-right">₹${inv.itemSummary.totalAmountRs.toLocaleString('en-IN')}</td>
        </tr>
      </tbody>
    </table>

    <div class="total-box">
      <div class="total-table">
        <div class="total-row">
          <span>Subtotal:</span>
          <span>₹${inv.itemSummary.taxableAmountRs.toLocaleString('en-IN')}</span>
        </div>
        <div class="total-row">
          <span>Applicable GST (CGST/SGST 0%):</span>
          <span>₹0.00</span>
        </div>
        <div class="total-row">
          <span>Platform Clearance (Incl. in Gross):</span>
          <span>₹${inv.itemSummary.platformFeeRs.toLocaleString('en-IN')}</span>
        </div>
        <div class="grand-total">
          <span>Total Net Amount:</span>
          <span>₹${inv.itemSummary.totalAmountRs.toLocaleString('en-IN')}</span>
        </div>
      </div>
    </div>

    <div class="escrow-box">
      <div class="escrow-title">🔒 RBI-Compliant Escrow Protection Record</div>
      <div>
        Transaction Hash: <code>${inv.escrowDetails.txHash}</code><br>
        Escrow State: <strong>${inv.escrowDetails.status}</strong> via ${inv.escrowDetails.settlementNode}.<br>
        Produce is physically inspected at WDRA accredited gate before escrow payout release.
      </div>
    </div>

    <div class="footer-note">
      This is a computer-generated tax invoice generated under Section 31 of CGST Act read with Notification 2/2017-Central Tax (Rate) exempting unbranded agrarian produce. No physical signature required.
    </div>
  </div>
</body>
</html>
  `.trim();
}

export function triggerInvoicePrintOrDownload(order: OrderItem) {
  if (typeof window === 'undefined') return;
  const html = generateInvoiceHtml(order);
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
    }, 250);
  }
}
