const { google } = require("googleapis");

const sendMail = async ({ to, subject, html }) => {
  try {
    // 1. Setup OAuth2 Client
    const oAuth2Client = new google.auth.OAuth2(
      process.env.EMAIL_CLIENT_ID,
      process.env.EMAIL_CLIENT_SECRET,
      "https://developers.google.com/oauthplayground"
    );

    oAuth2Client.setCredentials({
      refresh_token: process.env.EMAIL_REFRESH_TOKEN,
    });

    // 2. Use the Official Gmail HTTP API instead of Nodemailer (SMTP)
    const gmail = google.gmail({ version: "v1", auth: oAuth2Client });

    // 3. Construct raw email message
    const utf8Subject = `=?utf-8?B?${Buffer.from(subject).toString("base64")}?=`;
    const messageParts = [
      `From: "TradeCatalog" <${process.env.EMAIL_USER}>`,
      `To: ${to}`,
      "Content-Type: text/html; charset=utf-8",
      "MIME-Version: 1.0",
      `Subject: ${utf8Subject}`,
      "",
      html,
    ];
    const message = messageParts.join("\n");

    // 4. Base64 URL encode the message strings
    const encodedMessage = Buffer.from(message)
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");

    // 5. Send strictly over HTTP (Port 443) which Render allows!
    const res = await gmail.users.messages.send({
      userId: "me",
      requestBody: {
        raw: encodedMessage,
      },
    });

    console.log("✅ Email sent via HTTP API:", res.data.id);
    return res.data;
  } catch (err) {
    console.error("❌ Email Error:", err.message || err);
    throw new Error("Email could not be sent");
  }
};

module.exports = sendMail;