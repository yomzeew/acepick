import axios from "axios";
import { sectorUrl } from "utilizes/endpoints";

export const ListofSectors=async()=>{
    const response=await axios.get(sectorUrl)
    return response.data


}