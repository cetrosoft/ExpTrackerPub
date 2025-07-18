// This file should only be used on the server side
interface EmailNotification {
  to: string
  subject: string
  html: string
  text?: string
}

interface EmailTemplate {
  subject: string
  html: string
  text: string
}

// Email templates
export const emailTemplates = {
  budgetExceeded: (budgetName: string, amount: number, spentAmount: number): EmailTemplate => ({
    subject: `🚨 Budget Alert: ${budgetName} Budget Exceeded`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #dc2626; color: white; padding: 20px; text-align: center;">
          <h1 style="margin: 0;">🚨 Budget Exceeded!</h1>
        </div>
        <div style="padding: 20px; background-color: #f9fafb;">
          <h2 style="color: #374151;">Your ${budgetName} budget has been exceeded</h2>
          <div style="background-color: white; padding: 15px; border-radius: 8px; margin: 15px 0;">
            <p><strong>Budget Limit:</strong> $${amount.toFixed(2)}</p>
            <p><strong>Amount Spent:</strong> $${spentAmount.toFixed(2)}</p>
            <p><strong>Over Budget:</strong> $${(spentAmount - amount).toFixed(2)}</p>
          </div>
          <p>Consider reviewing your expenses and adjusting your budget if necessary.</p>
          <div style="text-align: center; margin: 20px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/budgets" 
               style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
              View Budget Details
            </a>
          </div>
        </div>
        <div style="text-align: center; padding: 20px; color: #6b7280; font-size: 14px;">
          <p>ExpenseTracker - Manage your finances with ease</p>
        </div>
      </div>
    `,
    text: `Budget Alert: Your ${budgetName} budget has been exceeded. Budget: $${amount.toFixed(2)}, Spent: $${spentAmount.toFixed(2)}, Over: $${(spentAmount - amount).toFixed(2)}`,
  }),

  budgetWarning: (budgetName: string, amount: number, spentAmount: number, percentage: number): EmailTemplate => ({
    subject: `⚠️ Budget Warning: ${budgetName} at ${percentage.toFixed(0)}%`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #f59e0b; color: white; padding: 20px; text-align: center;">
          <h1 style="margin: 0;">⚠️ Budget Warning</h1>
        </div>
        <div style="padding: 20px; background-color: #f9fafb;">
          <h2 style="color: #374151;">Your ${budgetName} budget is at ${percentage.toFixed(0)}%</h2>
          <div style="background-color: white; padding: 15px; border-radius: 8px; margin: 15px 0;">
            <p><strong>Budget Limit:</strong> $${amount.toFixed(2)}</p>
            <p><strong>Amount Spent:</strong> $${spentAmount.toFixed(2)}</p>
            <p><strong>Remaining:</strong> $${(amount - spentAmount).toFixed(2)}</p>
          </div>
          <p>You're approaching your budget limit. Consider monitoring your spending more closely.</p>
          <div style="text-align: center; margin: 20px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/budgets" 
               style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
              View Budget Details
            </a>
          </div>
        </div>
        <div style="text-align: center; padding: 20px; color: #6b7280; font-size: 14px;">
          <p>ExpenseTracker - Manage your finances with ease</p>
        </div>
      </div>
    `,
    text: `Budget Warning: Your ${budgetName} budget is at ${percentage.toFixed(0)}%. Budget: $${amount.toFixed(2)}, Spent: $${spentAmount.toFixed(2)}, Remaining: $${(amount - spentAmount).toFixed(2)}`,
  }),
}

// Server-side email sending function
export async function sendEmailNotification(notification: EmailNotification): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY
  const fromEmail = process.env.FROM_EMAIL || "onboarding@resend.dev"

  if (!apiKey) {
    console.warn("RESEND_API_KEY not configured, skipping email notification")
    return false
  }

  try {
    console.log("Sending email with API key:", apiKey.substring(0, 10) + "...")
    console.log("From email:", fromEmail)
    console.log("To email:", notification.to)

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [notification.to],
        subject: notification.subject,
        html: notification.html,
        text: notification.text,
      }),
    })

    const responseData = await response.text()
    console.log("Resend API response:", response.status, responseData)

    if (!response.ok) {
      console.error("Failed to send email:", response.status, responseData)
      return false
    }

    console.log("Email notification sent successfully")
    return true
  } catch (error) {
    console.error("Error sending email notification:", error)
    return false
  }
}
