import { Platform } from 'react-native';

/**
 * API Endpoints for Acepick Mobile App
 */

const getDevBaseUrl = () => {
  // Development API URL - Use different IPs based on platform
  if (Platform.OS === 'android') {
    //return 'http://10.0.2.2:3000/api'; // Android emulator special IP
    return 'https://dev.acepickdev.com/api'
  }
  
  // iOS Simulator and other platforms use localhost
  return 'https://dev.acepickdev.com/api';
  
};

export const API_BASE_URL = __DEV__ 
  ? getDevBaseUrl()
  : 'https://dev.acepickdev.com/api';

// Auth endpoints
export const AUTH = {
  LOGIN: '/auth/login',
  SEND_OTP: '/auth/send-otp',
  VERIFY_OTP: '/auth/verify-otp',
  REGISTER: '/auth/register',
  REGISTER_PROFESSIONAL: '/auth/register-professional',
  REGISTER_CORPERATE: '/auth/register-corperate',
  REGISTER_RIDER: '/auth/register-rider',
  UPDATE_PROFILE: '/auth/update-profile',
  UPDATE_RIDER: '/auth/update-rider',
  CHANGE_PASSWORD_LOGGED_IN: '/auth/change-password-loggedin',
  CHANGE_PASSWORD_FORGOT: '/auth/change-password-forgot',
  UPDATE_PUSH_TOKEN: '/auth/update-push-token',
  VERIFY_TOKEN: '/auth/verify-token',
  AUTHORIZE: '/auth/authorize',
  DELETE_USERS: '/auth/delete-users',
  VERIFY_BVN: '/auth/verify-bvn',
  VERIFY_WEBHOOK: '/auth/verify/webhook',
  BVN_VERIFY: '/bvn/verify',
  BVN_STATUS: '/bvn/status',
  ME: '/auth/me',
  UPDATE_ME: '/auth/me',
  CHANGE_PASSWORD: '/auth/change-password',
  FORGOT_PASSWORD: '/auth/forgot-password',
  RESET_PASSWORD: '/auth/reset-password',
  LOGOUT: '/auth/logout',
  UPLOAD_AVATAR: '/auth/upload_avatar',
  UPDATE_NOTIFICATIONS: '/notifications/update-preferences',
} as const;

// Export BVN endpoints separately for convenience
export const BVN_VERIFY = AUTH.BVN_VERIFY;
export const BVN_STATUS = AUTH.BVN_STATUS;

// Sectors & Professions
export const SECTORS = {
  LIST: '/sectors',
  DETAILS: '/sectors/details',
  CREATE: '/sectors',
  UPDATE: (id: string) => `/sectors/${id}`,
  DELETE: (id: string) => `/sectors/${id}`,
} as const;

export const SKILLS = {
  LIST: '/skills',
  POPULAR: '/skills/popular',
  CATEGORIES: '/skills/categories',
  DETAILS: (id: string) => `/skills/${id}`,
  CREATE: '/skills',
  UPDATE: (id: string) => `/skills/${id}`,
  DELETE: (id: string) => `/skills/${id}`,
} as const;

export const PROFESSIONS = {
  LIST: '/professions',
  GET_BY_ID: (id: string) => `/professions/${id}`,
  CREATE: '/professions',
  UPDATE: (id: string) => `/professions/${id}`,
  DELETE: (id: string) => `/professions/${id}`,
} as const;

// Professionals
export const PROFESSIONALS = {
  LIST: '/professionals',
  GET_BY_ID: (professionalId: string) => `/professionals/${professionalId}`,
  GET_BY_USER_ID: (userId: string) => `/professionals/user/${userId}`,
  UPDATE_PROFILE: '/professionals/profile',
  COOPERATES: '/cooperates',
} as const;

