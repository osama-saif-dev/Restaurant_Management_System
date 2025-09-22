import { sendEmail } from "./sendEmail.js";

export const sendCode = async (user) => {
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    const codeExpiresAt = Date.now() + 3 * 60 * 1000;

    user.code = code;
    user.codeExpiresAt = codeExpiresAt;
    await user.save();

    await sendEmail({
        to: user.email,
        subject: "Verify your account",
        text: `Your verification code is: ${code} and it will be expired at 3 minutes`
    });
}