
import { baseUrl } from 'utilizes/endpoints';
import { io } from 'socket.io-client';
const socket = io(baseUrl, {
  path: '/chat', 
  transports: ['websocket'],
  });
  export default socket;