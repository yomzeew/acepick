import axios from "axios"
import { store } from "redux/store"; 
import { JobInvoice } from "types/type"
import { API_BASE_URL, CHAT_CONTACTS } from "utilizes/endpoints";
import MockDataService from './mockDataService';
import { addbankDetailsUrl, certificationUrl, clientDetailUrl, debitWallet, debitWalletProductUrl, deleteUserUrl, educationUrl, experienceUrl, getbanksDetails, getBanksUrl, getLocationUrl, getMyReviewsUrl, getReviewsForUserUrl, getProfessionByUserIdUrl, getProfessionUrl, giveRatingUrl, giveReviewUrl, initiatepayment, initiatetransfer, invoiceUrl, jobsUrl, jobUrlAcceptDecline, jobUrlApproved, jobUrlatest, jobUrlCancel, jobUrlComplete, jobUrlDispute, jobUrlUpdate, listofArtisan, listofContactUrl, locationUrl, updateLocationUrl, myLocationsUrl, portfolioUrl, pushTokenUrl, ratingUrl, resetPinUrl, forgotPinUrl, resolveUrl, sectorUrlDetails, setPinUrl, updatebanksDetails, updateNotificationsUrl, updateProfessionalProfileUrl, userDetailsgeneralUrl, verifypayment, verifytransfer, viewWalletUrl } from "utilizes/endpoints"


