import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

export async function sendEmailSMTP({ to, subject, body }: { to: string; subject: string; body: string }) {
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || "587"),
        secure: false,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        }
    });

    await transporter.sendMail({
        from: process.env.SMTP_FROM,
        to,
        subject,
        html: body
    });
}