// Jobs Management
export const JOBS = {
  LIST: '/jobs',
  LATEST: '/jobs/latest',
  GET_BY_ID: (jobId: string) => `/jobs/${jobId}`,
  CREATE: '/jobs',
  RESPOND: (jobId: string) => `/jobs/response/${jobId}`,
  COMPLETE: (jobId: string) => `/jobs/complete/${jobId}`,
  APPROVE: (jobId: string) => `/jobs/approve/${jobId}`,
  DISPUTE: (jobId: string) => `/jobs/dispute/${jobId}`,
  CANCEL: (jobId: string) => `/jobs/cancel/${jobId}`,
  UPDATE: (jobId: string) => `/jobs/update/${jobId}`,
  INVOICE: '/jobs/invoice',
  INVOICE_BY_ID: (jobId: string) => `/jobs/invoice/${jobId}`,
  VIEW_INVOICE: (jobId: string) => `/jobs/invoice/${jobId}`,
  RESOLVE_DISPUTE: (jobId: string) => `/jobs/dispute/resolve/${jobId}`,
} as const;

// Locations
export const LOCATIONS = {
  ADD: '/locations',
  UPDATE: (locationId: string) => `/location/${locationId}`,
  GET_BY_ID: (id: string) => `/locations/${id}`,
  DELETE: (id: string) => `/locations/${id}`,
  MY_LOCATIONS: '/my-locations',
  FIND_NEARBY: '/nearest-person',
} as const;

// Education, Experience, Certifications, Portfolios
export const EDUCATION = {
  LIST: '/education',
  ADD: '/education',
  UPDATE: (id: string) => `/education/${id}`,
  DELETE: (id: string) => `/education/${id}`,
} as const;

export const CERTIFICATIONS = {
  LIST: '/certificates',
  ADD: '/certificates',
  UPDATE: (id: string) => `/certificates/${id}`,
  DELETE: (id: string) => `/certificates/${id}`,
} as const;

export const EXPERIENCES = {
  LIST: '/experiences',
  ADD: '/experiences',
  UPDATE: (id: string) => `/experiences/${id}`,
  DELETE: (id: string) => `/experiences/${id}`,
} as const;

export const PORTFOLIOS = {
  LIST: '/portfolios',
  ADD: '/portfolios',
  UPDATE: (id: string) => `/portfolios/${id}`,
  DELETE: (id: string) => `/portfolios/${id}`,
} as const;

// Wallet & Transactions
export const WALLET = {
  CREATE: '/create-wallet',
  VIEW: '/view-wallet',
  CREDIT: '/credit-wallet',
  DEBIT: '/debit-wallet',
  DEBIT_PRODUCT: '/debit-wallet/product',
  SET_PIN: '/set-pin',
  RESET_PIN: '/reset-pin',
  FORGOT_PIN: '/forgot-pin',
  TRANSACTIONS: '/transactions',
  TRANSACTION_BY_ID: (id: string) => `/transactions/${id}`,
} as const;

// Payment & Transfer
export const PAYMENTS = {
  INITIATE: '/payments/initiate',
  VERIFY: (ref: string) => `/payments/verify/${ref}`,
  WEBHOOK: '/paystack/webhook',
} as const;

export const TRANSFERS = {
  INITIATE: '/transfer/initiate',
  FINALIZE: '/transfer/finalize',
  VERIFY: (ref: string) => `/transfer/verify/${ref}`,
} as const;

// Products & Categories
export const PRODUCTS = {
  LIST: '/products',
  GET_BY_ID: (id: string) => `/products/${id}`,
  ADD: '/products',
  UPDATE: (id: string) => `/products/${id}`,
  DELETE: (id: string) => `/products/${id}`,
  MINE: '/products/mine',
  UPLOAD: '/products/upload',
  SELECT: '/products/select',
  RESTOCK: '/products/restock',
  SOLD_TRANSACTIONS: '/products/transactions/sold',
  BOUGHT_TRANSACTIONS: '/products/transactions/bought',
  TRANSACTION_BY_ID: (id: string) => `/products/transactions/${id}`,
} as const;

export const CATEGORIES = {
  LIST: '/categories',
  ADD: '/categories',
  UPDATE: (id: string) => `/categories/${id}`,
  DELETE: (id: string) => `/categories/${id}`,
} as const;