/** Fetch short-lived Cloudflare TURN/ICE server credentials for WebRTC calls */
export const getTurnCredentialsFn = async (): Promise<{ iceServers: any[] }> => {
  const token = store.getState().auth?.token;
  try {
    const response = await axios.get(`${API_BASE_URL}/turn-credentials`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    // response.data.data contains { iceServers: [...] }
    return response.data?.data || { iceServers: [{ urls: "stun:stun.cloudflare.com:3478" }] };
  } catch (error) {
    console.warn('Failed to fetch TURN credentials, falling back to STUN only:', error);
    return { iceServers: [{ urls: "stun:stun.cloudflare.com:3478" }] };
  }
};

export const SaveTokenFunction=async(fcmToken:any)=>{
  const data={token:fcmToken}
  const token = store.getState().auth?.token; // get token inside function
    try{
        const response=await axios.post(pushTokenUrl,data,
            {
              headers:{
                Authorization:`Bearer ${token}`
              }
        
          })
          return response.data

        }catch(error:any){
            let msg = "An unexpected error occurred";
    
            if (error?.response?.data) {
              // Try multiple common formats
              msg =
                error.response.data.message ||         // Common single message
                error.response.data.error ||           // Alternative key
                JSON.stringify(error.response.data);   // Fallback: dump full error object
            } else if (error?.message) {
              msg = error.message;
            }
            

        }
   
   
  }

  export const getArtisanListFn=async(token:string,query:any)=>{
    // Ensure proper query parameter formatting
    const formattedQuery = query.startsWith('?') ? query : `?${query}`;
    console.log('🔍 Fetching professionals with query:', formattedQuery);
    console.log('📍 API URL:', listofArtisan + formattedQuery);
    console.log('🔑 Token present:', !!token);

    try {
        const response=await axios.get(listofArtisan + formattedQuery,
            {
              headers:{
                Authorization:`Bearer ${token}`
              },
              timeout: 30000 // Increased from 10000ms to 30000ms
          });
        
        console.log('✅ Professionals fetched successfully:', response.data?.data?.length || 0);
        return response.data;
    } catch (error: any) {
        console.error('❌ Error fetching professionals:', error.message);
        console.error('🔍 Error details:', {
            status: error.response?.status,
            statusText: error.response?.statusText,
            data: error.response?.data,
            url: listofArtisan + formattedQuery
        });

        // Return mock data as fallback
        const mockData = {
            status: true,
            message: "success (mock data)",
            data: [
                {
                    id: 1,
                    profession: { title: "Plumber" },
                    profile: {
                        firstName: "John",
                        lastName: "Doe",
                        avatar: "https://placehold.co/100x100?text=JD",
                        verified: true,
                        user: {
                            location: { state: "Lagos", lga: "Ikeja" }
                        }
                    },
                    chargeFrom: 5000,
                    available: true,
                    avgRating: 4.5
                },
                {
                    id: 2,
                    profession: { title: "Electrician" },
                    profile: {
                        firstName: "Jane",
                        lastName: "Smith",
                        avatar: "https://placehold.co/100x100?text=JS",
                        verified: false,
                        user: {
                            location: { state: "Lagos", lga: "Surulere" }
                        }
                    },
                    chargeFrom: 7500,
                    available: false,
                    avgRating: 4.2
                }
            ]
        };
        
        console.log('🔄 Using mock data as fallback');
        return mockData;
    }
}

  export const updateLocation=async(locationId: string, data:any)=>{
    const token = store.getState().auth?.token;
    const url = updateLocationUrl(locationId);
    
    try {
      console.log('📍 Location Update Request:', {
        url,
        method: 'PUT',
        payload: data,
        hasToken: !!token
      });

      const response = await axios.put(url, data, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      console.log('✅ Location Update Success:', response.data);
      return response.data;
      
    } catch (error: any) {
      // Detailed error logging for backend engineer
      const errorDetails = {
        endpoint: url,
        method: 'PUT',
        requestPayload: data,
        status: error?.response?.status,
        statusText: error?.response?.statusText,
        errorData: error?.response?.data,
        errorMessage: error?.message,
        headers: error?.config?.headers ? { 
          ...error.config.headers, 
          Authorization: error.config.headers.Authorization ? '[REDACTED]' : 'missing' 
        } : 'N/A'
      };
      
      console.error('❌ Location Update Failed:', JSON.stringify(errorDetails, null, 2));
      
      // Re-throw with detailed message
      const backendMessage = error?.response?.data?.message 
        || error?.response?.data?.error 
        || error?.response?.data?.errors?.join(', ')
        || `HTTP ${error?.response?.status}: ${error?.response?.statusText}`;
      
      throw new Error(`Location update failed: ${backendMessage}`);
    }
  }

  export const getSectorByUser=async(token:string)=>{
    
        const response=await axios.get(sectorUrlDetails,
            {
              headers:{
                Authorization:`Bearer ${token}`
              }
        
          })
          return response.data

       
   
   
  }

  export const getProfessionDetailFn=async(professionalId:any)=>{
    const token = store.getState().auth?.token;
    // Use the professionals endpoint, not professions endpoint
    const url = `${listofArtisan}/${professionalId}`;
    
    try {
      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`
        },
        timeout: 30000 // Increased from 10000ms to 30000ms
      });
      
      console.log('✅ Professional Details Success:', response.data);
      // Extract the actual data from the wrapper response
      const extractedData = response.data.data || response.data;
      console.log('📤 Returning Data:', {
        hasId: !!extractedData?.id,
        hasProfile: !!extractedData?.profile,
        hasProfession: !!extractedData?.profession,
        firstName: extractedData?.profile?.firstName,
        lastName: extractedData?.profile?.lastName,
        professionTitle: extractedData?.profession?.title
      });
      return extractedData;
      
    } catch (error: any) {
      const errorDetails = {
        endpoint: url,
        method: 'GET',
        professionalId,
        status: error?.response?.status,
        statusText: error?.response?.statusText,
        errorData: error?.response?.data,
        errorMessage: error?.message,
      };
      
      console.error('❌ Professional Details Error:', errorDetails);

      // If server is unavailable, fall back to mock data
      if (error.code === 'ERR_NETWORK' || error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        console.log('Server unavailable or timeout, using mock data for professional details');
        
        // Return mock professional data
        const mockData = {
          status: true,
          message: "success (mock data)",
          data: {
            id: professionalId,
            profile: {
              firstName: "John",
              lastName: "Doe",
              avatar: "https://placehold.co/150x150?text=JD",
              userId: professionalId,
              user: {
                location: {
                  state: 'Lagos',
                  lga: 'Ikeja'
                },
                professionalReviews: [
                  {
                    id: 1,
                    rating: 5,
                    review: 'Excellent service! Very professional and knowledgeable.',
                    clientUser: {
                      profile: {
                        firstName: 'Client',
                        lastName: 'Name',
                        avatar: 'https://placehold.co/150x150?text=CN'
                      }
                    },
                    createdAt: new Date().toISOString()
                  }
                ]
              },
              professional: {
                id: professionalId,
                intro: 'Experienced professional with excellent skills and attention to detail.',
                language: 'English',
                yearsOfExp: 5,
                numRating: 23,
                avgRating: 4.8,
                profession: {
                  title: 'Professional Service'
                }
              }
            }
          }
        };
        
        return mockData.data;
      }
      
      throw error;
    }
  }

  export const getProfessionDetailFnBYUserID=async(professionalId:any)=>{
    const token = store.getState().auth?.token; 
    const url = `${API_BASE_URL}/professionals/user/${professionalId}`; // Build URL directly
    
    try {
      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`
        },
        timeout: 30000 // Increased timeout
      });
      
      console.log('✅ Professional Details by User ID Success:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Professional Details by User ID Error:', {
        endpoint: url,
        method: 'GET',
        professionalId,
        status: error?.response?.status,
        statusText: error?.response?.statusText,
        errorData: error?.response?.data,
        errorMessage: error?.message,
      });

      // If server is unavailable, fall back to mock data
      if (error.code === 'ERR_NETWORK' || error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        console.log('Server unavailable or timeout, using mock data for professional details by user ID');
        
        // Return mock professional data with proper structure
        const mockData = {
          status: true,
          message: "success (mock data)",
          data: {
            id: professionalId,
            profile: {
              firstName: "Emeka",
              lastName: "Obi",
              avatar: "https://placehold.co/200x200?text=EO",
              userId: professionalId,
              user: {
                location: {
                  state: 'Lagos',
                  lga: 'Ikeja'
                },
                professionalReviews: [
                  {
                    id: 1,
                    rating: 5,
                    review: 'Excellent service! Very professional and knowledgeable.',
                    clientUser: {
                      profile: {
                        firstName: 'Client',
                        lastName: 'Name',
                        avatar: 'https://placehold.co/150x150?text=CN'
                      }
                    },
                    createdAt: new Date().toISOString()
                  }
                ]
              },
              professional: {
                id: professionalId,
                intro: 'Experienced professional with excellent skills and attention to detail.',
                language: 'English',
                yearsOfExp: 5,
                numRating: 23,
                avgRating: 4.8,
                profession: {
                  title: 'Professional Service'
                }
              }
            }
          }
        };
        
        return mockData.data;
      }
      
      throw error;
    }
}
  export const getProfessionDetailIDFn=async(professionalId:any)=>{

        const token = store.getState().auth?.token; // get token inside function
        const response=await axios.get(`${getProfessionUrl}?professionalId=${professionalId}`,
            {
              headers:{
                Authorization:`Bearer ${token}`
              }
        
          })
          return response.data

      
   
   
  }
  export const getClientDetailFn=async(clientId:any)=>{
        const token = store.getState().auth?.token; // get token inside function
        const response=await axios.get(`${clientDetailUrl}/${clientId}`,
            {
              headers:{
                Authorization:`Bearer ${token}`
              }
        
          })
          return response.data

     
   
   
  }

  export const createJobFn=async(data:any)=>{
    const token = store.getState().auth?.token; // get token inside function
 
        const response=await axios.post(jobsUrl,data,
            {
              headers:{
                Authorization:`Bearer ${token}`
              }
        
          })
          return response.data

      
   
   
  }
  export const getAllJobs=async(query:string | null)=>{
  try {
        const token = store.getState().auth?.token; // get token inside function
        const response=await axios.get(`${jobsUrl}?${query}`,
            {
              headers:{
                Authorization:`Bearer ${token}`
              }
        
          })
          return response.data
  } catch (error: any) {
    // If server is unavailable, fall back to mock data
    if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
      console.log('Server unavailable, using mock data for jobs');
      const mockJobs = [
        {
          id: 1,
          title: 'Electrical Wiring Installation',
          description: 'Complete electrical wiring for new 3-bedroom apartment',
          status: 'PENDING',
          workmanship: null,
          professional: {
            id: '2',
            profile: {
              firstName: 'Mike',
              lastName: 'Wilson',
              professional: {
                id: 1,
                title: 'Electrician',
                experience: '5 years'
              }
            }
          },
          createdAt: '2024-03-15T10:00:00Z',
          updatedAt: '2024-03-15T10:00:00Z'
        },
        {
          id: 2,
          title: 'Plumbing Repair',
          description: 'Fix leaking pipes in kitchen and bathroom',
          status: 'COMPLETED',
          workmanship: 'Completed all plumbing repairs successfully',
          professional: {
            id: '3',
            profile: {
              firstName: 'Sarah',
              lastName: 'Johnson',
              professional: {
                id: 2,
                title: 'Plumber',
                experience: '7 years'
              }
            }
          },
          createdAt: '2024-03-14T10:00:00Z',
          updatedAt: '2024-03-15T10:00:00Z'
        },
        {
          id: 3,
          title: 'Furniture Assembly',
          description: 'Assemble dining table and 6 chairs',
          status: 'ONGOING',
          workmanship: null,
          professional: {
            id: '1',
            profile: {
              firstName: 'John',
              lastName: 'Doe',
              professional: {
                id: 3,
                title: 'Carpenter',
                experience: '3 years'
              }
            }
          },
          createdAt: '2024-03-13T10:00:00Z',
          updatedAt: '2024-03-15T10:00:00Z'
        },
        {
          id: 4,
          title: 'House Cleaning',
          description: 'Deep cleaning of 2-bedroom apartment',
          status: 'COMPLETED',
          workmanship: 'Professional cleaning completed',
          professional: {
            id: '2',
            profile: {
              firstName: 'Mike',
              lastName: 'Wilson',
              professional: {
                id: 4,
                title: 'Cleaner',
                experience: '2 years'
              }
            }
          },
          createdAt: '2024-03-12T10:00:00Z',
          updatedAt: '2024-03-14T10:00:00Z'
        }
      ];
      
      // Filter by status if query is provided
      let filteredJobs = mockJobs;
      if (query) {
        const statusParam = new URLSearchParams(query).get('status');
        if (statusParam) {
          filteredJobs = mockJobs.filter(job => job.status === statusParam);
        }
      }
      
      return {
        success: true,
        data: filteredJobs
      };
    }
    throw error;
  }
}

  export const getLatestJobs=async()=>{
        const token = store.getState().auth?.token; // get token inside function
        const response=await axios.get(jobUrlatest,
            {
              headers:{
                Authorization:`Bearer ${token}`
              }
        
          })
          return response.data.data

       
   
   
  }
  export const jobAcceptDelineFn=async(payload:any)=>{
    const data={
        "accepted":payload.accepted
    }
        const token = store.getState().auth?.token; // get token inside function
        const response=await axios.put(jobUrlAcceptDecline(String(payload.id)),data,
            {
              headers:{
                Authorization:`Bearer ${token}`
              }
        
          })
          return response.data.data

       
  }

  export const getJobsByProfession=async()=>{
  
        const token = store.getState().auth?.token; // get token inside function
        const response=await axios.get(jobsUrl,
            {
              headers:{
                Authorization:`Bearer ${token}`
              }
        
          })
          console.log(response.data)
          return response.data


     
   
   
  }

  export const invoiceFn=async(data:any)=>{
    
        const token = store.getState().auth?.token; // get token inside function
        const response=await axios.post(invoiceUrl,data,
            {
              headers:{
                Authorization:`Bearer ${token}`
              }
        
          })
          return response.data.data

       
  }

