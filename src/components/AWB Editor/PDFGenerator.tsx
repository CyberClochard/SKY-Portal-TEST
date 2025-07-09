import React from 'react';
import { FileText, Download } from 'lucide-react';
import { LTAData } from '../types/lta';
import jsPDF from 'jspdf';

interface PDFGeneratorProps {
  data: LTAData;
}

export const PDFGenerator: React.FC<PDFGeneratorProps> = ({ data }) => {
  const generatePDF = () => {
    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const margin = 10;
    let yPosition = margin;

    // Helper function to add text with word wrap
    const addText = (text: string, x: number, y: number, maxWidth?: number, fontSize = 10) => {
      doc.setFontSize(fontSize);
      if (maxWidth) {
        const lines = doc.splitTextToSize(text, maxWidth);
        doc.text(lines, x, y);
        return y + (lines.length * fontSize * 0.35);
      } else {
        doc.text(text, x, y);
        return y + (fontSize * 0.35);
      }
    };

    // Helper function to draw a box
    const drawBox = (x: number, y: number, width: number, height: number) => {
      doc.rect(x, y, width, height);
    };

    // Title
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('AIR WAYBILL', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 10;

    // AWB Number
    doc.setFontSize(12);
    doc.text(`AWB Number: ${data.awbConsignment.awbNumber}`, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 15;

    // Shipper section
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    drawBox(margin, yPosition, pageWidth - 2 * margin, 30);
    doc.text('SHIPPER', margin + 2, yPosition + 5);
    doc.setFont('helvetica', 'normal');
    yPosition += 8;
    yPosition = addText(`Account Number: ${data.shipper.accountNumber}`, margin + 2, yPosition);
    yPosition = addText(`Name: ${data.shipper.name}`, margin + 2, yPosition);
    yPosition = addText(`Address: ${data.shipper.address}`, margin + 2, yPosition, pageWidth - 2 * margin - 4);
    yPosition = addText(`${data.shipper.city}, ${data.shipper.country} ${data.shipper.postalCode}`, margin + 2, yPosition);
    yPosition += 10;

    // Consignee section
    doc.setFont('helvetica', 'bold');
    drawBox(margin, yPosition, pageWidth - 2 * margin, 30);
    doc.text('CONSIGNEE', margin + 2, yPosition + 5);
    doc.setFont('helvetica', 'normal');
    yPosition += 8;
    yPosition = addText(`Account Number: ${data.consignee.accountNumber}`, margin + 2, yPosition);
    yPosition = addText(`Name: ${data.consignee.name}`, margin + 2, yPosition);
    yPosition = addText(`Address: ${data.consignee.address}`, margin + 2, yPosition, pageWidth - 2 * margin - 4);
    yPosition = addText(`${data.consignee.city}, ${data.consignee.country} ${data.consignee.postalCode}`, margin + 2, yPosition);
    yPosition += 10;

    // Issuing Carrier's Agent
    doc.setFont('helvetica', 'bold');
    drawBox(margin, yPosition, (pageWidth - 2 * margin) / 2 - 2, 25);
    doc.text("ISSUING CARRIER'S AGENT", margin + 2, yPosition + 5);
    doc.setFont('helvetica', 'normal');
    yPosition += 8;
    yPosition = addText(`Name: ${data.issuingCarrierAgent.name}`, margin + 2, yPosition);
    yPosition = addText(`City: ${data.issuingCarrierAgent.city}`, margin + 2, yPosition);
    yPosition = addText(`IATA Code: ${data.issuingCarrierAgent.iataCode}`, margin + 2, yPosition);
    yPosition = addText(`Account No: ${data.issuingCarrierAgent.accountNo}`, margin + 2, yPosition);

    // AWB Consignment Details (right side)
    const rightColumnX = margin + (pageWidth - 2 * margin) / 2 + 2;
    let rightYPosition = yPosition - 25 + 8;
    doc.setFont('helvetica', 'bold');
    drawBox(rightColumnX, yPosition - 25, (pageWidth - 2 * margin) / 2 - 2, 25);
    doc.text('AWB CONSIGNMENT DETAILS', rightColumnX + 2, yPosition - 25 + 5);
    doc.setFont('helvetica', 'normal');
    rightYPosition = addText(`AWB Number: ${data.awbConsignment.awbNumber}`, rightColumnX + 2, rightYPosition);
    rightYPosition = addText(`Airport of Departure: ${data.awbConsignment.airportOfDeparture}`, rightColumnX + 2, rightYPosition);
    rightYPosition = addText(`Issuer: ${data.awbConsignment.issuer}`, rightColumnX + 2, rightYPosition);
    rightYPosition = addText(`Issued By: ${data.awbConsignment.issuedBy}`, rightColumnX + 2, rightYPosition);

    yPosition += 10;

    // Flight Booking
    doc.setFont('helvetica', 'bold');
    drawBox(margin, yPosition, pageWidth - 2 * margin, 25);
    doc.text('ROUTING AND FLIGHT BOOKINGS', margin + 2, yPosition + 5);
    doc.setFont('helvetica', 'normal');
    yPosition += 8;
    yPosition = addText(`Departure: ${data.flightBooking.departure}`, margin + 2, yPosition);
    yPosition = addText(`Route: ${data.flightBooking.route}`, margin + 2, yPosition);
    yPosition = addText(`Destination: ${data.flightBooking.destination}`, margin + 2, yPosition);
    yPosition = addText(`Flight/Date: ${data.flightBooking.flightDate}`, margin + 2, yPosition);
    yPosition = addText(`Carrier: ${data.flightBooking.carrier}`, margin + 2, yPosition);
    yPosition += 10;

    // Charges Declaration
    doc.setFont('helvetica', 'bold');
    drawBox(margin, yPosition, pageWidth - 2 * margin, 20);
    doc.text('CHARGES DECLARATION', margin + 2, yPosition + 5);
    doc.setFont('helvetica', 'normal');
    yPosition += 8;
    yPosition = addText(`Currency: ${data.chargesDeclaration.currency}`, margin + 2, yPosition);
    yPosition = addText(`Value for Carriage: ${data.chargesDeclaration.valueForCarriage}`, margin + 2, yPosition);
    yPosition = addText(`Value for Customs: ${data.chargesDeclaration.valueForCustoms}`, margin + 2, yPosition);
    yPosition = addText(`Amount of Insurance: ${data.chargesDeclaration.amountOfInsurance}`, margin + 2, yPosition);
    yPosition = addText(`WT/VAL: ${data.chargesDeclaration.wtValPPD ? 'PPD' : 'COLL'}`, margin + 2, yPosition);
    yPosition = addText(`Other: ${data.chargesDeclaration.otherPPD ? 'PPD' : 'COLL'}`, margin + 2, yPosition);
    yPosition += 10;

    // Check if we need a new page
    if (yPosition > pageHeight - 60) {
      doc.addPage();
      yPosition = margin;
    }

    // Rate Description Table
    doc.setFont('helvetica', 'bold');
    doc.text('RATE DESCRIPTION', margin, yPosition);
    yPosition += 8;

    // Table headers
    const tableHeaders = ['Pieces', 'Gross W.', 'kg/lb', 'Rate Class', 'Item No.', 'Charg. Wei.', 'Rate', 'Total', 'Nature and Quantity'];
    const colWidths = [15, 20, 15, 20, 20, 20, 15, 20, 45];
    let xPos = margin;

    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    tableHeaders.forEach((header, index) => {
      drawBox(xPos, yPosition, colWidths[index], 8);
      doc.text(header, xPos + 1, yPosition + 5);
      xPos += colWidths[index];
    });
    yPosition += 8;

    // Table data
    doc.setFont('helvetica', 'normal');
    data.rateDescription.forEach((item) => {
      xPos = margin;
      const rowData = [
        item.pieces.toString(),
        item.grossWeight.toString(),
        item.kgLb,
        item.rateClass,
        item.itemNo,
        item.chargeableWeight.toString(),
        item.rate.toString(),
        item.total.toString(),
        item.natureAndQuantity
      ];

      rowData.forEach((cellData, index) => {
        drawBox(xPos, yPosition, colWidths[index], 15);
        if (index === 8) { // Nature and Quantity column
          const lines = doc.splitTextToSize(cellData, colWidths[index] - 2);
          doc.text(lines, xPos + 1, yPosition + 4);
        } else {
          doc.text(cellData, xPos + 1, yPosition + 4);
        }
        xPos += colWidths[index];
      });
      yPosition += 15;
    });

    yPosition += 10;

    // Charges Summary
    doc.setFont('helvetica', 'bold');
    doc.text('CHARGES SUMMARY', margin, yPosition);
    yPosition += 8;
    doc.setFont('helvetica', 'normal');
    yPosition = addText(`Weight Charge: ${data.chargesSummary.weightCharge}`, margin, yPosition);
    yPosition = addText(`Valuation Charge: ${data.chargesSummary.valuationCharge}`, margin, yPosition);
    yPosition = addText(`Tax: ${data.chargesSummary.tax}`, margin, yPosition);
    yPosition = addText(`Total Other Due Agent: ${data.chargesSummary.totalOtherDueAgent}`, margin, yPosition);
    yPosition = addText(`Total Other Due Carrier: ${data.chargesSummary.totalOtherDueCarrier}`, margin, yPosition);
    doc.setFont('helvetica', 'bold');
    yPosition = addText(`TOTAL: ${data.chargesSummary.total}`, margin, yPosition);
    yPosition += 10;

    // Other Charges
    if (data.otherCharges.length > 0) {
      doc.setFont('helvetica', 'bold');
      doc.text('OTHER CHARGES', margin, yPosition);
      yPosition += 8;
      doc.setFont('helvetica', 'normal');
      data.otherCharges.forEach((charge) => {
        yPosition = addText(`${charge.description}: ${charge.amount} (${charge.entitlement})`, margin, yPosition);
      });
      yPosition += 10;
    }

    // Execution
    doc.setFont('helvetica', 'bold');
    doc.text('EXECUTION', margin, yPosition);
    yPosition += 8;
    doc.setFont('helvetica', 'normal');
    yPosition = addText(`Date: ${data.executionInfo.executionDate}`, margin, yPosition);
    yPosition = addText(`Place: ${data.executionInfo.executionPlace}`, margin, yPosition);
    yPosition = addText(`Shipper's Signature: ${data.executionInfo.shipperSignature}`, margin, yPosition);
    yPosition = addText(`Carrier's Signature: ${data.executionInfo.carrierSignature}`, margin, yPosition);

    // Save the PDF
    doc.save(`LTA_${data.awbConsignment.awbNumber || 'document'}.pdf`);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <FileText size={64} className="mx-auto text-blue-600 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Generate LTA Document</h2>
        <p className="text-gray-600 mb-6">
          Your LTA document is ready to be generated. Click the button below to create the PDF.
        </p>
        
        <button
          onClick={generatePDF}
          className="bg-blue-600 text-white px-8 py-3 rounded-lg flex items-center gap-3 mx-auto hover:bg-blue-700 transition-colors"
        >
          <Download size={20} />
          Generate PDF
        </button>
      </div>
      
      <div className="bg-gray-50 p-6 rounded-lg">
        <h3 className="text-lg font-semibold mb-4">Document Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium">AWB Number:</span> {data.awbConsignment.awbNumber}
          </div>
          <div>
            <span className="font-medium">Departure:</span> {data.awbConsignment.airportOfDeparture}
          </div>
          <div>
            <span className="font-medium">Shipper:</span> {data.shipper.name}
          </div>
          <div>
            <span className="font-medium">Consignee:</span> {data.consignee.name}
          </div>
          <div>
            <span className="font-medium">Route:</span> {data.flightBooking.route}
          </div>
          <div>
            <span className="font-medium">Flight:</span> {data.flightBooking.flightDate}
          </div>
          <div>
            <span className="font-medium">Currency:</span> {data.chargesDeclaration.currency}
          </div>
          <div>
            <span className="font-medium">Total Amount:</span> {data.chargesSummary.total}
          </div>
        </div>
      </div>
    </div>
  );
};
