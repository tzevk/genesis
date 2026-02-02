import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import path from "path";
import fs from "fs";
import { getDatabase } from "@/lib/mongodb";

// Create transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD,
  },
});

// Get all PDF files from public folder
function getPDFAttachments() {
  const publicDir = path.join(process.cwd(), "public");
  const files = fs.readdirSync(publicDir);
  const pdfFiles = files.filter((file) => file.toLowerCase().endsWith(".pdf"));
  return pdfFiles.map((file) => ({
    filename: file,
    path: path.join(publicDir, file),
  }));
}

// Send email to a user
async function sendEmailToUser(userName: string, userEmail: string) {
  const subject = "Thank You for Registering – Genesis: An Interactive Experience";
  const publicDir = path.join(process.cwd(), "public");

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
                  <h1 style="margin: 0; color: #FAE452; font-size: 28px; font-weight: 700; letter-spacing: 1px;">
                    GENESIS
                  </h1>
                  <p style="margin: 8px 0 0 0; color: #FFFFFF; font-size: 14px; opacity: 0.9;">
                    An Interactive Experience
                  </p>
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
                    Thank you for registering for <strong style="color: #2E3093;">Genesis – An Interactive Experience</strong>, jointly presented by <strong style="color: #2A6BB5;">Suvidya Institute of Technology</strong> and <strong style="color: #2A6BB5;">Accent Techno Solutions</strong>.
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
                  <p style="margin: 0; color: #2A6BB5; font-size: 14px; font-weight: 500;">
                    Accent Techno Solutions
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

  const pdfAttachments = getPDFAttachments();
  const footerBannerPath = path.join(publicDir, "unnamed.jpg");

  const attachments = [
    ...pdfAttachments,
    ...(fs.existsSync(footerBannerPath)
      ? [{ filename: "unnamed.jpg", path: footerBannerPath, cid: "footerBanner" }]
      : []),
  ];

  const mailOptions = {
    from: `"Suvidya Institute of Technology" <${process.env.EMAIL_USER}>`,
    to: userEmail,
    subject: subject,
    html: htmlBody,
    attachments: attachments,
  };

  await transporter.sendMail(mailOptions);
}

// GET - Process and send pending emails
export async function GET() {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_APP_PASSWORD) {
      return NextResponse.json({ error: "Email not configured" }, { status: 500 });
    }

    const db = await getDatabase();
    const users = db.collection("users");

    // Find students who haven't received email yet
    const pendingUsers = await users
      .find({
        userType: "student",
        email: { $exists: true, $ne: null },
        emailSent: { $ne: true },
      })
      .toArray();

    if (pendingUsers.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No pending emails to send",
        processed: 0,
      });
    }

    const results: { email: string; status: string; error?: string }[] = [];

    for (const user of pendingUsers) {
      try {
        await sendEmailToUser(user.name, user.email);
        
        // Mark as sent
        await users.updateOne(
          { _id: user._id },
          { $set: { emailSent: true, emailSentAt: new Date() } }
        );

        results.push({ email: user.email, status: "sent" });
        console.log(`✅ Email sent to: ${user.email}`);
        
        // Small delay between emails to avoid rate limiting
        await new Promise((resolve) => setTimeout(resolve, 1000));
      } catch (error) {
        results.push({
          email: user.email,
          status: "failed",
          error: error instanceof Error ? error.message : String(error),
        });
        console.error(`❌ Failed to send to ${user.email}:`, error);
      }
    }

    const sent = results.filter((r) => r.status === "sent").length;
    const failed = results.filter((r) => r.status === "failed").length;

    return NextResponse.json({
      success: true,
      message: `Processed ${pendingUsers.length} emails`,
      sent,
      failed,
      results,
    });
  } catch (error) {
    console.error("Error processing emails:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to process emails" },
      { status: 500 }
    );
  }
}
