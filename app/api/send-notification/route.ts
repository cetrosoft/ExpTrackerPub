import { type NextRequest, NextResponse } from "next/server"
import { sendEmailNotification, emailTemplates } from "@/lib/email-service"

export async function POST(request: NextRequest) {
  try {
    const { type, data, userEmail } = await request.json()

    if (!userEmail) {
      return NextResponse.json({ error: "User email is required" }, { status: 400 })
    }

    let template
    switch (type) {
      case "budget_exceeded":
        template = emailTemplates.budgetExceeded(data.budgetName, data.amount, data.spentAmount)
        break
      case "budget_warning":
        template = emailTemplates.budgetWarning(data.budgetName, data.amount, data.spentAmount, data.percentage)
        break
      default:
        return NextResponse.json({ error: "Invalid notification type" }, { status: 400 })
    }

    const success = await sendEmailNotification({
      to: userEmail,
      subject: template.subject,
      html: template.html,
      text: template.text,
    })

    return NextResponse.json({ success })
  } catch (error) {
    console.error("Error in send-notification API:", error)
    return NextResponse.json({ error: "Failed to send notification" }, { status: 500 })
  }
}
