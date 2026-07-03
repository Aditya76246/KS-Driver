import apiClient from '../api/apiClient';

export const authService = {
  sendOtp: (mobileNumber) =>
    apiClient.post('Login/send-otp', { mobileNumber }),

  resendOtp: (mobileNumber) =>
    apiClient.post('Login/resend-otp', { mobileNumber }),

  verifyOtp: ({ mobileNumber, otpCode, otpSessionId }) =>
    apiClient.post('Login/verify-otp', { mobileNumber, otpCode, otpSessionId }),

  refreshToken: (refreshToken) =>
    apiClient.post('Login/refresh', { refreshToken }),

  logout: (refreshToken) =>
    apiClient.post('Login/logout', { refreshToken }),
};
