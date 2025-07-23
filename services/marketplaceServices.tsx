import axios from "axios";
import { store } from "redux/store";
import { getCategoriesUrl, getProductmineUrl, getProductTransUrl, productUrl, uploadProductUrl } from "utilizes/endpoints";


export const getCategories=async()=>{
    const token = store.getState().auth.token; // get token inside function
 
        const response=await axios.get(getCategoriesUrl,
            {
              headers:{
                Authorization:`Bearer ${token}`
              }
        
          })
          return response.data

      
   
   
  }

export const addproductFn=async(data:any)=>{
    const token = store.getState().auth.token; // get token inside function
 
        const response=await axios.post(productUrl,data,
            {
              headers:{
                Authorization:`Bearer ${token}`
              }
        
          })
          return response.data
   
  }
  export const getproductFn=async(query:any)=>{
    const token = store.getState().auth.token; // get token inside function
 
        const response=await axios.get(productUrl+'?'+query,
            {
              headers:{
                Authorization:`Bearer ${token}`
              }
        
          })
          return response.data
   
  }

  export const uploadProduct = async (data: FormData) => {
    const token = store.getState().auth.token; // get token inside function
 
    const response = await axios.post(uploadProductUrl, data, {
      headers: {
         Authorization:`Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  };

  export const getMineProduct=async()=>{
    const token = store.getState().auth.token; // get token inside function
 
        const response=await axios.get(getProductmineUrl,
            {
              headers:{
                Authorization:`Bearer ${token}`
              }
        
          })
          return response.data

      
   
   
  }
  export const getTransProduct=async(status:any)=>{
    const token = store.getState().auth.token; // get token inside function
 
        const response=await axios.get(`${getProductTransUrl}/${status}`,
            {
              headers:{
                Authorization:`Bearer ${token}`
              }
        
          })
          return response.data


   
  }