export const fetchInvoice = async (jobId: string | number) => {
  const token = store.getState().auth?.token;
  const response = await axios.get(
    `${jobsUrl}/${jobId}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  
  // Return the appropriate data structure
  return response.data?.data || response.data || null;
};
export const updateInvoiceFn=async(id:number,payload:any)=>{
    
        const token = store.getState().auth?.token; // get token inside function
        const response=await axios.put(`${invoiceUrl}/${id}`,payload,
            {
              headers:{
                Authorization:`Bearer ${token}`
              }
        
          })
          return response.data.data

       
  }

  //approved and complete job 

  export const completeJobFn=async(jobid:number)=>{
        const token = store.getState().auth?.token; // get token inside function
        const response=await axios.post(jobUrlComplete(String(jobid)), {}, 
            {
              headers:{
                Authorization:`Bearer ${token}`
              }
        
          })
          return response.data.data

        
  }
  export const giveRatingFn = async (data: { rating: number; jobId?: number; orderId?: number }) => {
    const token = store.getState().auth?.token;
    const response = await axios.post(giveRatingUrl, data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  };

  export const giveReviewFn = async (data: { review: string; jobId?: number; orderId?: number }) => {
    const token = store.getState().auth?.token;
    const response = await axios.post(giveReviewUrl, data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  };

  export const getMyReviewsFn = async () => {
    const token = store.getState().auth?.token;
    const response = await axios.get(getMyReviewsUrl, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  };

  export const getReviewsForUserFn = async (userId: string) => {
    const token = store.getState().auth?.token;
    const response = await axios.get(getReviewsForUserUrl(userId), {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  };

  export const updateJobFn = async (data: { jobId: number; title?: string; description?: string; address?: string }) => {
    const token = store.getState().auth?.token;
    const response = await axios.put(jobUrlUpdate(String(data.jobId)), data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  };

  export const disputeJobFn = async (data: { jobId: number; reason: string; description: string }) => {
    const token = store.getState().auth?.token;
    const response = await axios.post(jobUrlDispute(String(data.jobId)), { reason: data.reason, description: data.description }, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  };

  export const cancelJobFn = async (jobId: number) => {
    const token = store.getState().auth?.token;
    const response = await axios.post(jobUrlCancel(String(jobId)), {}, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  };

  export const approvedJobFn=async(jobid:number)=>{
   
        const token = store.getState().auth?.token; // get token inside function
        const response=await axios.post(jobUrlApproved(String(jobid)), {},
            {
              headers:{
                Authorization:`Bearer ${token}`
              }
        
          })
          return response.data.data

  }

//pin 

export const setPinFn=async(data:any)=>{
  const token = store.getState().auth?.token; // get token inside function
  
      const response=await axios.post(setPinUrl,data,
          {
            headers:{
              Authorization:`Bearer ${token}`
            }
      
        })
        return response.data

     

    
 
 
}

export const resetPinFn=async(data:any)=>{
  const token = store.getState().auth?.token; // get token inside function
 
      const response=await axios.post(resetPinUrl,data,
          {
            headers:{
              Authorization:`Bearer ${token}`
            }
      
        })
        if (!response.data?.status) {
          console.log(response.data.status)
          // Force an error so React Query triggers onError
          throw new Error(response.data?.message || 'Reset failed');
     
        }
      
        return response.data;
}

export const forgotPinFn = async () => {
  const token = store.getState().auth?.token;
  const response = await axios.post(forgotPinUrl, {}, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
}



// payment

export const paymentInitiate=async(data:any)=>{

      const token = store.getState().auth?.token; // get token inside function
      try {
        const response=await axios.post(`${initiatepayment}`,data,
            {
              headers:{
                Authorization:`Bearer ${token}`
              }

          })
          return response.data
      } catch (error: any) {
        // Handle BVN verification required error
        if (error?.response?.status === 403 && error?.response?.data?.code === 'BVN_REQUIRED') {
          error.bvnRequired = true;
        }
        throw error;
      }
}

export const walletCreditFn=async(data:any)=>{
      const token = store.getState().auth?.token; // get token inside function
      try {
        const response=await axios.post(`${API_BASE_URL}/credit-wallet`,data,
            {
              headers:{
                Authorization:`Bearer ${token}`
              }

          })
          return response.data
      } catch (error: any) {
        // Handle BVN verification required error
        if (error?.response?.status === 403 && error?.response?.data?.code === 'BVN_REQUIRED') {
          error.bvnRequired = true;
        }
        throw error;
      }
}

export const paymentVerify=async(ref:string)=>{
      const token = store.getState().auth?.token;
      const response=await axios.post(verifypayment(ref), {},
          {
            headers:{
              Authorization:`Bearer ${token}`
            }
        })
        return response.data
}
//transfer

export const transferInitiate=async(data:any)=>{

      const token = store.getState().auth?.token; // get token inside function
      try {
        const response=await axios.post(`${initiatetransfer}`,data,
            {
              headers:{
                Authorization:`Bearer ${token}`
              }

          })
          return response.data
      } catch (error: any) {
        // Handle BVN verification required error
        if (error?.response?.status === 403 && error?.response?.data?.code === 'BVN_REQUIRED') {
          error.bvnRequired = true;
        }
        throw error;
      }
}

export const transferVerify=async(ref:string)=>{

 
      const token = store.getState().auth?.token; // get token inside function
      console.log(token)
      const response=await axios.post(`${verifytransfer}/${ref}`, {},
          {
            headers:{
              Authorization:`Bearer ${token}`
            }
      
        })
        return response.data

    
}



// Account
export const addAccountFn=async(data:any)=>{

 
      const token = store.getState().auth?.token; // get token inside function
      console.log(token)
      const response=await axios.post(`${addbankDetailsUrl}`, data,
          {
            headers:{
              Authorization:`Bearer ${token}`
            }
      
        })
        return response.data

     
}

export const updateAccountFn=async(data:any)=>{

 
    const recepientCode=data.recepientCode
      const token = store.getState().auth?.token; // get token inside function
      console.log(token)

      const response=await axios.put(updatebanksDetails(recepientCode), data,
          {
            headers:{
              Authorization:`Bearer ${token}`
            }
      
        })
        return response.data

     
}

export const deleteAccountFn=async(recepientCode:string)=>{

   
      const token = store.getState().auth?.token; // get token inside function
      console.log(token)
      const response=await axios.delete(updatebanksDetails(recepientCode),
          {
            headers:{
              Authorization:`Bearer ${token}`
            }
      
        })
        return response.data

    
}

export const getAccountFn=async()=>{


   
      const token = store.getState().auth?.token; // get token inside function
      console.log(token)
      const response=await axios.get(`${getbanksDetails}`,
          {
            headers:{
              Authorization:`Bearer ${token}`
            }
      
        })
        return response.data

      
}

export const getBanksFn=async()=>{
      const token = store.getState().auth?.token;
      console.log('🏦 getBanksFn token:', token ? 'present' : 'MISSING');
      console.log('🏦 getBanksFn URL:', getBanksUrl);
      const response=await axios.get(`${getBanksUrl}`,
          {
            headers:{
              Authorization:`Bearer ${token}`
            }
        })
        console.log('🏦 getBanksFn response:', JSON.stringify(response.data).substring(0, 200));
        return response.data
}
export const resolveAccountFn=async(data:any)=>{


      const token = store.getState().auth?.token; // get token inside function
      console.log(token)
      const response=await axios.post(`${resolveUrl}`,data,
          {
            headers:{
              Authorization:`Bearer ${token}`
            }
      
        })
        return response.data

     
}


export const walletView=async()=>{
      const token = store.getState().auth?.token; // get token inside function
      try {
        const response=await axios.get(`${viewWalletUrl}`,
            {
              headers:{
                Authorization:`Bearer ${token}`
              }
          
          })
          return response.data
      } catch (error: any) {
        // If server is unavailable, fall back to mock data
        if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
          console.log('Server unavailable, using mock data for wallet');
          const user = store.getState().auth.user;
          if (user) {
            return await MockDataService.getWallet(user.id);
          }
        }
        throw error;
      }
}

export const walletDebitFn=async(data:any)=>{
      const token = store.getState().auth?.token; // get token inside function
      try {
        const response=await axios.post(`${debitWallet}`,data,
            {
              headers:{
                Authorization:`Bearer ${token}`
              }

          })
          return response.data
      } catch (error: any) {
        // Handle BVN verification required error
        if (error?.response?.status === 403 && error?.response?.data?.code === 'BVN_REQUIRED') {
          error.bvnRequired = true;
        }
        // If server is unavailable, fall back to mock data
        if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
          console.log('Server unavailable, using mock data for wallet debit');
          const user = store.getState().auth.user;
          if (user) {
            return await MockDataService.fundWallet(user.id, data.amount || 0);
          }
        }
        throw error;
      }
}

export const walletDebitProductFn = async (data: { amount: number; pin: string; productTransactionId: number; reason?: string }) => {
  const token = store.getState().auth?.token;
  try {
    const response = await axios.post(`${debitWalletProductUrl}`, data, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error: any) {
    if (error?.response?.status === 403 && error?.response?.data?.code === 'BVN_REQUIRED') {
      error.bvnRequired = true;
    }
    throw error;
  }
}

export const educationCreateFn=async(data:any)=>{
  const token = store.getState().auth?.token; // get token inside function
  const response=await axios.post(`${educationUrl}`,data,
      {
        headers:{
          Authorization:`Bearer ${token}`
        }
  
    })
    return response.data

}
export const educationGetFn=async()=>{
  const token = store.getState().auth?.token; // get token inside function
  const response=await axios.get(`${educationUrl}`,
      {
        headers:{
          Authorization:`Bearer ${token}`
        }
  
    })
    return response.data


}
export const educationUpdateFn=async(data:any)=>{
  const id=data.id
  const payload=data.payload
  const token = store.getState().auth?.token; // get token inside function
  const response=await axios.put(`${educationUrl}/${id}`,payload,
      {
        headers:{
          Authorization:`Bearer ${token}`
        }
  
    })
    return response.data


}
export const educationDeleteFn=async(id:number)=>{
  const token = store.getState().auth?.token; // get token inside function
  const response=await axios.delete(`${educationUrl}/${id}`,
      {
        headers:{
          Authorization:`Bearer ${token}`
        }
  
    })
    return response.data


}

export const certificationCreateFn=async(data:any)=>{
  const token = store.getState().auth?.token; // get token inside function
  const response=await axios.post(`${certificationUrl}`,data,
      {
        headers:{
          Authorization:`Bearer ${token}`
        }
  
    })
    return response.data


}
export const certificationGetFn=async(data:any)=>{
  const token = store.getState().auth?.token; // get token inside function
  const response=await axios.get(`${certificationUrl}`,
      {
        headers:{
          Authorization:`Bearer ${token}`
        }
  
    })
    return response.data


}
export const certificationUpdateFn=async(data:any)=>{
  const id=data.id
  const payload=data.payload
  const token = store.getState().auth?.token; // get token inside function
  const response=await axios.put(`${certificationUrl}/${id}`,payload,
      {
        headers:{
          Authorization:`Bearer ${token}`
        }
  
    })
    return response.data


}
export const certificationDeleteFn=async(id:number)=>{
  const token = store.getState().auth?.token; // get token inside function
  const response=await axios.delete(`${certificationUrl}/${id}`,
      {
        headers:{
          Authorization:`Bearer ${token}`
        }
  
    })
    return response.data


}

export const experinceCreateFn=async(data:any)=>{
  const token = store.getState().auth?.token; // get token inside function
  const response=await axios.post(`${experienceUrl}`,data,
      {
        headers:{
          Authorization:`Bearer ${token}`
        }
  
    })
    return response.data


}
export const experinceGetFn=async(data:any)=>{
  const token = store.getState().auth?.token; // get token inside function
  const response=await axios.get(`${experienceUrl}`,
      {
        headers:{
          Authorization:`Bearer ${token}`
        }
  
    })
    return response.data


}
export const experinceUpdateFn=async(data:any)=>{
  const id=data.id
  const payload=data.payload
  const token = store.getState().auth?.token; // get token inside function
  const response=await axios.put(`${experienceUrl}/${id}`,payload,
      {
        headers:{
          Authorization:`Bearer ${token}`
        }
  
    })
    return response.data


}
export const experinceDeleteFn=async(id:number)=>{
  const token = store.getState().auth?.token; // get token inside function
  const response=await axios.delete(`${experienceUrl}/${id}`,
      {
        headers:{
          Authorization:`Bearer ${token}`
        }
  
    })
    return response.data


}

export const portfoliosCreateFn=async(data:any)=>{
  const token = store.getState().auth?.token; // get token inside function
  const response=await axios.post(`${portfolioUrl}`,data,
      {
        headers:{
          Authorization:`Bearer ${token}`
        }
  
    })
    return response.data


}
export const portfoliosGetFn=async(data:any)=>{
  const token = store.getState().auth?.token; // get token inside function
  const response=await axios.get(`${portfolioUrl}`,
      {
        headers:{
          Authorization:`Bearer ${token}`
        }
  
    })
    return response.data


}
export const portfoliosUpdateFn=async(data:any)=>{
  const id=data.id
  const payload=data.payload
  const token = store.getState().auth?.token; // get token inside function
  const response=await axios.put(`${portfolioUrl}/${id}`,payload,
      {
        headers:{
          Authorization:`Bearer ${token}`
        }
  
    })
    return response.data


}
export const portfoliosDeleteFn=async(id:number)=>{
  const token = store.getState().auth?.token; // get token inside function
  const response=await axios.delete(`${portfolioUrl}/${id}`,
      {
        headers:{
          Authorization:`Bearer ${token}`
        }
  
    })
    return response.data


}

  export const generalUserDetailFn=async(userid:string)=>{
    // Guard against undefined userid
    if (!userid || userid === 'undefined' || userid === undefined) {
        // Silent fail - don't log to reduce noise
        return null;
    }
    
    const token = store.getState().auth?.token; // get token inside function
    const url = userDetailsgeneralUrl(userid);

    const response=await axios.get(url,
        {
          headers:{
            Authorization:`Bearer ${token}`
          }
    
      })
      return response.data
  }


export const getContactListFn = async (params: {
  search?: string;
  role?: string;
  page?: number;
  limit?: number;
}) => {
  const token = store.getState().auth?.token;
  try {
    const response = await axios.get(`${API_BASE_URL}${CHAT_CONTACTS.LIST}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params, // Axios auto builds the query string
    });

    return response.data;
  } catch (error: any) {
    // If server is unavailable, fall back to mock data
    if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
      console.log('Server unavailable, using mock data for contacts');
      const mockContacts = [
        {
          id: '1',
          fullName: 'John Doe',
          email: 'client@example.com',
          phone: '+1234567890',
          role: 'client',
          avatar: 'https://picsum.photos/seed/user1/200/200',
        },
        {
          id: '2',
          fullName: 'Mike Wilson',
          email: 'pro@example.com',
          phone: '+1234567891',
          role: 'professional',
          avatar: 'https://picsum.photos/seed/user2/200/200',
        },
        {
          id: '3',
          fullName: 'Sarah Johnson',
          email: 'delivery@example.com',
          phone: '+1234567892',
          role: 'delivery',
          avatar: 'https://picsum.photos/seed/user3/200/200',
        },
      ];
      
      // Filter based on params if provided
      let filteredContacts = mockContacts;
      if (params.search) {
        filteredContacts = filteredContacts.filter(contact => 
          contact.fullName.toLowerCase().includes(params.search!.toLowerCase()) ||
          contact.email.toLowerCase().includes(params.search!.toLowerCase())
        );
      }
      if (params.role) {
        filteredContacts = filteredContacts.filter(contact => contact.role === params.role);
      }
      
      return {
        success: true,
        data: filteredContacts,
        total: filteredContacts.length,
        page: params.page || 1,
        limit: params.limit || 10,
      };
    }
    throw error;
  }
};

