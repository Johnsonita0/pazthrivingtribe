const { jsPDF } = require('jspdf');
const fs = require('fs');
const path = require('path');

const output = path.resolve(__dirname, '..', 'admin-dashboard-guide.pdf');
const logoPath = path.resolve(__dirname, '..', 'public', 'logo', 'logomain.png');
const pdf = new jsPDF({ unit: 'mm', format: 'a4' });
const pageWidth = 210;
const margin = 16;
const contentWidth = pageWidth - margin * 2;
let pageNumber = 0;

const colors = {
  ink: [24, 35, 42], muted: [83, 108, 102], green: [31, 150, 99],
  paleGreen: [237, 248, 242], orange: [239, 142, 36], blue: [47, 134, 255],
  line: [218, 229, 224], pale: [248, 251, 249], pink: [217, 31, 117]
};

function text(value, x, y, size = 10, color = colors.ink, style = 'normal', options = {}) {
  pdf.setFont('helvetica', style); pdf.setFontSize(size); pdf.setTextColor(...color);
  pdf.text(String(value), x, y, options);
}

function wrapped(value, x, y, width, size = 10, color = colors.ink, style = 'normal', gap = 5) {
  pdf.setFont('helvetica', style); pdf.setFontSize(size);
  const lines = pdf.splitTextToSize(String(value), width); pdf.setTextColor(...color); pdf.text(lines, x, y);
  return y + lines.length * gap;
}

function panel(x, y, w, h, fill = colors.pale) {
  pdf.setFillColor(...fill); pdf.setDrawColor(...colors.line); pdf.roundedRect(x, y, w, h, 4, 4, 'FD');
}

function button(label, x, y, w, fill = [255, 255, 255], color = colors.ink) {
  pdf.setFillColor(...fill); pdf.setDrawColor(...colors.line); pdf.roundedRect(x, y, w, 9, 2, 2, 'FD');
  text(label, x + w / 2, y + 5.8, 7.3, color, 'bold', { align: 'center' });
}

function bullet(label, body, x, y, width) {
  pdf.setFillColor(...colors.green); pdf.circle(x + 1.5, y - 1.5, 1.3, 'F');
  text(label, x + 6, y, 10, colors.ink, 'bold');
  return wrapped(body, x + 6, y + 5, width - 6, 9.2, colors.muted, 'normal', 4.6) + 5;
}

function header(title, subtitle) {
  pageNumber += 1; pdf.setFillColor(...colors.green); pdf.rect(0, 0, pageWidth, 12, 'F');
  text('PAZ THRIVING TRIBE  |  ADMIN GUIDE', margin, 8, 7, [255, 255, 255], 'bold');
  text(`Page ${pageNumber}`, pageWidth - margin, 8, 7, [255, 255, 255], 'normal', { align: 'right' });
  text(title, margin, 27, 21, colors.ink, 'bold'); wrapped(subtitle, margin, 35, contentWidth, 10, colors.muted, 'normal', 5);
}

function footer() {
  pdf.setDrawColor(...colors.line); pdf.line(margin, 282, pageWidth - margin, 282);
  text('Use your own administrator credentials. Never share passwords in screenshots or guides.', margin, 288, 7.5, colors.muted);
}

function newPage(title, subtitle) { pdf.addPage(); header(title, subtitle); }

function loginScreen(x, y, w, h) {
  panel(x, y, w, h, [244, 244, 244]); const cardX = x + 10; const cardW = w - 20;
  panel(cardX, y + 8, cardW, h - 16, [240, 242, 243]); pdf.setFillColor(255, 255, 255);
  pdf.roundedRect(x + w / 2 - 15, y + 15, 30, 25, 6, 6, 'F');
  pdf.addImage(fs.readFileSync(logoPath), 'PNG', x + w / 2 - 11, y + 17, 22, 21);
  text('YOUR WEBAPP ADMIN PORTAL', x + w / 2, y + 48, 5.8, colors.muted, 'bold', { align: 'center' });
  text('Admin Login', x + w / 2, y + 59, 16, colors.ink, 'bold', { align: 'center' });
  text('pazthrivingtribe.org/admin', x + w / 2, y + 66, 6.2, colors.green, 'bold', { align: 'center' });
  text('Email', cardX + 10, y + 79, 8.2, colors.ink, 'bold'); panel(cardX + 10, y + 82, cardW - 20, 13, [221, 232, 241]);
  text('pazthrivingtribe@gmail.com', cardX + 18, y + 90.5, 6.8, colors.muted); text('Password', cardX + 10, y + 105, 8.2, colors.ink, 'bold');
  panel(cardX + 10, y + 108, cardW - 20, 13, [221, 232, 241]); text('Enter password', cardX + 18, y + 116.5, 7.6, colors.muted);
  button('Sign in', cardX + 10, y + 128, cardW - 20, colors.pink, [255, 255, 255]);
  wrapped('Use an authorized administrator account. Never share login credentials.', cardX + 13, y + 143, cardW - 26, 7.6, colors.muted, 'normal', 4);
}

