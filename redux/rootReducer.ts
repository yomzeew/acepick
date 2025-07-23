import { combineReducers } from 'redux';
import authReducer from './authSlice';
import registerReducer from './registerSlice';
import chatReducer from './chatSlice';
import contactReducer from './contactSlice'


export default combineReducers({
    auth: authReducer,
    register: registerReducer,
    chat: chatReducer,
    contacts: contactReducer,

});