export const addChatContactFn = async (contactId: string) => {
  const token = store.getState().auth?.token;
  try {
    const response = await axios.post(`${API_BASE_URL}${CHAT_CONTACTS.ADD}`, {
      contactId
    }, {
      headers: {
        Authorization: `Bearer ${token}`,
      }
    });

    return response.data;
  } catch (error: any) {
    console.error('Error adding chat contact:', error);
    throw error;
  }
}

export const removeChatContactFn = async (contactId: string) => {
  const token = store.getState().auth?.token;
  try {
    const response = await axios.delete(`${API_BASE_URL}${CHAT_CONTACTS.REMOVE}`, {
      data: { contactId },
      headers: {
        Authorization: `Bearer ${token}`,
      }
    });

    return response.data;
  } catch (error: any) {
    console.error('Error removing chat contact:', error);
    throw error;
  }
}

export const unhideChatContactFn = async (contactId: string) => {
  const token = store.getState().auth?.token;
  try {
    const response = await axios.post(`${API_BASE_URL}${CHAT_CONTACTS.UNHIDE}`, {
      contactId
    }, {
      headers: {
        Authorization: `Bearer ${token}`,
      }
    });

    return response.data;
  } catch (error: any) {
    console.error('Error unhiding chat contact:', error);
    throw error;
  }
}

