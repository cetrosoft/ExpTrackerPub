import nodemailer from "nodemailer"

interface EmailOptions {
  to: string
  subject: string
  text: string
  html?: string
}

export class EmailService {
  private transporter: nodemailer.Transporter

  constructor() {
    if (!process.env.EMAIL_HOST || !process.env.EMAIL_PORT || !process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.warn("Email service environment variables are not fully configured. Email sending may not work.")
      // Fallback to a dummy transporter if not configured, to prevent crashes in dev
      this.transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false,
        auth: {
          user: "test@example.com",
          pass: "password",
        },
      })
      return
    }

    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number.parseInt(process.env.EMAIL_PORT, 10),
      secure: process.env.EMAIL_SECURE === "true", // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    })
  }

  async sendEmail(options: EmailOptions): Promise<void> {
    try {
      const mailOptions = {
        from: process.env.EMAIL_FROM || "noreply@expensetracker.com",
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
      }

      const info = await this.transporter.sendMail(mailOptions)
      console.log("Message sent: %s", info.messageId)
      // Preview only available when sending through an Ethereal account
      if (process.env.NODE_ENV === "development" && process.env.EMAIL_HOST === "smtp.ethereal.email") {
        console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info))
      }
    } catch (error) {
      console.error("Error sending email:", error)
      throw new Error("Failed to send email.")
    }
  }
}
