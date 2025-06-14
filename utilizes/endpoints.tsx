export const baseUrl:string="https://acepickapi-g3hcbwe6f4hefjc5.canadacentral-01.azurewebsites.net"

export const loginUrl:string=`${baseUrl}/api/auth/login`
export const sendOtpUrl:string=`${baseUrl}/api/auth/send-otp`
export const verifyOtpUrl=`${baseUrl}/api/auth/verify-otp`
export const uploadUrl=`${baseUrl}/api/auth/upload_avatar`
export const registerUrl:string=`${baseUrl}/api/auth/register`
export const registerUrlArtisan:string=`${baseUrl}/api/auth/register-professional`
export const corporateUrl:string=`${baseUrl}/api/auth/register-corperate`
export const forgotpassword:string=`${baseUrl}/api/auth/change-password-forgot`

//List of Sector and Professions
export const sectorUrl:string=`${baseUrl}/api/sectors`
export const professionalUrl:string=`${baseUrl}/api/professions`
export const pushTokenUrl:string=`${baseUrl}/api/auth/update-push-token`

//List of Artisan and Corporate
export const sectorUrlDetails:string=`${baseUrl}/api/sectors/details`
export const listofArtisan=`${baseUrl}/api/professionals?`
export const getProfessionUrl=`${baseUrl}/api/professionals`

//update location
export const locationUrl=`${baseUrl}/api/location`

//Job 
export const jobsUrl=`${baseUrl}/api/jobs`
export const jobUrlatest=`${baseUrl}/api/jobs/latest`
export const jobUrlAcceptDecline=`${baseUrl}/api/jobs/response`
export const jobUrlComplete=`${baseUrl}/api/jobs/complete`
export const jobUrlApproved=`${baseUrl}/api/jobs/approve`


// invoice
export const invoiceUrl=`${baseUrl}/api/jobs/invoice`

//payment
export const initiatepayment=`${baseUrl}/api/payments/initiate`
export const verifypayment=`${baseUrl}/api/payments/verify`
export const initiatetransfer=`${baseUrl}/api/transfer/initiate`


//Client
export const clientDetailUrl=`${baseUrl}/api/clients/`





// export const sendSMSOtpUrl:string=`${baseUrl}/api/auth/send-sms`
// export const sendEmailOtpUrl:string=`${baseUrl}/api/auth/send-email`