export const addLocationFn = async (data: {
  address: string;
  latitude: number;
  longitude: number;
  state?: string;
  lga?: string;
}) => {
  const token = store.getState().auth?.token;
  const response = await axios.post(locationUrl, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const getLocationFn = async () => {
  const token = store.getState().auth?.token;
  const response = await axios.get(myLocationsUrl, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
}

export const updateProfessionalProfileFn=async(data:any)=>{
  const token = store.getState().auth?.token;
  const response=await axios.put(`${updateProfessionalProfileUrl}`,data,
      {
        headers:{
          Authorization:`Bearer ${token}`
        }
    })
    return response.data
}

export const ratingGiveFn=async(data:any)=>{
  const token = store.getState().auth?.token; // get token inside function
  const response=await axios.post(`${ratingUrl}`,data,
      {
        headers:{
          Authorization:`Bearer ${token}`
        }
  
    })
    return response.data


}

export const deleteUserFn=async()=>{
  const token = store.getState().auth?.token;
  const response=await axios.delete(deleteUserUrl,
      {
        headers:{
          Authorization:`Bearer ${token}`
        }
  })
  return response.data
}

export const updateNotificationPreferencesFn=async(data:{callNotifications?:boolean, messengerNotifications?:boolean, hireAlertNotifications?:boolean})=>{
  const token = store.getState().auth?.token;
  const response=await axios.put(updateNotificationsUrl,data,
      {
        headers:{
          Authorization:`Bearer ${token}`
        }
  })
  return response.data
}
