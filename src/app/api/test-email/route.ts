import { NextResponse } from "next/server";
import { Resend } from "resend";
import { prisma } from "@/lib/prisma"; // Need to check if prisma is exported from here or use direct import

const resend = new Resend(process.env.RESEND_API_KEY || "dummy-key");

export async function POST(request: Request) {
  try {
    const { email, name } = await request.json();
    if (!email) return NextResponse.json({ error: "Email is required" }, { status: 400 });

    const htmlContent = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>LifeOps Weekly Summary</h2>
        <p>Hi ${name || 'User'},</p>
        <p>This is a test report for your weekly financial health and Adulting Score summary.</p>
        <div style="background: #fdf2f8; padding: 20px; border-radius: 12px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Weekly Snapshot</h3>
          <ul>
            <li><strong>Total Spent:</strong> ₹0.00 (Test)</li>
            <li><strong>Top Category:</strong> FOOD (Test)</li>
            <li><strong>Adulting Score:</strong> 85/100 (Test)</li>
          </ul>
        </div>
        <p>Thanks for using LifeOps!</p>
      </div>
    `;

    if (process.env.RESEND_API_KEY) {
      await resend.emails.send({
        from: "LifeOps <onboarding@resend.dev>",
        to: email,
        subject: "Your LifeOps Weekly Summary (Test)",
        html: htmlContent,
      });
    } else {
      console.log("Mock sending test email to:", email);
      console.log("Content:", htmlContent);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to send test email" }, { status: 500 });
  }
}