function dashboardScreen(x, y, w, h) {
  panel(x, y, w, h, [243, 242, 240]); text('Admin dashboard', x + 10, y + 14, 15, colors.ink, 'bold');
  text('Overview of survey responses, contact submissions, and parent testimonials.', x + 10, y + 22, 7, colors.muted);
  const cards = [['Visitors', '24', colors.blue], ['Teens Reg', '8', colors.orange], ['Bookings', '5', colors.green], ['Messages', '12', [34, 165, 100]], ['Store & Orders', '7', [245, 158, 11]], ['Testimonials', '6', [124, 58, 237]], ['Published Slider', '6', [15, 118, 110]], ['Parent Feedback', '4', [232, 135, 103]]];
  cards.forEach((card, index) => { const col = index % 4; const row = Math.floor(index / 4); const cx = x + 10 + col * ((w - 30) / 4); const cy = y + 30 + row * 25; pdf.setFillColor(...card[2]); pdf.roundedRect(cx, cy, (w - 40) / 4, 19, 3, 3, 'F'); text(card[0], cx + (w - 40) / 8, cy + 7, 6, [255, 255, 255], 'bold', { align: 'center' }); text(card[1], cx + (w - 40) / 8, cy + 15, 11, [255, 255, 255], 'bold', { align: 'center' }); });
  text('Visitors', x + 10, y + 88, 12, colors.ink, 'bold'); button('Refresh', x + 10, y + 94, 24, colors.paleGreen, colors.green); button('All rows', x + 37, y + 94, 25); button('Selected rows (0)', x + 65, y + 94, 34); button('Delete selected (0)', x + 102, y + 94, 37); button('Preview PDF', x + 141, y + 94, 31); button('Print responses', x + 175, y + 94, 34, [79, 70, 229], [255, 255, 255]);
  panel(x + 10, y + 110, w - 20, h - 120, [255, 255, 255]); text('Select  |  Page  |  IP address  |  Device  |  Location  |  Visited at  |  Actions', x + 16, y + 122, 7, colors.muted, 'bold'); text('Home     192.0.2.4       Mobile       Unknown       Today  |  View  Delete', x + 16, y + 135, 7, colors.ink); text('Tip: click a colored summary card to change the active data page.', x + 16, y + h - 8, 7.5, colors.muted, 'italic');
}

header('Admin Dashboard User Guide', 'A practical walkthrough from secure login to daily dashboard work.');
text('PAZ Thriving Tribe', margin, 59, 14, colors.green, 'bold');
wrapped('This guide covers the current admin portal at /admin and /dashboard. It is written for administrators who review submissions, manage the digital store, update public content, and inspect payments.', margin, 68, 92, 10.5, colors.ink, 'normal', 5.2);
loginScreen(116, 48, 78, 126); text('LOGIN SCREEN', 116, 181, 7, colors.green, 'bold');
text('Main website: https://pazthrivingtribe.org', margin, 88, 9.2, colors.green, 'bold');
text('Admin login: https://pazthrivingtribe.org/admin', margin, 96, 9.2, colors.ink, 'bold');
text('Authorized admin: pazthrivingtribe@gmail.com', margin, 104, 9.2, colors.ink, 'bold');
let y = 101;
y = bullet('1. Open the portal', 'Go to the PAZ website admin address and open the Admin Login page.', margin, y, 92);
y = bullet('2. Enter email', 'Use an administrator email that is authorized in Supabase and the server ADMIN_EMAILS setting.', margin, y, 92);
y = bullet('3. Enter password', 'Type the password for that administrator account. The guide does not include credentials.', margin, y, 92);
bullet('4. Sign in', 'Select Sign in. A successful login redirects to /dashboard. An error appears below the form if authentication fails.', margin, y, 92); footer();

