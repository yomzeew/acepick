export const baseUrl:string="https://www.acepickdev.com"

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
export const getProfessionByUserIdUrl=`${baseUrl}/api/professionals/user`

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

//pin
export const setPinUrl=`${baseUrl}/api/set-pin`
export const resetPinUrl=`${baseUrl}/api/reset-pin`



//payment
export const initiatepayment=`${baseUrl}/api/payments/initiate`
export const verifypayment=`${baseUrl}/api/payments/verify`
export const initiatetransfer=`${baseUrl}/api/transfer/initiate`
export const verifytransfer=`${baseUrl}/api/transfer/verify/`

//debit payment from wallet
export const debitWallet=`${baseUrl}/api/debit-wallet`

//account
export const getBanksUrl=`${baseUrl}/api/accounts/banks`
export const resolveUrl=`${baseUrl}/api/accounts/resolve`
export const addbankDetailsUrl=`${baseUrl}/api/accounts`
export const getbanksDetails=`${baseUrl}/api/accounts`
export const updatebanksDetails=`${baseUrl}/api/accounts`
export const deletebankDetails=`${baseUrl}/api/accounts`



//Client
export const clientDetailUrl=`${baseUrl}/api/clients/`

//wallet 
export const viewWalletUrl=`${baseUrl}/api/view-wallet`

//update profile
export const educationUrl=`${baseUrl}/api/education`
export const certificationUrl=`${baseUrl}/api/certificates`
export const experienceUrl=`${baseUrl}/api/experiences`
export const portfolioUrl=`${baseUrl}/api/portfolios`

//Market Place
export const getCategoriesUrl=`${baseUrl}/api/categories`
export const productUrl=`${baseUrl}/api/products`
export const uploadProductUrl=`${baseUrl}/api/products/upload`
export const getProductmineUrl=`${baseUrl}/api/products/mine`
export const getProductTransUrl=`${baseUrl}/api/products/transactions`






// export const sendSMSOtpUrl:string=`${baseUrl}/api/auth/send-sms`
// export const sendEmailOtpUrl:string=`${baseUrl}/api/auth/send-email`