// Orders
export const ORDERS = {
  CREATE: '/create-order',
  PAID_ORDERS: '/paid-orders',
  RIDER_ORDERS: '/rider-orders',
  BUYER_ORDERS: '/buyer-orders',
  SELLER_ORDERS: '/seller-orders',
  GET_BY_ID: (orderId: string) => `/orders/${orderId}`,
  ACCEPT: (orderId: string) => `/orders/accept/${orderId}`,
  EN_ROUTE_TO_PICKUP: (orderId: string) => `/orders/en_route_to_pickup/${orderId}`,
  ARRIVED_AT_PICKUP: (orderId: string) => `/orders/arrived_at_pickup/${orderId}`,
  PICKUP: (orderId: string) => `/orders/pickup/${orderId}`,
  CONFIRM_PICKUP: (orderId: string) => `/orders/confirm_pickup/${orderId}`,
  ARRIVED_AT_DROPOFF: (orderId: string) => `/orders/arrived_at_dropoff/${orderId}`,
  DELIVER: (orderId: string) => `/orders/deliver/${orderId}`,
  CONFIRM_DELIVERY: (productTransactionId: string) => `/orders/confirm_delivery/${productTransactionId}`,
  CANCEL: (orderId: string) => `/orders/cancel/${orderId}`,
  RETRY: (orderId: string) => `/orders/retry/${orderId}`,
  RETRY_RIDER: (orderId: string) => `/orders/retry-rider/${orderId}`,
  DISPUTE: '/orders/dispute',
  RESOLVE_DISPUTE: (disputeId: string) => `/orders/dispute/resolve/${disputeId}`,
  SELLER_ACCEPT: (ptId: string) => `/orders/seller-accept/${ptId}`,
  SELLER_REJECT: (ptId: string) => `/orders/seller-reject/${ptId}`,
  SELLER_MARK_READY: (ptId: string) => `/orders/seller-mark-ready/${ptId}`,
  SELLER_CONFIRM: (ptId: string) => `/orders/seller-confirm/${ptId}`,
  SELLER_HANDOVER: (ptId: string) => `/orders/seller-handover/${ptId}`,
  BUYER_CANCEL: (ptId: string) => `/orders/buyer-cancel/${ptId}`,
  RETURN_REQUEST: '/orders/return-request',
  RESOLVE_RETURN: (returnRequestId: string) => `/orders/return-request/resolve/${returnRequestId}`,
  AUTO_RELEASE: '/orders/auto-release-payments',
  CLEANUP_EXPIRED: '/orders/cleanup-expired',
} as const;

// Ratings & Reviews
export const RATINGS = {
  GIVE: '/ratings',
  IS_RATED: '/is-rated',
  UPDATE: (id: string) => `/ratings/${id}`,
  DELETE: (id: string) => `/ratings/${id}`,
  BY_USER: (userId: string) => `/ratings/user/${userId}`,
  FOR_USER: (userId: string) => `/ratings/for-user/${userId}`,
  REPORT: (ratingId: string) => `/ratings/${ratingId}/report`,
} as const;

export const REVIEWS = {
  MY: '/reviews/my',
  GIVE: '/reviews',
  EDIT: (reviewId: string) => `/reviews/${reviewId}`,
  DELETE: (reviewId: string) => `/reviews/${reviewId}`,
  BY_USER: (userId: string) => `/reviews/user/${userId}`,
  FOR_USER: (userId: string) => `/reviews/user/${userId}`,
  BY_PRODUCT: (productId: string) => `/reviews/product/${productId}`,
  BY_SERVICE: (serviceId: string) => `/reviews/service/${serviceId}`,
  LIKE: (reviewId: string) => `/reviews/${reviewId}/like`,
  REPORT: (reviewId: string) => `/reviews/${reviewId}/report`,
  RESPOND: (reviewId: string) => `/reviews/${reviewId}/respond`,
  STATS: '/reviews/stats',
  SUMMARY: '/reviews/summary',
} as const;

// Accounts
export const ACCOUNTS = {
  BANKS: '/accounts/banks',
  ADD: '/accounts',
  LIST: '/accounts',
  RESOLVE: '/accounts/resolve',
  UPDATE: (recipientCode: string) => `/accounts/${recipientCode}`,
  DELETE: (recipientCode: string) => `/accounts/${recipientCode}`,
} as const;

// Profile
export const PROFILE = {
  ME: '/profile',
  USER: (userId: string) => `/profile/${userId}`,
  UPDATE: '/profile',
  CONTACTS: '/contacts',
  CLIENT: (id: string) => `/clients/${id}`,
} as const;

