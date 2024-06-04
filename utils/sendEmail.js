import { createTransport } from "nodemailer"
export const sendEmail = async (to, subject, text) => {

    //SMTP = "simple mail transfer protocol"
    const transporter = createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        auth: {
            user: process.env.SMTP_AUTH_USER,
            pass: process.env.SMTP_AUTH_PASSWORD,
        }
    });
    await transporter.sendMail({
        to, subject, text,
    })

}