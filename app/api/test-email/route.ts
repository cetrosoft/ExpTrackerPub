import { NextResponse } from "next/server"
import { Resend } from "resend"
import { EmailService } from "@/lib/email-service"

const resend = new Resend(process.env.RESEND_API_KEY)
const emailService = new EmailService(resend)

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const toEmail = searchParams.get("to") || "test@example.com"
  const subject = searchParams.get("subject") || "Test Email from Expense Tracker"
  const htmlContent = searchParams.get("html") || "<p>This is a test email from your Expense Tracker application.</p>"

  try {
    const data = await emailService.sendEmail({
      to: toEmail,
      subject: subject,
      html: htmlContent,
    })

    return NextResponse.json({ message: "Test email sent successfully", data })
  } catch (error) {
    console.error("Error sending test email:", error)
    return NextResponse.json({ error: "Failed to send test email" }, { status: 500 })
  }
}
