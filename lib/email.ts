import nodemailer from "nodemailer";
import path from "path";
import fs from "fs";

// Create reusable transporter - supports both Gmail and custom SMTP
function createTransporter() {
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_APP_PASSWORD;
  
  if (!user || !pass) {
    console.error("Email credentials not configured. Set EMAIL_USER and EMAIL_APP_PASSWORD in .env.local");
    return null;
  }

  // Check if using Gmail/Google Workspace or custom SMTP
  if (process.env.EMAIL_HOST) {
    // Custom SMTP configuration
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT || "587"),
      secure: process.env.EMAIL_SECURE === "true", // true for 465, false for other ports
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

// Get all PDF files from public folder
function getPDFAttachments() {
  try {
    // On Vercel, we need to use the correct path
    const publicDir = path.join(process.cwd(), "public");
    
    // Check if directory exists
    if (!fs.existsSync(publicDir)) {
      console.error("Public directory not found:", publicDir);
      return [];
    }
    
    const files = fs.readdirSync(publicDir);
    const pdfFiles = files.filter((file) => file.toLowerCase().endsWith(".pdf"));
    
    console.log(`Found ${pdfFiles.length} PDF files to attach`);
    
    return pdfFiles.map((file) => ({
      filename: file,
      path: path.join(publicDir, file),
    }));
  } catch (error) {
    console.error("Error reading PDF attachments:", error);
    return [];
  }
}

// Send welcome email to registered students
export async function sendWelcomeEmail(userName: string, userEmail: string) {
  const subject = "Thank You for Registering – Genesis: An Interactive Experience";

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
                  
                  <!-- Highlight box -->
                  <table width="100%" cellpadding="0" cellspacing="0" style="margin: 25px 0;">
                    <tr>
                      <td style="background: linear-gradient(135deg, #2E3093 0%, #2A6BB5 100%); border-radius: 12px; padding: 25px;">
                        <p style="margin: 0; color: #FFFFFF; font-size: 15px; line-height: 1.7;">
                          📎 <strong style="color: #FAE452;">Attached:</strong> Details of our Industrial Training Programmes for your reference. These programmes are carefully structured to bridge academic learning with practical industry exposure.
                        </p>
                      </td>
                    </tr>
                  </table>
                  
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
                  <img src="cid:footerBanner" alt="Suvidya & Accent - Training Programmes" style="width: 100%; height: auto; display: block;" />
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

Thank you for registering for Genesis – An Interactive Experience, jointly presented by Suvidya Institute of Technology. We trust that the session was informative and provided meaningful insights into industry-driven practices and emerging perspectives.

As a follow-up, please find the details of our Industrial Training Programmes attached for your reference. These programmes are carefully structured to bridge academic learning with practical industry exposure and are aligned with current professional and technological requirements.

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

    const pdfAttachments = getPDFAttachments();
    const publicDir = path.join(process.cwd(), "public");
    
    // Add footer banner as embedded attachment
    const footerBannerPath = path.join(publicDir, "unnamed.jpg");
    const attachments = [
      ...pdfAttachments,
      ...(fs.existsSync(footerBannerPath) ? [{
        filename: "unnamed.jpg",
        path: footerBannerPath,
        cid: "footerBanner",
      }] : []),
    ];
    
    console.log(`Preparing to send email to ${userEmail} with ${pdfAttachments.length} PDF attachments`);
    
    const mailOptions = {
      from: `"Suvidya Institute of Technology" <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: subject,
      text: textBody,
      html: htmlBody,
      attachments: attachments,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Welcome email sent successfully:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Error sending welcome email:", error);
    return { success: false, error };
  }
}
