try {
  await transporter.sendMail({
    from: `"TradeCatalog" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  });
} catch (err) {
  console.error("FULL EMAIL ERROR:", err); // 👈 IMPORTANT
  throw err; // 👈 don't hide it
}