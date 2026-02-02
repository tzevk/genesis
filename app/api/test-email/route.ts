import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function GET() {
  const results: Record<string, unknown> = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  };

  // Check environment variables
  results.emailUserSet = !!process.env.EMAIL_USER;
  results.emailPasswordSet = !!process.env.EMAIL_APP_PASSWORD;
  results.emailUser = process.env.EMAIL_USER ? `${process.env.EMAIL_USER.substring(0, 5)}...` : "NOT SET";
  results.baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "NOT SET";

  if (!process.env.EMAIL_USER || !process.env.EMAIL_APP_PASSWORD) {
    return NextResponse.json({
      ...results,
      error: "Email credentials not configured",
    });
  }

  // Try to create transporter and send test email
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_APP_PASSWORD,
      },
    });

    // Verify connection
    await transporter.verify();
    results.smtpConnection = "SUCCESS";

    // Send test email
    const info = await transporter.sendMail({
      from: `"Test" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER, // Send to self
      subject: "Vercel Email Test",
      text: "If you receive this, email is working on Vercel!",
    });

    results.emailSent = true;
    results.messageId = info.messageId;

    return NextResponse.json({
      success: true,
      ...results,
    });
  } catch (error) {
    results.smtpConnection = "FAILED";
    results.error = error instanceof Error ? error.message : String(error);
    results.errorStack = error instanceof Error ? error.stack : undefined;

    return NextResponse.json({
      success: false,
      ...results,
    });
  }
}