// Chat Contacts
export const CHAT_CONTACTS = {
  LIST: '/chat-contacts',
  ADD: '/chat-contacts',
  REMOVE: '/chat-contacts',
  UNHIDE: '/chat-contacts/unhide',
} as const;

// WebRTC TURN credentials
export const TURN = {
  CREDENTIALS: '/turn-credentials',
} as const;

// Call Recordings
export const CALL_RECORDINGS = {
  SAVE: '/call-recordings',
  LIST: '/call-recordings',
  DELETE: (id: number) => `/call-recordings/${id}`,
} as const;

// Role switching
export const ROLE_SWITCH = {
  AVAILABLE_ROLES: '/available-roles',
  SWITCH: '/switch-role',
  SETUP_PROFESSIONAL: '/setup-professional',
  SETUP_DELIVERY: '/setup-delivery',
} as const;

// Dashboard endpoints
export const DASHBOARD = {
  CLIENT: '/dashboard/client',
  PROFESSIONAL: '/dashboard/professional',
  DELIVERY: '/dashboard/delivery',
} as const;

// Admin endpoints
export const ADMIN = {
  USERS_BY_ROLE: (role: string) => `/admin/${role}/all`,
  USER_BY_ID: (userId: string) => `/admin/user/${userId}`,
  TOGGLE_SUSPENSION: (userId: string) => `/admin/user/togggle-suspend/${userId}`,
  EMAIL_MESSAGE: '/admin/email/message',
  DEACTIVATE: (userId: string) => `/admin/user/deactivate/${userId}`,
  SUSPEND: (userId: string) => `/admin/user/suspend/${userId}`,
  REACTIVATE: (userId: string) => `/admin/user/reactivate/${userId}`,
  PRODUCTS: '/admin/products',
  APPROVE_PRODUCT: (productId: string) => `/admin/products/approve/${productId}`,
  DASHBOARD_OVERVIEW: '/admin/dashboard/overview',
  ACTIVITIES: '/admin/dashboard/activities',
  TOP_PERFORMERS: '/admin/dashboard/top-performers',
  NEW_USERS_TODAY: '/admin/dashboard/new-users-today',
  CUMULATIVE_USERS: '/admin/dashboard/cummulative-users',
} as const;

// Upload endpoints
export const UPLOAD = {
  FILES: '/upload-files',
  FILE: '/upload-file',
  AVATAR: '/upload-avatar',
  PRODUCT_IMAGES: '/products/upload',
} as const;

// Test endpoints
export const TEST = {
  NOTIFICATION: '/notification-test',
  SEND_SMS: '/send-sms',
  SEND_EMAIL: '/send-email',
  FIND_NEARBY: '/nearest-person',
  REDIS_TEST: '/redis-test',
  GET_PROFESSIONAL: (professionalId: string) => `/get-professional-test/${professionalId}`,
} as const;