newPage('1. Dashboard Overview', 'The dashboard is a card-based control center. Each colored card opens a different working view.'); dashboardScreen(margin, 49, contentWidth, 133); y = 194;
y = bullet('Summary cards', 'Visitors, Teens Reg, Bookings, Messages, Store & Orders, Testimonials, Published Slider, and Parent Feedback. The number is the current record count.', margin, y, contentWidth);
y = bullet('Refresh', 'Reloads the latest records from Supabase and commerce tables. Use it before making decisions about new submissions or orders.', margin, y, contentWidth);
y = bullet('Select all', 'The checkbox in the table header selects every currently filtered row. Individual checkboxes select specific records.', margin, y, contentWidth);
bullet('View', 'Opens the full record in a detail window. For feedback and testimonials, the window is formatted for reading and printing.', margin, y, contentWidth); footer();

newPage('2. Records and Response Actions', 'Use the data views to review visitor activity, applications, messages, bookings, and feedback.'); y = 55;
[['Visitors', 'Review pages visited, IP address, device, location, and visit time.'], ['Teens Reg', 'Review child or applicant name, parent contact details, program, school, session, focus, and submission time.'], ['Bookings', 'Review requested program, date, time, session format, notes, and contact details.'], ['Messages', 'Read contact form messages, subject, sender, and email address.'], ['Parent Feedback', 'Open the full mentoring feedback response, including impact, satisfaction, recommendations, and testimonial text.'], ['Testimonials', 'Review submitted testimonials. Open a row and use Post testimonial to prepare it for the home-page slider.'], ['Published Slider', 'Review testimonials currently visible in the public Client Voices slider. Use Unpost to remove a selected testimonial from the slider.']].forEach(([title, body]) => { y = bullet(title, body, margin, y, contentWidth); });
panel(margin, y + 4, contentWidth, 43, [255, 248, 248]); text('Deletion rule', margin + 7, y + 15, 11, [153, 27, 27], 'bold'); wrapped('Delete selected and the row-level Delete / Unpost button always ask for confirmation first. Deletion is permanent for ordinary records. Unpost removes a testimonial from the public slider.', margin + 7, y + 23, contentWidth - 14, 9.5, colors.muted, 'normal', 4.8); footer();

newPage('3. Filters, PDF, and Printing', 'The table toolbar supports focused review and printable records.'); y = 57;
y = bullet('Filters', 'Some views provide dropdown filters, such as Page, Program, Parent, Subject, Format, Origin, Source, Duration, Impact, Satisfaction, and Recommendation.', margin, y, contentWidth);
y = bullet('Clear', 'Select Clear beside the filters to return to all values for the active view.', margin, y, contentWidth);
y = bullet('Preview PDF', 'Use this control when a PDF preview is available for the current response workflow. Review the selected data before printing.', margin, y, contentWidth);
y = bullet('Print responses', 'Prints the visible response set through the browser print dialog. Choose a printer or Save as PDF.', margin, y, contentWidth);
bullet('Record Print', 'Open View on an individual record, then select Print in the detail header. The response is formatted for A4 printing.', margin, y, contentWidth);
panel(margin, 157, contentWidth, 54, [247, 250, 252]); text('Recommended review routine', margin + 8, 169, 11, colors.ink, 'bold');
['Refresh the view.', 'Apply one filter at a time.', 'Open the record with View.', 'Print or export only what is needed.', 'Delete only after confirmation.'].forEach((item, index) => text(`${index + 1}. ${item}`, margin + 10, 179 + index * 7, 9.2, colors.muted)); footer();

newPage('4. Storefront: Products', 'Store & Orders opens a second set of tabs for digital products and customer commerce.'); y = 55;
panel(margin, y, contentWidth, 83, [255, 255, 255]); text('Store  |  Pay  |  Orders', margin + 8, y + 11, 10, colors.ink, 'bold'); text('Product manager', margin + 8, y + 25, 14, colors.ink, 'bold');
['Ebook title', 'Category', 'Description', 'Amount + Currency', 'Product file (PDF or ZIP)', 'Free product', 'Availability + Stock count', 'Cover image'].forEach((item, index) => { const col = index % 2; const row = Math.floor(index / 2); const bx = margin + 8 + col * 83; const by = y + 32 + row * 11; panel(bx, by, 75, 8, [248, 250, 252]); text(item, bx + 3, by + 5.5, 6.8, colors.muted); });
button('Add product', margin + 8, y + 72, 30, colors.orange, [255, 255, 255]); y = 151;
y = bullet('Add product', 'Complete the title, category, description, price, currency, file, availability, stock count, and cover image. A product file is required for a new digital product.', margin, y, contentWidth);
y = bullet('Edit', 'Loads an existing product back into the editor. Change the fields and select Update product.', margin, y, contentWidth);
y = bullet('Mark sold out / Mark available', 'Toggles public availability and updates the stock count behavior.', margin, y, contentWidth);
y = bullet('Delete', 'Opens a confirmation dialog, then removes the product from the storefront and shop pages.', margin, y, contentWidth);
bullet('Cancel', 'Appears while editing and clears the editor without saving changes.', margin, y, contentWidth); footer();

