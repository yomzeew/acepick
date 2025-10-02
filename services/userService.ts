import axios from "axios"
import { store } from "redux/store"; 
import { JobInvoice } from "types/type"
import { addbankDetailsUrl, certificationUrl, clientDetailUrl, debitWallet, educationUrl, experienceUrl, getbanksDetails, getBanksUrl, getLocationUrl, getProfessionByUserIdUrl, getProfessionUrl, initiatepayment, initiatetransfer, invoiceUrl, jobsUrl, jobUrlAcceptDecline, jobUrlApproved, jobUrlatest, jobUrlComplete, listofArtisan, listofContactUrl, locationUrl, portfolioUrl, pushTokenUrl, ratingUrl, resetPinUrl, resolveUrl, sectorUrlDetails, setPinUrl, updatebanksDetails, userDetailsgeneralUrl, verifypayment, verifytransfer, viewWalletUrl } from "utilizes/endpoints"



export const SaveTokenFunction=async(fcmToken:any)=>{
  const data={token:fcmToken}
  const token = store.getState().auth.token; // get token inside function
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

  export const updateLocation=async(data:any)=>{
    const token = store.getState().auth.token; // get token inside function

        const response=await axios.put(locationUrl,data,
            {
              headers:{
                Authorization:`Bearer ${token}`
              }
        
          })
          return response.data

       
   
   
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

        const token = store.getState().auth?.token; // get token inside function
        const response=await axios.get(`${getProfessionUrl}/${professionalId}`,
            {
              headers:{
                Authorization:`Bearer ${token}`
              }
        
          })
          return response.data

       
   
   
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

        const token = store.getState().auth.token; // get token inside function
        const response=await axios.get(`${getProfessionUrl}?professionalId=${professionalId}`,
            {
              headers:{
                Authorization:`Bearer ${token}`
              }
        
          })
          return response.data

      
   
   
  }
  export const getClientDetailFn=async(clientId:any)=>{
        const token = store.getState().auth.token; // get token inside function
        const response=await axios.get(`${clientDetailUrl}/${clientId}`,
            {
              headers:{
                Authorization:`Bearer ${token}`
              }
        
          })
          return response.data

     
   
   
  }

  export const createJobFn=async(data:any)=>{
    const token = store.getState().auth.token; // get token inside function
 
        const response=await axios.post(jobsUrl,data,
            {
              headers:{
                Authorization:`Bearer ${token}`
              }
        
          })
          return response.data

      
   
   
  }
  export const getAllJobs=async(query:string | null)=>{
  
        const token = store.getState().auth.token; // get token inside function
        const response=await axios.get(`${jobsUrl}?${query}`,
            {
              headers:{
                Authorization:`Bearer ${token}`
              }
        
          })
          return response.data

       
   
   
  }

  export const getLatestJobs=async()=>{
        const token = store.getState().auth.token; // get token inside function
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
        const token = store.getState().auth.token; // get token inside function
        const response=await axios.put(`${jobUrlAcceptDecline}/${payload.id}`,data,
            {
              headers:{
                Authorization:`Bearer ${token}`
              }
        
          })
          return response.data.data

       
  }

  export const getJobsByProfession=async()=>{
  
        const token = store.getState().auth.token; // get token inside function
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
    
        const token = store.getState().auth.token; // get token inside function
        const response=await axios.post(invoiceUrl,data,
            {
              headers:{
                Authorization:`Bearer ${token}`
              }
        
          })
          return response.data.data

       
  }

export const fetchInvoice = async (jobId: string | number) => {
  const token = store.getState().auth.token;
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
    
        const token = store.getState().auth.token; // get token inside function
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
        const token = store.getState().auth.token; // get token inside function
        const response=await axios.post(`${jobUrlComplete}/${jobid}`, {}, 
            {
              headers:{
                Authorization:`Bearer ${token}`
              }
        
          })
          return response.data.data

        
  }
  export const approvedJobFn=async(jobid:number)=>{
   
        const token = store.getState().auth.token; // get token inside function
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
  const token = store.getState().auth.token; // get token inside function
  
      const response=await axios.post(setPinUrl,data,
          {
            headers:{
              Authorization:`Bearer ${token}`
            }
      
        })
        return response.data

     

    
 
 
}

export const resetPinFn=async(data:any)=>{
  const token = store.getState().auth.token; // get token inside function
 
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

      const token = store.getState().auth.token; // get token inside function
      const response=await axios.post(`${initiatepayment}`,data,
          {
            headers:{
              Authorization:`Bearer ${token}`
            }
      
        })
        return response.data

     
}

export const paymentVerify=async(ref:string)=>{
      const token = store.getState().auth.token; // get token inside function
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

      const token = store.getState().auth.token; // get token inside function
      const response=await axios.post(`${initiatetransfer}`,data,
          {
            headers:{
              Authorization:`Bearer ${token}`
            }
      
        })
        return response.data

     
}

export const transferVerify=async(ref:string)=>{

 
      const token = store.getState().auth.token; // get token inside function
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

 
      const token = store.getState().auth.token; // get token inside function
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
      const token = store.getState().auth.token; // get token inside function
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

   
      const token = store.getState().auth.token; // get token inside function
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


   
      const token = store.getState().auth.token; // get token inside function
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


      const token = store.getState().auth.token; // get token inside function
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


      const token = store.getState().auth.token; // get token inside function
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

      const token = store.getState().auth.token; // get token inside function
      const response=await axios.get(`${viewWalletUrl}`,
          {
            headers:{
              Authorization:`Bearer ${token}`
            }
      
        })
        return response.data

     
}
export const walletDebitFn=async(data:any)=>{
      const token = store.getState().auth.token; // get token inside function
      const response=await axios.post(`${debitWallet}`,data,
          {
            headers:{
              Authorization:`Bearer ${token}`
            }
      
        })
        return response.data


}
export const educationCreateFn=async(data:any)=>{
  const token = store.getState().auth.token; // get token inside function
  const response=await axios.post(`${educationUrl}`,data,
      {
        headers:{
          Authorization:`Bearer ${token}`
        }
  
    })
    return response.data


}
export const educationGetFn=async()=>{
  const token = store.getState().auth.token; // get token inside function
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
  const token = store.getState().auth.token; // get token inside function
  const response=await axios.put(`${educationUrl}/${id}`,payload,
      {
        headers:{
          Authorization:`Bearer ${token}`
        }
  
    })
    return response.data


}
export const educationDeleteFn=async(id:number)=>{
  const token = store.getState().auth.token; // get token inside function
  const response=await axios.delete(`${educationUrl}/${id}`,
      {
        headers:{
          Authorization:`Bearer ${token}`
        }
  
    })
    return response.data


}

export const certificationCreateFn=async(data:any)=>{
  const token = store.getState().auth.token; // get token inside function
  const response=await axios.post(`${certificationUrl}`,data,
      {
        headers:{
          Authorization:`Bearer ${token}`
        }
  
    })
    return response.data


}
export const certificationGetFn=async(data:any)=>{
  const token = store.getState().auth.token; // get token inside function
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
  const token = store.getState().auth.token; // get token inside function
  const response=await axios.put(`${certificationUrl}/${id}`,payload,
      {
        headers:{
          Authorization:`Bearer ${token}`
        }
  
    })
    return response.data


}
export const certificationDeleteFn=async(id:number)=>{
  const token = store.getState().auth.token; // get token inside function
  const response=await axios.delete(`${certificationUrl}/${id}`,
      {
        headers:{
          Authorization:`Bearer ${token}`
        }
  
    })
    return response.data


}

export const experinceCreateFn=async(data:any)=>{
  const token = store.getState().auth.token; // get token inside function
  const response=await axios.post(`${experienceUrl}`,data,
      {
        headers:{
          Authorization:`Bearer ${token}`
        }
  
    })
    return response.data


}
export const experinceGetFn=async(data:any)=>{
  const token = store.getState().auth.token; // get token inside function
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
  const token = store.getState().auth.token; // get token inside function
  const response=await axios.put(`${experienceUrl}/${id}`,payload,
      {
        headers:{
          Authorization:`Bearer ${token}`
        }
  
    })
    return response.data


}
export const experinceDeleteFn=async(id:number)=>{
  const token = store.getState().auth.token; // get token inside function
  const response=await axios.delete(`${experienceUrl}/${id}`,
      {
        headers:{
          Authorization:`Bearer ${token}`
        }
  
    })
    return response.data


}

export const portfoliosCreateFn=async(data:any)=>{
  const token = store.getState().auth.token; // get token inside function
  const response=await axios.post(`${portfolioUrl}`,data,
      {
        headers:{
          Authorization:`Bearer ${token}`
        }
  
    })
    return response.data


}
export const portfoliosGetFn=async(data:any)=>{
  const token = store.getState().auth.token; // get token inside function
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
  const token = store.getState().auth.token; // get token inside function
  const response=await axios.put(`${portfolioUrl}/${id}`,payload,
      {
        headers:{
          Authorization:`Bearer ${token}`
        }
  
    })
    return response.data


}
export const portfoliosDeleteFn=async(id:number)=>{
  const token = store.getState().auth.token; // get token inside function
  const response=await axios.delete(`${portfolioUrl}/${id}`,
      {
        headers:{
          Authorization:`Bearer ${token}`
        }
  
    })
    return response.data


}

  export const generalUserDetailFn=async(userid:string)=>{
    const token = store.getState().auth.token; // get token inside function

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
  const token = store.getState().auth.token;

  const response = await axios.get(listofContactUrl, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    params, // Axios auto builds the query string
  });

  return response.data;
};

export const getLocationFn=async()=>{
  const token=store.getState().auth.token
  const response=await axios.get(getLocationUrl, {
    headers:{
      Authorization:`Bearer ${token}`
    }
  });
  return response.data
}

export const ratingGiveFn=async(data:any)=>{
  const token = store.getState().auth.token; // get token inside function
  const response=await axios.post(`${ratingUrl}`,data,
      {
        headers:{
          Authorization:`Bearer ${token}`
        }
  
    })
    return response.data


}
