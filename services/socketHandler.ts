import { Socket } from 'socket.io-client';
import { store } from '../redux/store';
import {
  setContacts,
  setPreviousChats,
  setRefreshTrigger,
  ChatMessage,
} from '../redux/slices/chatSlice';
import { updateJobStatus, Job } from '../redux/slices/jobsSlice';
import { addNewDeliveryRequest, removeDeliveryRequest, updateOrderStatus } from '../redux/slices/deliverySlice';
import { getSocket as getGlobalSocket } from './socketInstance';

// ── Backend event names (from utils/events.ts) ───────────────────────
// Emit (server → client): receive_message, receive_messages, all_contacts,
//   joined_room, got_previous_chats, receive_file, connected
// Listen (client → server): send_message, join_room, get_messages,
//   previous_chats, get_contacts, upload_file

export const initializeSocketListeners = (socket?: Socket | null) => {
  const activeSocket = socket || getGlobalSocket();
  if (!activeSocket) {
    console.log('Socket not available yet');
    return;
  }

  // Server confirms connection
  activeSocket.on('connected', (socketId: string) => {
    console.log('✅ Socket connected, id:', socketId);
  });

  // NOTE: receive_message, receive_messages, receive_file, and joined_room
  // are handled by the chat screen components (mainChat.tsx, chatdelivery.tsx)
  // to ensure messages are scoped to the active room only.

  // All contacts list
  activeSocket.on('all_contacts', (contacts: any[]) => {
    store.dispatch(setContacts(contacts));
  });

  // Previous chat partners
  activeSocket.on('got_previous_chats', (users: any[]) => {
    store.dispatch(setPreviousChats(users));
  });

  // Contact list updated - trigger refresh by updating a timestamp
  activeSocket.on('contact_list_updated', () => {
    console.log('Contact list updated, triggering refresh...');
    // Set a timestamp to trigger refresh in components that listen for it
    store.dispatch(setRefreshTrigger(Date.now()));
  });

  // ── Job event listeners (server → client) ──────────────────────────

  activeSocket.on('JOB_RESPONSE', (payload: { data: any }) => {
    const job = payload.data;
    if (job?.id) {
      store.dispatch(updateJobStatus({ jobId: job.id, status: job.status }));
    }
  });

  activeSocket.on('INVOICE_GENERATED', (payload: { data: { job: any } }) => {
    // Invoice generated — could refetch the current job if viewing it
    console.log('📄 Invoice generated:', payload.data?.job?.id);
  });

  activeSocket.on('INVOICE_UPDATED', (payload: { data: { job: any } }) => {
    console.log('📝 Invoice updated:', payload.data?.job?.id);
  });

  activeSocket.on('JOB_COMPLETED', (payload: { data: { job: any } }) => {
    const job = payload.data?.job;
    if (job?.id) {
      store.dispatch(updateJobStatus({ jobId: job.id, status: 'COMPLETED' }));
    }
  });

  activeSocket.on('JOB_APPROVED', (payload: { data: { job: any } }) => {
    const job = payload.data?.job;
    if (job?.id) {
      store.dispatch(updateJobStatus({ jobId: job.id, status: 'APPROVED' }));
    }
  });

  activeSocket.on('JOB_DISPUTED', (payload: { data: { job: any } }) => {
    const job = payload.data?.job;
    if (job?.id) {
      store.dispatch(updateJobStatus({ jobId: job.id, status: 'DISPUTED' }));
    }
  });

  activeSocket.on('DISPUTE_RESOLVED', (payload: { data: { job: any; resolution: string } }) => {
    const { job, resolution } = payload.data || {};
    if (job?.id) {
      store.dispatch(updateJobStatus({ jobId: job.id, status: resolution === 'release' ? 'APPROVED' : 'CANCELLED' }));
    }
  });

  activeSocket.on('JOB_CANCELLED', (payload: { data: any }) => {
    const job = payload.data;
    if (job?.id) {
      store.dispatch(updateJobStatus({ jobId: job.id, status: 'CANCELLED' }));
    }
  });

  activeSocket.on('PAYMENT_SUCCESS', (payload: { data: any }) => {
    const job = payload.data?.job;
    if (job?.id) {
      store.dispatch(updateJobStatus({ jobId: job.id, status: 'ONGOING' }));
    }
  });

  // ── Delivery event listeners (server → client) ──────────────────────

  activeSocket.on('NEW_DELIVERY_REQUEST', (payload: { data: any }) => {
    const order = payload.data;
    if (order?.id) {
      store.dispatch(addNewDeliveryRequest(order));
    }
  });

  activeSocket.on('DELIVERY_ASSIGNED', (payload: { data: any }) => {
    const order = payload.data;
    if (order?.id) {
      store.dispatch(updateOrderStatus({ orderId: String(order.id), status: order.status }));
    }
  });

  activeSocket.on('DELIVERY_REQUEST_CLOSED', (payload: { data: { orderId: number } }) => {
    const orderId = payload.data?.orderId;
    if (orderId) {
      store.dispatch(removeDeliveryRequest(String(orderId)));
    }
  });

  activeSocket.on('DELIVERY_STATUS_UPDATE', (payload: { data: any }) => {
    const order = payload.data;
    if (order?.id) {
      store.dispatch(updateOrderStatus({ orderId: String(order.id), status: order.status }));
    }
  });

  activeSocket.on('ORDER_STATUS_UPDATE', (payload: { data: any }) => {
    const order = payload.data;
    if (order?.id) {
      store.dispatch(updateOrderStatus({ orderId: String(order.id), status: order.status }));
    }
  });
};

// ── Emitters (client → server) ────────────────────────────────────────

// Join / create a room with a contact
export const emitJoinRoom = (contactId: string) => {
  const socket = getGlobalSocket();
  socket?.emit('join_room', { contactId });
};

// Send a text message
export const emitSendMessage = (data: ChatMessage) => {
  const socket = getGlobalSocket();
  socket?.emit('send_message', data);
};

// Request all contacts
export const emitGetContacts = () => {
  const socket = getGlobalSocket();
  socket?.emit('get_contacts');
};

// Request messages for a room
export const emitGetMessages = (room: string) => {
  const socket = getGlobalSocket();
  socket?.emit('get_messages', { room });
};

// Request previous chat partners
export const emitPreviousChats = () => {
  const socket = getGlobalSocket();
  socket?.emit('previous_chats');
};

// Upload a file (image / document)
export const emitUploadFile = (data: { image: any; fileName: string; room: string; from: string }) => {
  const socket = getGlobalSocket();
  socket?.emit('upload_file', data);
};