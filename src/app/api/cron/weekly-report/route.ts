import { NextResponse } from "next/server";
import { Resend } from "resend";
import { prisma } from "@/lib/prisma";

const resend = new Resend(process.env.RESEND_API_KEY || "dummy-key");

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("Authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const usersToEmail = await prisma.user.findMany({
      where: {
        settings: {
          weeklyEmailsEnabled: true,
        },
      },
      include: {
        settings: true,
      },
    });

    if (usersToEmail.length === 0) {
      return NextResponse.json({ message: "No users opted in for weekly emails." });
    }

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    for (const user of usersToEmail) {
      // Aggregate expenses
      const expenses = await prisma.expense.findMany({
        where: {
          userId: user.id,
          date: { gte: sevenDaysAgo },
        },
      });

      const totalSpent = expenses.reduce((sum, exp) => sum + Number(exp.amount), 0);
      
      const categoryTotals = expenses.reduce((acc, exp) => {
        acc[exp.category] = (acc[exp.category] || 0) + Number(exp.amount);
        return acc;
      }, {} as Record<string, number>);

      let topCategory = "None";
      let maxCatSpend = 0;
      for (const [cat, amt] of Object.entries(categoryTotals)) {
        if (amt > maxCatSpend) {
          maxCatSpend = amt;
          topCategory = cat;
        }
      }

      // Aggregate Adulting Scores
      const scores = await prisma.adultingScore.findMany({
        where: {
          userId: user.id,
          createdAt: { gte: sevenDaysAgo },
        },
      });

      const avgScore = scores.length > 0 
        ? Math.round(scores.reduce((sum, s) => sum + s.score, 0) / scores.length) 
        : "N/A";

      const currency = user.settings?.currency || "INR";

      const htmlContent = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
          <h2 style="color: #db2777;">LifeOps Weekly Summary</h2>
          <p>Hi ${user.name || 'User'},</p>
          <p>Here is your financial health and Adulting Score summary for the past 7 days.</p>
          
          <div style="background: #fdf2f8; padding: 20px; border-radius: 12px; margin: 20px 0; border: 1px solid #fbcfe8;">
            <h3 style="margin-top: 0; color: #9d174d;">Weekly Snapshot</h3>
            <ul style="list-style: none; padding: 0;">
              <li style="margin-bottom: 10px;"><strong>Total Spent:</strong> ${currency} ${totalSpent.toFixed(2)}</li>
              <li style="margin-bottom: 10px;"><strong>Top Category:</strong> ${topCategory}</li>
              <li style="margin-bottom: 10px;"><strong>Average Adulting Score:</strong> ${avgScore}${typeof avgScore === 'number' ? '/100' : ''}</li>
            </ul>
          </div>
          
          <p>Keep up the great work!</p>
          <p style="font-size: 12px; color: #6b7280; margin-top: 40px;">
            You are receiving this email because you opted in to weekly summaries in your LifeOps settings.
          </p>
        </div>
      `;

      if (process.env.RESEND_API_KEY && user.email) {
        await resend.emails.send({
          from: "LifeOps <onboarding@resend.dev>",
          to: user.email,
          subject: "Your LifeOps Weekly Summary",
          html: htmlContent,
        });
      } else {
        console.log(`Mock sent to ${user.email}: Total ${totalSpent}, Top Cat ${topCategory}, Score ${avgScore}`);
      }
    }

    return NextResponse.json({ success: true, processed: usersToEmail.length });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to process weekly reports" }, { status: 500 });
  }
}
