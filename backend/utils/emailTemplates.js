exports.generatePasswordRecoveryEmail = (otpCode) => {
  return `
    <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
      <h2 style="color: #0056b3;">Vocal Odyssey</h2>
      <p>Dear user,</p>
      <p>We received a request to reset the password associated with your Vocal Odyssey account.</p>
      <p>Please use the following One-Time Passcode (OTP) to proceed with the password recovery process:</p>
      <p style="font-size: 18px; font-weight: bold; color: #000;">${otpCode}</p>
      <p>This OTP is valid for <strong>10 minutes</strong>. If you did not request a password reset, you can safely ignore this email.</p>
      <br />
      <p>Best regards,</p>
      <p>The Vocal Odyssey Team</p>
      <hr />
      <small>If you have any questions or need further assistance, please contact our support team.</small>
    </div>
  `;
};