// ─── Legacy aliases (backward compat for userService.ts etc.) ─────────
export const viewWalletUrl = `${API_BASE_URL}${WALLET.VIEW}`;
export const debitWallet = `${API_BASE_URL}${WALLET.DEBIT}`;
export const debitWalletUrl = `${API_BASE_URL}${WALLET.DEBIT}`;
export const debitWalletProductUrl = `${API_BASE_URL}${WALLET.DEBIT_PRODUCT}`;
export const setPinUrl = `${API_BASE_URL}${WALLET.SET_PIN}`;
export const resetPinUrl = `${API_BASE_URL}${WALLET.RESET_PIN}`;
export const forgotPinUrl = `${API_BASE_URL}${WALLET.FORGOT_PIN}`;
export const pushTokenUrl = `${API_BASE_URL}${AUTH.UPDATE_PUSH_TOKEN}`;
export const deleteUserUrl = `${API_BASE_URL}${AUTH.DELETE_USERS}`;
export const updateNotificationsUrl = `${API_BASE_URL}${AUTH.UPDATE_NOTIFICATIONS}`;
export const locationUrl = `${API_BASE_URL}${LOCATIONS.ADD}`;
export const updateLocationUrl = (id: string) => `${API_BASE_URL}${LOCATIONS.UPDATE(id)}`;
export const getLocationUrl = (id: string) => `${API_BASE_URL}${LOCATIONS.GET_BY_ID(id)}`;
export const myLocationsUrl = `${API_BASE_URL}${LOCATIONS.MY_LOCATIONS}`;
export const jobsUrl = `${API_BASE_URL}${JOBS.LIST}`;
export const jobUrlatest = `${API_BASE_URL}${JOBS.LATEST}`;
export const jobUrlAcceptDecline = (jobId: string) => `${API_BASE_URL}${JOBS.RESPOND(jobId)}`;
export const jobUrlComplete = (jobId: string) => `${API_BASE_URL}${JOBS.COMPLETE(jobId)}`;
export const jobUrlApproved = (jobId: string) => `${API_BASE_URL}${JOBS.APPROVE(jobId)}`;
export const jobUrlUpdate = (jobId: string) => `${API_BASE_URL}${JOBS.UPDATE(jobId)}`;
export const jobUrlDispute = (jobId: string) => `${API_BASE_URL}${JOBS.DISPUTE(jobId)}`;
export const jobUrlCancel = (jobId: string) => `${API_BASE_URL}${JOBS.CANCEL(jobId)}`;
export const invoiceUrl = `${API_BASE_URL}${JOBS.INVOICE}`;
export const educationUrl = `${API_BASE_URL}${EDUCATION.ADD}`;
export const certificationUrl = `${API_BASE_URL}${CERTIFICATIONS.ADD}`;
export const experienceUrl = `${API_BASE_URL}${EXPERIENCES.ADD}`;
export const portfolioUrl = `${API_BASE_URL}${PORTFOLIOS.ADD}`;
export const ratingUrl = `${API_BASE_URL}${RATINGS.GIVE}`;
export const listofArtisan = `${API_BASE_URL}${PROFESSIONALS.LIST}`;
export const listofContactUrl = `${API_BASE_URL}${PROFILE.CONTACTS}`;
export const userDetailsgeneralUrl = (userId: string) => `${API_BASE_URL}${PROFILE.USER(userId)}`;
export const clientDetailUrl = (id: string) => `${API_BASE_URL}${PROFILE.CLIENT(id)}`;
export const getProfessionUrl = `${API_BASE_URL}${PROFESSIONS.LIST}`;
export const getProfessionByUserIdUrl = (userId: string) => `${API_BASE_URL}${PROFESSIONALS.GET_BY_USER_ID(userId)}`;
export const updateProfessionalProfileUrl = `${API_BASE_URL}${PROFESSIONALS.UPDATE_PROFILE}`;
export const sectorUrl = `${API_BASE_URL}/public/sectors`;
export const sectorUrlDetails = `${API_BASE_URL}${SECTORS.DETAILS}`;
export const skillsUrl = `${API_BASE_URL}/public/skills`;
export const popularSkillsUrl = `${API_BASE_URL}/public/skills/popular`;
export const skillCategoriesUrl = `${API_BASE_URL}/public/skills/categories`;
export const initiatepayment = `${API_BASE_URL}${PAYMENTS.INITIATE}`;
export const verifypayment = (ref: string) => `${API_BASE_URL}${PAYMENTS.VERIFY(ref)}`;
export const initiatetransfer = `${API_BASE_URL}${TRANSFERS.INITIATE}`;
export const verifytransfer = (ref: string) => `${API_BASE_URL}${TRANSFERS.VERIFY(ref)}`;
export const resolveUrl = `${API_BASE_URL}${ACCOUNTS.RESOLVE}`;
export const getBanksUrl = `${API_BASE_URL}${ACCOUNTS.BANKS}`;
export const addbankDetailsUrl = `${API_BASE_URL}${ACCOUNTS.ADD}`;
export const getbanksDetails = `${API_BASE_URL}${ACCOUNTS.LIST}`;
export const updatebanksDetails = (code: string) => `${API_BASE_URL}${ACCOUNTS.UPDATE(code)}`;

