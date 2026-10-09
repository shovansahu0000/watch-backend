import { Resend } from "resend";
import { env } from "../config/env.config.js";
import logger from "../config/winston.config.js";

const resend = new Resend(env.RESEND_API_KEY);

export const sendEmailOtp = async (to, otp) => {
  try {
    const data = await resend.emails.send({
      from: "WatchAdmin <admin@insightshub.in>",
      to: [to],
      subject: "Your Admin Dashboard Login OTP",
      html: `<p>Your OTP for WatchAdmin login is: <strong>${otp}</strong>. It is valid for 5 minutes.</p>`,
    });

    if (data.error) {
      throw new Error(data.error.message);
    }
    logger.info(`Admin OTP sent to ${to}`);
  } catch (error) {
    logger.error(`Error sending email to ${to}: ${error.message}`);
    throw new Error("Failed to send email OTP");
  }
};
