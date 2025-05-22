import axios from "axios";
import { uploadUrl } from "utilizes/endpoints";

export const uploadPhotoUser = async (data: FormData) => {
    const response = await axios.post(uploadUrl, data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  };