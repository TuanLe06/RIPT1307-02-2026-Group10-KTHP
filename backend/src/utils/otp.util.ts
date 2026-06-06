import crypto from 'crypto';
import bcrypt from 'bcryptjs';

export const generateOTP = (): string => {
  return crypto.randomInt(100000, 999999).toString();
};

export const hashOTP = async (otp: string): Promise<string> => {
  return await bcrypt.hash(otp, 10);
};

export const verifyOTP = async (inputOTP: string, hashedOTP: string): Promise<boolean> => {
  return await bcrypt.compare(inputOTP, hashedOTP);
};
