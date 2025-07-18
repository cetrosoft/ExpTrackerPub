import { NextResponse } from "next/server"
import { sendEmailNotification, emailTemplates } from "@/lib/email-service"

export async function GET() {
  try {
    console.log("=== Email Test Debug Info ===")
    console.log("RESEND_API_KEY exists:", !!process.env.RESEND_API_KEY)
    console.log("RESEND_API_KEY preview:", process.env.RESEND_API_KEY?.substring(0, 10) + "...")
    console.log("FROM_EMAIL:", process.env.FROM_EMAIL)
    console.log("NEXT_PUBLIC_APP_URL:", process.env.NEXT_PUBLIC_APP_URL)

    const template = emailTemplates.budgetWarning("Test Budget", 1000, 800, 80)

    const result = await sendEmailNotification({
      to: "walid.abdallah.ahmed@gmail.com",
      subject: template.subject,
      html: template.html,
      text: template.text,
    })

    return NextResponse.json({
      success: result,
      message: result ? "Email sent successfully!" : "Failed to send email",
      debug: {
        apiKeyExists: !!process.env.RESEND_API_KEY,
        fromEmail: process.env.FROM_EMAIL,
        appUrl: process.env.NEXT_PUBLIC_APP_URL,
      },
    })
  } catch (error) {
    console.error("Email test failed:", error)
    return NextResponse.json(
      {
        error: "Failed to send test email",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
