import { NextResponse } from "next/server"
import { Resend } from "resend"
import { EmailService } from "@/lib/email-service"

const resend = new Resend(process.env.RESEND_API_KEY)
const emailService = new EmailService(resend)

export async function POST(request: Request) {
  try {
    const { to, subject, html } = await request.json()

    if (!to || !subject || !html) {
      return NextResponse.json({ error: "Missing required fields: to, subject, html" }, { status: 400 })
    }

    const data = await emailService.sendEmail({
      to,
      subject,
      html,
    })

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error sending notification email:", error)
    return NextResponse.json({ error: "Failed to send notification email" }, { status: 500 })
  }
}
