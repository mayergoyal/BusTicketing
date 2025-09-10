// server/emailService.js
require("dotenv").config();
const sgMail = require("@sendgrid/mail");
const PDFDocument = require("pdfkit");

sgMail.setApiKey(process.env.SENDGRIDAPI);

async function sendBookingConfirmation(bookingDetails, userEmail) {
  // 1. Generate PDF in memory
  const pdfBuffer = await new Promise((resolve) => {
    const doc = new PDFDocument({ size: "A4", margin: 50 });
    const buffers = [];

    // PDF Content
    doc.fontSize(20).text("Booking Invoice", { align: "center" });
    doc.moveDown();
    doc.fontSize(12).text(`Booking ID: ${bookingDetails.id}`);
    doc.text(`User ID: ${bookingDetails.userId}`);
    doc.text(`Trip ID: ${bookingDetails.tripId}`);
    doc.text(`Seats Booked: ${bookingDetails.seatIds.length}`);
    doc.moveDown();
    doc
      .fontSize(16)
      .text(`Total Price: $${bookingDetails.totalPrice.toFixed(2)}`);
    doc.end();

    doc.on("data", buffers.push.bind(buffers));
    doc.on("end", () => {
      resolve(Buffer.concat(buffers));
    });
  });

  // 2. Prepare the email
  const msg = {
    to: userEmail, // Change to user's actual email in a real app
    from: "your-verified-email@example.com", // Use an email you've verified with SendGrid
    subject: `Booking Confirmation for Trip ${bookingDetails.tripId}`,
    text: `Your booking is confirmed! Total price: $${bookingDetails.totalPrice.toFixed(
      2
    )}`,
    html: `<strong>Your booking is confirmed!</strong><p>Total price: $${bookingDetails.totalPrice.toFixed(
      2
    )}</p>`,
    attachments: [
      {
        content: pdfBuffer.toString("base64"),
        filename: `invoice-${bookingDetails.id}.pdf`,
        type: "application/pdf",
        disposition: "attachment",
      },
    ],
  };

  // 3. Send the email
  try {
    await sgMail.send(msg);
    console.log("Confirmation email sent successfully");
  } catch (error) {
    console.error("Error sending email:", error.response?.body);
  }
}

module.exports = { sendBookingConfirmation };