// Legacy product endpoints
export const productUrl = `${API_BASE_URL}/public/products`;
export const getProductUrl = (id: string) => `${API_BASE_URL}${PRODUCTS.GET_BY_ID(id)}`;
export const addProductUrl = `${API_BASE_URL}${PRODUCTS.ADD}`;
export const updateProductUrl = (id: string) => `${API_BASE_URL}${PRODUCTS.UPDATE(id)}`;
export const deleteProductUrl = (id: string) => `${API_BASE_URL}${PRODUCTS.DELETE(id)}`;
export const getProductmineUrl = `${API_BASE_URL}${PRODUCTS.MINE}`;
export const uploadFilesUrl = `${API_BASE_URL}${PRODUCTS.UPLOAD}`;
export const selectProductUrl = `${API_BASE_URL}${PRODUCTS.SELECT}`;
export const restockProductUrl = `${API_BASE_URL}${PRODUCTS.RESTOCK}`;
export const soldProductsUrl = `${API_BASE_URL}${PRODUCTS.SOLD_TRANSACTIONS}`;
export const boughtProductsUrl = `${API_BASE_URL}${PRODUCTS.BOUGHT_TRANSACTIONS}`;
export const getProductTransactionByIdUrl = (id: string) => `${API_BASE_URL}${PRODUCTS.TRANSACTION_BY_ID(id)}`;
export const getCategoriesUrl = `${API_BASE_URL}/public/categories`;
export const addCategoryUrl = `${API_BASE_URL}${CATEGORIES.ADD}`;
export const updateCategoryUrl = (id: string) => `${API_BASE_URL}${CATEGORIES.UPDATE(id)}`;
export const deleteCategoryUrl = (id: string) => `${API_BASE_URL}${CATEGORIES.DELETE(id)}`;
export const uploadProductUrl = `${API_BASE_URL}${PRODUCTS.UPLOAD}`;
export const selectProdectUrl = `${API_BASE_URL}${PRODUCTS.SELECT}`;
export const getProductTransUrl = `${API_BASE_URL}${PRODUCTS.SOLD_TRANSACTIONS}`;
export const getSoldProductUrl = `${API_BASE_URL}${PRODUCTS.SOLD_TRANSACTIONS}`;
export const getBoughtProductUrl = `${API_BASE_URL}${PRODUCTS.BOUGHT_TRANSACTIONS}`;

// Legacy delivery endpoints
export const acceptdeliveryUrl = (orderId: string) => `${API_BASE_URL}${ORDERS.ACCEPT(orderId)}`;
export const enRouteToPickupUrl = (orderId: string) => `${API_BASE_URL}${ORDERS.EN_ROUTE_TO_PICKUP(orderId)}`;
export const arrivedAtPickupUrl = (orderId: string) => `${API_BASE_URL}${ORDERS.ARRIVED_AT_PICKUP(orderId)}`;
export const pickupdeliveryUrl = (orderId: string) => `${API_BASE_URL}${ORDERS.PICKUP(orderId)}`;
export const confirmPickupUrl = (orderId: string) => `${API_BASE_URL}${ORDERS.CONFIRM_PICKUP(orderId)}`;
export const arrivedAtDropoffUrl = (orderId: string) => `${API_BASE_URL}${ORDERS.ARRIVED_AT_DROPOFF(orderId)}`;
export const deliveredUrl = (orderId: string) => `${API_BASE_URL}${ORDERS.DELIVER(orderId)}`;
export const confirmDeliveredUrl = (ptId: string) => `${API_BASE_URL}${ORDERS.CONFIRM_DELIVERY(ptId)}`;
export const retryRiderSearchUrl = (orderId: string) => `${API_BASE_URL}${ORDERS.RETRY(orderId)}`;
export const getOrderByIdUrl = (orderId: string) => `${API_BASE_URL}${ORDERS.GET_BY_ID(orderId)}`;
export const paidOrdersUrl = `${API_BASE_URL}${ORDERS.PAID_ORDERS}`;
export const riderOrdersUrl = `${API_BASE_URL}${ORDERS.RIDER_ORDERS}`;
export const buyerOrdersUrl = `${API_BASE_URL}${ORDERS.BUYER_ORDERS}`;
export const sellerOrdersUrl = `${API_BASE_URL}${ORDERS.SELLER_ORDERS}`;
export const createOrderUrl = `${API_BASE_URL}${ORDERS.CREATE}`;

