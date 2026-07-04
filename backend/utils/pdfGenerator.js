const PDFDocument = require('pdfkit');

/**
 * Generates a styled, professional corporate salary slip PDF and streams it directly to the response.
 * @param {object} res - Express Response object.
 * @param {object} payroll - The Mongoose Payroll record (populated).
 */
const generateSalarySlipPDF = (res, payroll) => {
  const doc = new PDFDocument({ size: 'A4', margin: 50 });

  // Stream the compiled PDF content to the response
  doc.pipe(res);

  // Header Title
  doc.fillColor('#1e293b').fontSize(22).text('ENTERPRISE ERP LTD', { align: 'center', bold: true });
  doc.fontSize(9).fillColor('#64748b').text('Corporate Offices, Innovation Plaza, Tech District', { align: 'center' });
  doc.text('Email: finance@enterprise-erp.com | Web: www.enterprise-erp.com', { align: 'center' });
  doc.moveDown(1.5);

  // Section divider
  doc.strokeColor('#cbd5e1').lineWidth(1).moveTo(50, doc.y).lineTo(545, doc.y).stroke();
  doc.moveDown(1.5);

  // Subtitle
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const targetMonth = months[payroll.month - 1];
  doc.fillColor('#0f172a').fontSize(13).text(`SALARY SLIP - ${targetMonth.toUpperCase()} ${payroll.year}`, { align: 'center', bold: true });
  doc.moveDown(1.5);

  // Employee details section grid
  const initialY = doc.y;
  doc.fontSize(9.5).fillColor('#334155');
  doc.text(`Employee Code:  ${payroll.employee_id.employee_code}`, 60, initialY);
  doc.text(`Name:           ${payroll.employee_id.user_id.name}`, 60, initialY + 18);
  doc.text(`Email:          ${payroll.employee_id.user_id.email}`, 60, initialY + 36);

  doc.text(`Designation:    ${payroll.employee_id.designation}`, 320, initialY);
  const deptName = payroll.employee_id.department_id ? payroll.employee_id.department_id.department_name : 'Unassigned';
  doc.text(`Department:     ${deptName}`, 320, initialY + 18);
  doc.text(`Generated At:   ${new Date(payroll.generated_at).toLocaleDateString()}`, 320, initialY + 36);

  doc.moveDown(4);

  // Table border
  doc.strokeColor('#94a3b8').lineWidth(1).moveTo(50, doc.y).lineTo(545, doc.y).stroke();
  doc.moveDown(0.5);

  // Table Headers
  const headerY = doc.y;
  doc.fillColor('#0f172a').text('Salary Details', 65, headerY, { bold: true });
  doc.text('Earnings (USD)', 250, headerY, { bold: true });
  doc.text('Deductions (USD)', 400, headerY, { bold: true });
  doc.moveDown(0.5);

  doc.strokeColor('#cbd5e1').lineWidth(0.8).moveTo(50, doc.y).lineTo(545, doc.y).stroke();
  doc.moveDown(0.8);

  // Row: Basic Salary
  const basicY = doc.y;
  doc.fillColor('#475569').text('Basic Salary', 65, basicY);
  doc.text(`$${payroll.basic_salary.toFixed(2)}`, 250, basicY);
  doc.text('-', 400, basicY);
  doc.moveDown(0.8);

  // Row: Bonus
  const bonusY = doc.y;
  doc.text('Bonus & Allowances', 65, bonusY);
  doc.text(`$${payroll.bonus.toFixed(2)}`, 250, bonusY);
  doc.text('-', 400, bonusY);
  doc.moveDown(0.8);

  // Row: Tax
  const taxY = doc.y;
  doc.text('Professional Tax', 65, taxY);
  doc.text('-', 250, taxY);
  doc.text(`$${payroll.tax.toFixed(2)}`, 400, taxY);
  doc.moveDown(0.8);

  // Row: PF
  const pfY = doc.y;
  doc.text('Provident Fund (PF)', 65, pfY);
  doc.text('-', 250, pfY);
  doc.text(`$${payroll.pf.toFixed(2)}`, 400, pfY);
  doc.moveDown(0.8);

  // Row: Other Deductions
  const dedY = doc.y;
  doc.text('Other Deductions', 65, dedY);
  doc.text('-', 250, dedY);
  doc.text(`$${payroll.deduction.toFixed(2)}`, 400, dedY);
  doc.moveDown(1.2);

  doc.strokeColor('#cbd5e1').lineWidth(0.8).moveTo(50, doc.y).lineTo(545, doc.y).stroke();
  doc.moveDown(1);

  // Calculate gross and total deductions
  const grossEarnings = payroll.basic_salary + payroll.bonus;
  const totalDeductions = payroll.tax + payroll.pf + payroll.deduction;

  // Summaries
  const sumY = doc.y;
  doc.fillColor('#1e293b');
  doc.text(`Gross Earnings: $${grossEarnings.toFixed(2)}`, 200, sumY, { bold: true });
  doc.text(`Total Deductions: $${totalDeductions.toFixed(2)}`, 360, sumY, { bold: true });
  doc.moveDown(1.5);

  // Net payable Box
  const boxY = doc.y;
  doc.rect(50, boxY, 495, 42).fill('#f8fafc');
  doc.fillColor('#0f172a').fontSize(11.5).text(`NET PAYABLE SALARY:  $${payroll.net_salary.toFixed(2)}`, 70, boxY + 15, { bold: true });
  doc.moveDown(4.5);

  // Signatures
  const signatureY = doc.y;
  doc.fontSize(9).fillColor('#64748b').text('Employee Signature', 85, signatureY);
  doc.text('Authorized Finance Officer', 365, signatureY);

  doc.strokeColor('#cbd5e1').lineWidth(0.5).moveTo(65, signatureY - 12).lineTo(175, signatureY - 12).stroke();
  doc.strokeColor('#cbd5e1').lineWidth(0.5).moveTo(355, signatureY - 12).lineTo(485, signatureY - 12).stroke();

  // Close and finalize the document
  doc.end();
};

module.exports = generateSalarySlipPDF;
