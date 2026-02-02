import nodemailer from "nodemailer";

// Create reusable transporter - supports both Gmail and custom SMTP
function createTransporter() {
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_APP_PASSWORD;

  if (!user || !pass) {
    console.error(
      "Email credentials not configured. Set EMAIL_USER and EMAIL_APP_PASSWORD"
    );
    return null;
  }

  // Check if using Gmail/Google Workspace or custom SMTP
  if (process.env.EMAIL_HOST) {
    // Custom SMTP configuration
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT || "587"),
      secure: process.env.EMAIL_SECURE === "true",
      auth: { user, pass },
    });
  } else {
    // Default to Gmail
    return nodemailer.createTransport({
      service: "gmail",
      auth: { user, pass },
    });
  }
}

// PDF files list - these will be linked via URL
const PDF_FILES = [
  "EDD Batch-no. 27.pdf",
  "Electrical System Design 69weekend.pdf",
  "MEP(Mechanical, Electrical, Plumbling)-weekend31.pdf",
  "Mechanical Design of Process Equipment - Full Time80.pdf",
  "Pdd 37 new.pdf",
  "Piping Engineering  FULLTIME65.pdf",
  "Process Engineering full time 88.pdf",
  "Process Instrumentation & Control - Fulltime64.pdf",
  "Structural Engineering 67 - Full Time.pdf",
];

// Send welcome email to registered students
export async function sendWelcomeEmail(userName: string, userEmail: string) {
  const subject =
    "Thank You for Registering – Genesis: An Interactive Experience";

  // Get base URL from environment or use default
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://genesis-app.vercel.app";

  // Generate PDF download links
  const pdfLinksHtml = PDF_FILES.map(
    (file) =>
      `<li style="margin: 8px 0;"><a href="${baseUrl}/${encodeURIComponent(file)}" style="color: #2A6BB5; text-decoration: none; font-weight: 500;">📄 ${file.replace(".pdf", "")}</a></li>`
  ).join("");

  const htmlBody = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; background-color: #f4f4f4; font-family: 'Segoe UI', Arial, sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 40px 20px;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #FFFFFF; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(46, 48, 147, 0.15);">
              
              <!-- Header with gradient -->
              <tr>
                <td style="background: linear-gradient(135deg, #2E3093 0%, #2A6BB5 100%); padding: 40px 30px; text-align: center;">
                </td>
              </tr>
              
              <!-- Yellow accent bar -->
              <tr>
                <td style="background-color: #FAE452; height: 6px;"></td>
              </tr>
              
              <!-- Main content -->
              <tr>
                <td style="padding: 40px 35px;">
                  <h2 style="margin: 0 0 20px 0; color: #2E3093; font-size: 22px; font-weight: 600;">
                    Dear ${userName},
                  </h2>
                  
                  <p style="margin: 0 0 18px 0; color: #333333; font-size: 15px; line-height: 1.7;">
                    Thank you for registering for <strong style="color: #2E3093;">Genesis – An Interactive Experience</strong>, presented by <strong style="color: #2A6BB5;">Suvidya Institute of Technology</strong> and <strong style="color: #2A6BB5;">Accent Techno Solutions</strong>.
                  </p>
                  
                  <p style="margin: 0 0 18px 0; color: #333333; font-size: 15px; line-height: 1.7;">
                    We trust that the session was informative and provided meaningful insights into industry-driven practices and emerging perspectives.
                  </p>
                  
                  <!-- Highlight box with download links -->
                  <table width="100%" cellpadding="0" cellspacing="0" style="margin: 25px 0;">
                    <tr>
                      <td style="background: linear-gradient(135deg, #2E3093 0%, #2A6BB5 100%); border-radius: 12px; padding: 25px;">
                        <p style="margin: 0 0 15px 0; color: #FFFFFF; font-size: 15px; line-height: 1.7;">
                          📎 <strong style="color: #FAE452;">Industrial Training Programmes:</strong>
                        </p>
                        <p style="margin: 0; color: #FFFFFF; font-size: 14px; line-height: 1.6;">
                          These programmes are carefully structured to bridge academic learning with practical industry exposure.
                        </p>
                      </td>
                    </tr>
                  </table>
                  
                  <!-- PDF Download Links -->
                  <div style="background-color: #f8f9fa; border-radius: 10px; padding: 20px; margin: 20px 0;">
                    <p style="margin: 0 0 12px 0; color: #2E3093; font-size: 15px; font-weight: 600;">
                      📥 Download Programme Details:
                    </p>
                    <ul style="margin: 0; padding-left: 20px; list-style: none;">
                      ${pdfLinksHtml}
                    </ul>
                  </div>
                  
                  <p style="margin: 0 0 18px 0; color: #333333; font-size: 15px; line-height: 1.7;">
                    Should you require any additional information or wish to discuss the programmes in greater detail, please do not hesitate to contact us. We will be glad to assist you.
                  </p>
                  
                  <p style="margin: 0; color: #333333; font-size: 15px; line-height: 1.7;">
                    We appreciate your participation and look forward to future engagement.
                  </p>
                </td>
              </tr>
              
              <!-- Divider -->
              <tr>
                <td style="padding: 0 35px;">
                  <div style="height: 1px; background: linear-gradient(to right, transparent, #2A6BB5, transparent);"></div>
                </td>
              </tr>
              
              <!-- Footer -->
              <tr>
                <td style="padding: 30px 35px; background-color: #fafafa;">
                  <p style="margin: 0 0 5px 0; color: #2E3093; font-size: 15px; font-weight: 600;">
                    Best regards,
                  </p>
                  <p style="margin: 0; color: #2A6BB5; font-size: 14px; font-weight: 500;">
                    Suvidya Institute of Technology
                  </p>
                </td>
              </tr>
              
              <!-- Footer Banner Image -->
              <tr>
                <td style="padding: 0;">
                  <img src="${baseUrl}/unnamed.jpg" alt="Suvidya & Accent - Training Programmes" style="width: 100%; height: auto; display: block;" />
                </td>
              </tr>
              
              <!-- Bottom bar -->
              <tr>
                <td style="background: linear-gradient(135deg, #2E3093 0%, #2A6BB5 100%); padding: 15px; text-align: center;">
                  <p style="margin: 0; color: #FFFFFF; font-size: 12px; opacity: 0.8;">
                    © 2026 Genesis Interactive Experience. All rights reserved.
                  </p>
                </td>
              </tr>
              
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  const textBody = `
Dear ${userName},

Thank you for registering for Genesis – An Interactive Experience, presented by Suvidya Institute of Technology and Accent Techno Solutions. We trust that the session was informative and provided meaningful insights into industry-driven practices and emerging perspectives.

Download our Industrial Training Programme details here:
${PDF_FILES.map((file) => `- ${baseUrl}/${encodeURIComponent(file)}`).join("\n")}

Should you require any additional information or wish to discuss the programmes in greater detail, please do not hesitate to contact us. We will be glad to assist you.

We appreciate your participation and look forward to future engagement.

Best regards,
Suvidya Institute of Technology
  `;

  try {
    const transporter = createTransporter();

    if (!transporter) {
      console.error("Email transporter not configured");
      return { success: false, error: "Email not configured" };
    }

    console.log(`Preparing to send email to ${userEmail}`);

    const mailOptions = {
      from: `"Suvidya Institute of Technology" <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: subject,
      text: textBody,
      html: htmlBody,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Welcome email sent successfully:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Error sending welcome email:", error);
    return { success: false, error };
  }
}
