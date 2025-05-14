// Replace your OTP generation with API call
const generateOtp = async () => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/otp`);
  const data = await res.json();
  setOtp(data.otp);
  return data.otp;
};

// Replace verifyOtp with API call
const verifyOtp = async () => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/connect`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ otp: enteredOtp })
  });
  const data = await res.json();
  if (data.success) setIsConnected(true);
};
