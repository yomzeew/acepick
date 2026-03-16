import axios from "axios"
import { store } from "redux/store"; 
import { JobInvoice } from "types/type"
import { addbankDetailsUrl, certificationUrl, clientDetailUrl, debitWallet, educationUrl, experienceUrl, getbanksDetails, getBanksUrl, getLocationUrl, getProfessionByUserIdUrl, getProfessionUrl, initiatepayment, initiatetransfer, invoiceUrl, jobsUrl, jobUrlAcceptDecline, jobUrlApproved, jobUrlatest, jobUrlComplete, listofArtisan, listofContactUrl, locationUrl, portfolioUrl, pushTokenUrl, ratingUrl, resetPinUrl, resolveUrl, sectorUrlDetails, setPinUrl, updatebanksDetails, userDetailsgeneralUrl, verifypayment, verifytransfer, viewWalletUrl } from "utilizes/endpoints"
import MockDataService from './mockDataService';



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

        const response=await axios.get(listofArtisan+query,
            {
              headers:{
                Authorization:`Bearer ${token}`
              }
        
          })
          return response.data

        
   
   
  }

  export const updateLocation=async(locationId: string, data:any)=>{
    const token = store.getState().auth?.token;
    const url = `${locationUrl}/${locationId}`;
    
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
    const url = `${getProfessionUrl}/${professionalId}`;
    
    try {
      console.log('👤 Get Professional Details Request:', {
        url,
        professionalId,
        hasToken: !!token
      });

      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      console.log('✅ Professional Details Success');
      return response.data;
      
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
      
      console.error('❌ Get Professional Details Failed:', JSON.stringify(errorDetails, null, 2));
      
      // If server is unavailable, fall back to mock data
      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        console.log('Server unavailable, using mock data for professional details');
        const mockProfessionals = {
          1: {
            profile: {
              userId: '2',
              firstName: 'Mike',
              lastName: 'Wilson',
              avatar: 'https://picsum.photos/seed/professional1/200/200',
              bio: 'Experienced electrician with 10+ years of experience',
              position: 'Electrician',
              rate: 4.8,
              rating: 4.8,
              skills: ['Electrical', 'Wiring', 'Installation', 'Repair'],
              totalJobs: 28,
              totalJobsCompleted: 20,
              totalJobsOngoing: 3,
              totalJobsPending: 2,
              verified: true
            },
            avgRating: 4.8,
            totalReviews: 28,
            experience: '10+ years',
            location: 'Abuja, Nigeria'
          },
          2: {
            profile: {
              userId: '3',
              firstName: 'Sarah',
              lastName: 'Johnson',
              avatar: 'https://picsum.photos/seed/professional2/200/200',
              bio: 'Professional plumber with 7 years of experience',
              position: 'Plumber',
              rate: 4.6,
              rating: 4.6,
              skills: ['Plumbing', 'Installation', 'Repair', 'Maintenance'],
              totalJobs: 35,
              totalJobsCompleted: 30,
              totalJobsOngoing: 3,
              totalJobsPending: 2,
              verified: true
            },
            avgRating: 4.6,
            totalReviews: 35,
            experience: '7 years',
            location: 'Lagos, Nigeria'
          },
          3: {
            profile: {
              userId: '1',
              firstName: 'John',
              lastName: 'Doe',
              avatar: 'https://picsum.photos/seed/professional3/200/200',
              bio: 'Skilled carpenter specializing in furniture and construction',
              position: 'Carpenter',
              rate: 4.5,
              rating: 4.5,
              skills: ['Carpentry', 'Furniture', 'Construction', 'Woodworking'],
              totalJobs: 22,
              totalJobsCompleted: 18,
              totalJobsOngoing: 2,
              totalJobsPending: 2,
              verified: false
            },
            avgRating: 4.5,
            totalReviews: 22,
            experience: '5 years',
            location: 'Port Harcourt, Nigeria'
          }
        };
        
        const mockData = mockProfessionals[professionalId as keyof typeof mockProfessionals];
        if (mockData) {
          return {
            success: true,
            data: mockData
          };
        } else {
          // Return a default professional if ID not found
          return {
            success: true,
            data: mockProfessionals[1] // Default to first professional
          };
        }
      }
      
      // Re-throw with the error object intact for component to handle
      throw error;
    }
  }

  export const getProfessionDetailFnBYUserID=async(professionalId:any)=>{

    const token = store.getState().auth?.token; // get token inside function
    const response=await axios.get(`${getProfessionByUserIdUrl}/${professionalId}`,
        {
          headers:{
            Authorization:`Bearer ${token}`
          }
    
      })
      return response.data

   


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
        const response=await axios.put(`${jobUrlAcceptDecline}/${payload.id}`,data,
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
  const { data } = await axios.get<{ data: JobInvoice }>(
    `${jobsUrl}/${jobId}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  console.log('first test',data.data.id)
  return data.data;
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
        const response=await axios.post(`${jobUrlComplete}/${jobid}`, {}, 
            {
              headers:{
                Authorization:`Bearer ${token}`
              }
        
          })
          return response.data.data

        
  }
  export const approvedJobFn=async(jobid:number)=>{
   
        const token = store.getState().auth?.token; // get token inside function
        const response=await axios.post(`${jobUrlApproved}/${jobid}`, {},
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



// payment

export const paymentInitiate=async(data:any)=>{

      const token = store.getState().auth?.token; // get token inside function
      const response=await axios.post(`${initiatepayment}`,data,
          {
            headers:{
              Authorization:`Bearer ${token}`
            }
      
        })
        return response.data

     
}

export const paymentVerify=async(ref:string)=>{
      const token = store.getState().auth?.token; // get token inside function
      console.log(token)
      const response=await axios.post(`${verifypayment}/${ref}`, {},
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
      const response=await axios.post(`${initiatetransfer}`,data,
          {
            headers:{
              Authorization:`Bearer ${token}`
            }
      
        })
        return response.data

     
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

      const response=await axios.put(`${updatebanksDetails}/${recepientCode}`, data,
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
      const response=await axios.delete(`${updatebanksDetails}/${recepientCode}`,
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


      const token = store.getState().auth?.token; // get token inside function
      console.log(token)
      const response=await axios.get(`${getBanksUrl}`,
          {
            headers:{
              Authorization:`Bearer ${token}`
            }
      
        })
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
    const token = store.getState().auth?.token; // get token inside function

    console.log(userDetailsgeneralUrl+`/${userid}`,token)
    const response=await axios.get(userDetailsgeneralUrl+`/${userid}`,
        {
          headers:{
            Authorization:`Bearer ${token}`
          }
    
      })
      console.log('jjjj')
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
    const response = await axios.get(listofContactUrl, {
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

export const getLocationFn=async()=>{
  const token=store.getState().auth?.token
  const response=await axios.get(getLocationUrl, {
    headers:{
      Authorization:`Bearer ${token}`
    }
  });
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
