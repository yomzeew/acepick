import axios from "axios";
import { loginUrl, registerUrl, sendOtpUrl, verifyOtpUrl } from "utilizes/endpoints";


export const loginUser = async (data: any) => {
  const response = await axios.post(loginUrl, data);
  return response.data;
};
export const sendOtp =async(data:any)=>{
  const response=await axios.post(sendOtpUrl,data)
  return response.data
}
// export const emailOtp =async(data:any)=>{
//   const response=await axios.post(sendEmailOtpUrl,data)
//   return response.data
// }

// export const smsOTP=async(data:any)=>{
//   const response=await axios.post(sendSMSOtpUrl,data)
//   return response.data
// }

export const verifyOtp=async(data:any)=>{
  const response=await axios.post(verifyOtpUrl,data)
  return response.data
}

export const registerUser=async(data:any)=>{
  const response=await axios.post(registerUrl,data)
  return response.data
}