newPage('5. Payments and Orders', 'Use Pay and Orders to audit checkout activity and inspect individual orders.'); y = 56;
y = bullet('Pay tab', 'Shows payment history with order number, customer, amount, Paystack reference, status, and date. Select a row to open order review.', margin, y, contentWidth);
y = bullet('Orders tab', 'Shows recent customer orders, items, totals, payment status, delivery status, email, and date. Select a row to open details.', margin, y, contentWidth);
y = bullet('Order review', 'The detail window shows customer information, payment confirmation, amount, item quantities, and proof of payment when available.', margin, y, contentWidth);
y = bullet('View image', 'When payment proof exists, opens the proof image in a larger preview. Close the preview with the close control or outside click.', margin, y, contentWidth);
bullet('Close', 'Closes the order review window without changing the order.', margin, y, contentWidth);
panel(margin, 165, contentWidth, 57, [255, 249, 238]); text('Payment safety', margin + 8, 177, 11, [146, 83, 9], 'bold'); wrapped('Treat Pending as unconfirmed. Confirm the payment status and proof before taking any manual fulfillment action. The dashboard reads Paystack and Supabase data; it does not replace the payment provider audit trail.', margin + 8, 186, contentWidth - 16, 9.5, colors.muted, 'normal', 4.8); footer();

newPage('6. Content, Social, Programs, and Settings', 'The application also includes administrative content controls connected to the Page Content tabs.'); y = 55;
y = bullet('Page Content', 'Choose a service, edit title, subtitle, description, and metric, then save the content update. Review the success or error message after saving.', margin, y, contentWidth);
y = bullet('Social Preview', 'Choose a platform, enter the URL, fetch metadata when needed, review title and summary, then save the preview.', margin, y, contentWidth);
y = bullet('Programs', 'Create a program with service, title, description, duration, schedule, and level. Remove outdated programs after confirmation where provided.', margin, y, contentWidth);
y = bullet('Applicants', 'Use the Applicants tab for registration-related administration and review of submitted teen records.', margin, y, contentWidth);
bullet('Payment Settings', 'Review and maintain payment configuration such as the Paystack public key and teen/kids monthly fee according to your deployment process.', margin, y, contentWidth);
panel(margin, 170, contentWidth, 48, colors.paleGreen); text('Save-state checklist', margin + 8, 183, 11, colors.green, 'bold'); wrapped('After any change, confirm the success toast, refresh the page, and verify the public page or table reflects the new value. A local preview message does not always mean the server update succeeded.', margin + 8, 192, contentWidth - 16, 9.5, colors.muted, 'normal', 4.8); footer();

newPage('7. Troubleshooting and Logout', 'A short operating checklist for common admin tasks.'); y = 57;
y = bullet('Login error', 'Check the email, password, internet connection, and that the email is authorized as an administrator. Do not repeatedly guess passwords.', margin, y, contentWidth);
y = bullet('No records', 'Select Refresh. If the table remains empty, check whether submissions exist and whether Supabase environment variables and policies are configured.', margin, y, contentWidth);
y = bullet('Save failed', 'Read the error toast, confirm the session is still active, and try again. Server-side admin updates require the configured admin endpoint and service role environment variables.', margin, y, contentWidth);
y = bullet('Stale commerce data', 'Open Store & Orders and refresh the browser after checking that the relevant Supabase commerce tables contain data.', margin, y, contentWidth);
bullet('Logout', 'Use the application logout control when available in the dashboard navigation. Explicit sign-out is preferred on shared computers.', margin, y, contentWidth);
panel(margin, 178, contentWidth, 48, [244, 244, 244]); text('Administrator habit', margin + 8, 190, 11, colors.ink, 'bold'); wrapped('Refresh before review, confirm before deletion, verify after saving, and keep credentials private. This keeps the dashboard accurate and reduces accidental changes.', margin + 8, 199, contentWidth - 16, 9.8, colors.muted, 'normal', 4.8); footer();

fs.writeFileSync(output, Buffer.from(pdf.output('arraybuffer')));
console.log(`Created ${output}`);