// Delivery slice URL exports
export const getNearestPaidOrdersUrl = `${API_BASE_URL}${ORDERS.PAID_ORDERS}`;
export const getOrdersRiderUrl = `${API_BASE_URL}${ORDERS.RIDER_ORDERS}`;
export const getOrdersBuyerUrl = `${API_BASE_URL}${ORDERS.BUYER_ORDERS}`;
export const getOrdersSellerUrl = `${API_BASE_URL}${ORDERS.SELLER_ORDERS}`;
export const acceptOrderUrl = (orderId: string) => `${API_BASE_URL}${ORDERS.ACCEPT(orderId)}`;
export const enRouteToPickupOrderUrl = (orderId: string) => `${API_BASE_URL}${ORDERS.EN_ROUTE_TO_PICKUP(orderId)}`;
export const arrivedAtPickupOrderUrl = (orderId: string) => `${API_BASE_URL}${ORDERS.ARRIVED_AT_PICKUP(orderId)}`;
export const pickupOrderUrl = (orderId: string) => `${API_BASE_URL}${ORDERS.PICKUP(orderId)}`;
export const arrivedAtDropoffOrderUrl = (orderId: string) => `${API_BASE_URL}${ORDERS.ARRIVED_AT_DROPOFF(orderId)}`;
export const deliverOrderUrl = (orderId: string) => `${API_BASE_URL}${ORDERS.DELIVER(orderId)}`;
export const confirmDeliveryUrl = (ptId: string) => `${API_BASE_URL}${ORDERS.CONFIRM_DELIVERY(ptId)}`;
export const cancelOrderUrl = (orderId: string) => `${API_BASE_URL}${ORDERS.CANCEL(orderId)}`;
export const retryOrderUrl = (orderId: string) => `${API_BASE_URL}${ORDERS.RETRY(orderId)}`;
export const disputeOrderUrl = `${API_BASE_URL}${ORDERS.DISPUTE}`;
export const resolveDisputeUrl = (disputeId: string) => `${API_BASE_URL}${ORDERS.RESOLVE_DISPUTE(disputeId)}`;
export const sellerAcceptOrderUrl = (ptId: string) => `${API_BASE_URL}${ORDERS.SELLER_ACCEPT(ptId)}`;
export const sellerRejectOrderUrl = (ptId: string) => `${API_BASE_URL}${ORDERS.SELLER_REJECT(ptId)}`;
export const sellerMarkReadyUrl = (ptId: string) => `${API_BASE_URL}${ORDERS.SELLER_MARK_READY(ptId)}`;
export const sellerConfirmUrl = (ptId: string) => `${API_BASE_URL}${ORDERS.SELLER_CONFIRM(ptId)}`;
export const sellerHandOverUrl = (ptId: string) => `${API_BASE_URL}${ORDERS.SELLER_HANDOVER(ptId)}`;
export const buyerCancelOrderUrl = (ptId: string) => `${API_BASE_URL}${ORDERS.BUYER_CANCEL(ptId)}`;
export const returnRequestUrl = `${API_BASE_URL}${ORDERS.RETURN_REQUEST}`;
export const resolveReturnUrl = (returnRequestId: string) => `${API_BASE_URL}${ORDERS.RESOLVE_RETURN(returnRequestId)}`;
export const giveRatingUrl = `${API_BASE_URL}${RATINGS.GIVE}`;
export const isRatedUrl = `${API_BASE_URL}${RATINGS.IS_RATED}`;
export const giveReviewUrl = `${API_BASE_URL}${REVIEWS.GIVE}`;
export const editReviewUrl = (reviewId: string) => `${API_BASE_URL}${REVIEWS.EDIT(reviewId)}`;
export const deleteReviewUrl = (reviewId: string) => `${API_BASE_URL}${REVIEWS.DELETE(reviewId)}`;
export const getMyReviewsUrl = `${API_BASE_URL}${REVIEWS.MY}`;
export const getReviewsForUserUrl = (userId: string) => `${API_BASE_URL}${REVIEWS.FOR_USER(userId)}`;

// Legacy sector/profession endpoints
export const sectorUrlLegacy = `${API_BASE_URL}${SECTORS.LIST}`;