import { combineReducers } from 'redux';
import authReducer from './slices/authSlice';
import jobsReducer from './slices/jobsSlice';
import walletReducer from './slices/walletSlice';
import profileReducer from './slices/profileSlice';
import professionalReducer from './slices/professionalSlice';
import marketplaceReducer from './slices/marketplaceSlice';
import deliveryReducer from './slices/deliverySlice';
import locationReducer from './slices/locationSlice';
import ratingReducer from './slices/ratingSlice';
import reviewReducer from './slices/reviewSlice';
import chatReducer from './slices/chatSlice';
import contactReducer from './slices/contactSlice'
import dashboardReducer from './slices/dashboardSlice'
import notificationReducer from './slices/notificationSlice'


export default combineReducers({
    auth: authReducer,
    jobs: jobsReducer,
    wallet: walletReducer,
    profile: profileReducer,
    professional: professionalReducer,
    marketplace: marketplaceReducer,
    delivery: deliveryReducer,
    location: locationReducer,
    rating: ratingReducer,
    review: reviewReducer,
    chat: chatReducer,
    contacts: contactReducer,
    dashboard: dashboardReducer,
    notifications: notificationReducer,
});