import { config } from '../config/environment';

export const baseUrl: string = config.baseUrl;

// Auth endpoints
export const loginUrl: string = `${baseUrl}/api/auth/login`;
export const sendOtpUrl: string = `${baseUrl}/api/auth/send-otp`;
export const verifyOtpUrl: string = `${baseUrl}/api/auth/verify-otp`;
export const uploadUrl: string = `${baseUrl}/api/auth/upload_avatar`;
export const registerUrl: string = `${baseUrl}/api/auth/register`;
export const registerUrlArtisan: string = `${baseUrl}/api/auth/register-professional`;
export const corporateUrl: string = `${baseUrl}/api/auth/register-corperate`;
export const forgotpassword: string = `${baseUrl}/api/auth/change-password-forgot`;

// List of Sector and Professions
export const sectorUrl: string = `${baseUrl}/api/sectors`;
export const professionalUrl: string = `${baseUrl}/api/professions`;
export const pushTokenUrl: string = `${baseUrl}/api/auth/update-push-token`;

// List of Artisan and Corporate
export const sectorUrlDetails: string = `${baseUrl}/api/sectors/details`;
export const listofArtisan: string = `${baseUrl}/api/professionals?`;
export const getProfessionUrl: string = `${baseUrl}/api/professionals`;
export const getProfessionByUserIdUrl: string = `${baseUrl}/api/professionals/user`;

// Update location
export const locationUrl: string = `${baseUrl}/api/location`;

// Job endpoints
export const jobsUrl: string = `${baseUrl}/api/jobs`;
export const jobUrlatest: string = `${baseUrl}/api/jobs/latest`;
export const jobUrlAcceptDecline: string = `${baseUrl}/api/jobs/response`;
export const jobUrlComplete: string = `${baseUrl}/api/jobs/complete`;
export const jobUrlApproved: string = `${baseUrl}/api/jobs/approve`;

// Invoice endpoints
export const invoiceUrl: string = `${baseUrl}/api/jobs/invoice`;

// PIN endpoints
export const setPinUrl: string = `${baseUrl}/api/set-pin`;
export const resetPinUrl: string = `${baseUrl}/api/reset-pin`;

// Payment endpoints
export const initiatepayment: string = `${baseUrl}/api/payments/initiate`;
export const verifypayment: string = `${baseUrl}/api/payments/verify`;
export const initiatetransfer: string = `${baseUrl}/api/transfer/initiate`;
export const verifytransfer: string = `${baseUrl}/api/transfer/verify/`;

// Debit payment from wallet
export const debitWallet: string = `${baseUrl}/api/debit-wallet`;

// Account endpoints
export const getBanksUrl: string = `${baseUrl}/api/accounts/banks`;
export const resolveUrl: string = `${baseUrl}/api/accounts/resolve`;
export const addbankDetailsUrl: string = `${baseUrl}/api/accounts`;
export const getbanksDetails: string = `${baseUrl}/api/accounts`;
export const updatebanksDetails: string = `${baseUrl}/api/accounts`;
export const deletebankDetails: string = `${baseUrl}/api/accounts`;

// General user details
export const userDetailsgeneralUrl: string = `${baseUrl}/api/profile`;

// Client endpoints
export const clientDetailUrl: string = `${baseUrl}/api/clients/`;

// Wallet endpoints
export const viewWalletUrl: string = `${baseUrl}/api/view-wallet`;

// Update profile endpoints
export const educationUrl: string = `${baseUrl}/api/education`;
export const certificationUrl: string = `${baseUrl}/api/certificates`;
export const experienceUrl: string = `${baseUrl}/api/experiences`;
export const portfolioUrl: string = `${baseUrl}/api/portfolios`;

// Market Place endpoints
export const getCategoriesUrl: string = `${baseUrl}/api/categories`;
export const productUrl: string = `${baseUrl}/api/products`;
export const uploadProductUrl: string = `${baseUrl}/api/products/upload`;
export const getProductmineUrl: string = `${baseUrl}/api/products/mine`;
export const getProductTransUrl: string = `${baseUrl}/api/products/transactions`;
export const getSoldProductUrl: string = `${baseUrl}/api/products/transactions/sold`;
export const getBoughtProductUrl: string = `${baseUrl}/api/products/transactions/bought`;
export const selectProdectUrl: string = `${baseUrl}/api/products/select`;
export const getProductbyTransactionId: string = `${baseUrl}/api/products/transactions`;

// Delivery endpoints
export const pendingdeliveryUrl: string = `${baseUrl}/api/paid-orders`;
export const acceptdeliveryUrl: string = `${baseUrl}/api/orders/accept`;
export const pickupdeliveryUrl: string = `${baseUrl}/api/orders/pickup`;
export const confirmPickupUrl: string = `${baseUrl}/api/orders/confirm_pickup`;
export const intransitdeliveryUrl: string = `${baseUrl}/api/orders/transport`;
export const deliveredUrl: string = `${baseUrl}/api/orders/deliver`;
export const confirmDeliveredUrl: string = `${baseUrl}/api/orders/confirm_delivery`;
export const createOrderUrl: string = `${baseUrl}/api/create-order`;

export const getRiderDeliveryUrl: string = `${baseUrl}/api/rider-orders`;

// List of contact endpoints
export const contactUrl: string = `${baseUrl}/api/contacts`;
export const addContactUrl: string = `${baseUrl}/api/contacts/add`;
export const removeContactUrl: string = `${baseUrl}/api/contacts/remove`;
export const listofContactUrl: string = `${baseUrl}/api/contacts`;
export const getLocationUrl: string = `${baseUrl}/api/my-locations`;
export const ratingUrl: string = `${baseUrl}/api/ratings`;

// Commented out endpoints for future use
// export const sendSMSOtpUrl: string = `${baseUrl}/api/auth/send-sms`;
// export const sendEmailOtpUrl: string = `${baseUrl}/api/auth/send-email`;