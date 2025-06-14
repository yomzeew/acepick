import axios from "axios"
import store from "redux/store"
import { JobInvoice } from "type"
import { clientDetailUrl, getProfessionUrl, initiatepayment, invoiceUrl, jobsUrl, jobUrlAcceptDecline, jobUrlApproved, jobUrlatest, jobUrlComplete, listofArtisan, locationUrl, pushTokenUrl, sectorUrlDetails, verifypayment } from "utilizes/endpoints"



export const SaveTokenFunction=async(data:any,token:string)=>{
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
    try{
        const response=await axios.get(listofArtisan+query,
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

  export const updateLocation=async(data:any)=>{
    const token = store.getState().auth.token; // get token inside function
    try{
        const response=await axios.put(locationUrl,data,
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

  export const getSectorByUser=async(token:string)=>{
    try{
        const response=await axios.get(sectorUrlDetails,
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

  export const getProfessionDetailFn=async(professionalId:any)=>{
    try{
        const token = store.getState().auth.token; // get token inside function
        const response=await axios.get(`${getProfessionUrl}/${professionalId}`,
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
  export const getProfessionDetailIDFn=async(professionalId:any)=>{
    try{
        const token = store.getState().auth.token; // get token inside function
        const response=await axios.get(`${getProfessionUrl}?professionalId=${professionalId}`,
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
  export const getClientDetailFn=async(clientId:any)=>{
    try{
        const token = store.getState().auth.token; // get token inside function
        const response=await axios.get(`${clientDetailUrl}/${clientId}`,
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

  export const createJobFn=async(data:any)=>{
    const token = store.getState().auth.token; // get token inside function
    try{
        const response=await axios.post(jobsUrl,data,
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
  export const getAllJobs=async(query:string | null)=>{
    try{
        const token = store.getState().auth.token; // get token inside function
        const response=await axios.get(`${jobsUrl}?${query}`,
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

  export const getLatestJobs=async()=>{
    try{
        const token = store.getState().auth.token; // get token inside function
        const response=await axios.get(jobUrlatest,
            {
              headers:{
                Authorization:`Bearer ${token}`
              }
        
          })
          return response.data.data

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
  export const jobAcceptDelineFn=async(payload:any)=>{
    const data={
        "accepted":payload.accepted
    }
    try{
        const token = store.getState().auth.token; // get token inside function
        const response=await axios.put(`${jobUrlAcceptDecline}/${payload.id}`,data,
            {
              headers:{
                Authorization:`Bearer ${token}`
              }
        
          })
          return response.data.data

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

  export const getJobsByProfession=async()=>{
    try{
        const token = store.getState().auth.token; // get token inside function
        const response=await axios.get(jobsUrl,
            {
              headers:{
                Authorization:`Bearer ${token}`
              }
        
          })
          console.log(response.data)
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

  export const invoiceFn=async(data:any)=>{
    try{
        const token = store.getState().auth.token; // get token inside function
        const response=await axios.post(invoiceUrl,data,
            {
              headers:{
                Authorization:`Bearer ${token}`
              }
        
          })
          return response.data.data

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
    try{
        const token = store.getState().auth.token; // get token inside function
        const response=await axios.put(`${invoiceUrl}/${id}`,payload,
            {
              headers:{
                Authorization:`Bearer ${token}`
              }
        
          })
          return response.data.data

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

  //approved and complete job 

  export const completeJobFn=async(jobid:number)=>{
    try{
        const token = store.getState().auth.token; // get token inside function
        const response=await axios.put(`${jobUrlComplete}/${jobid}`,
            {
              headers:{
                Authorization:`Bearer ${token}`
              }
        
          })
          return response.data.data

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
  export const approvedJobFn=async(jobid:number)=>{
    try{
        const token = store.getState().auth.token; // get token inside function
        const response=await axios.put(`${jobUrlApproved}/${jobid}`,
            {
              headers:{
                Authorization:`Bearer ${token}`
              }
        
          })
          return response.data.data

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

// payment

export const paymentInitiate=async(amount:number)=>{
  try{
      const token = store.getState().auth.token; // get token inside function
      const response=await axios.post(`${initiatepayment}`,{amount},
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
          console.error("failed:", msg);

      }
}

export const paymentVerify=async(ref:string)=>{
  try{
      const token = store.getState().auth.token; // get token inside function
      const response=await axios.post(`${verifypayment}/${ref}`,
          {
            headers:{
              Authorization:`Bearer ${token}`
            }
      
        })
        console.log(response.data,'okdd')
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
          console.error("failed:", msg);

      }
}
