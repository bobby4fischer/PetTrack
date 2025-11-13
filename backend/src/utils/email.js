import nodemailer from 'nodemailer'
export const createTransport = () => {
  const host = process.env.SMTP_HOST
  const port = Number(process.env.SMTP_PORT || 587)
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASS
  if (!host || !user || !pass) return null
  return nodemailer.createTransport({ host, port, secure: false, auth: { user, pass } })
}
export const sendMail = async (transporter, to, subject, html) => {
  if (!transporter) return false
  await transporter.sendMail({ from: `Productivity <${process.env.SMTP_USER}>`, to, subject, html })
  return true
}