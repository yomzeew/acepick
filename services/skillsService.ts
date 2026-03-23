import axios from "axios";
import { skillsUrl, popularSkillsUrl, skillCategoriesUrl } from "utilizes/endpoints";
import { store } from "redux/store";

// Get all skills with optional filtering
export const getSkillsFn = async (filters?: { category?: string; search?: string }) => {
    const token = store.getState().auth?.token;
    const params = new URLSearchParams();
    
    if (filters?.category) params.append('category', filters.category);
    if (filters?.search) params.append('search', filters.search);
    
    const response = await axios.get(`${skillsUrl}?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};

// Get popular skills (most used by professionals)
export const getPopularSkillsFn = async () => {
    const token = store.getState().auth?.token;
    const response = await axios.get(popularSkillsUrl, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};

// Get skill categories
export const getSkillCategoriesFn = async () => {
    const token = store.getState().auth?.token;
    const response = await axios.get(skillCategoriesUrl, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};

// Add skills to professional profile
export const addProfessionalSkillsFn = async (skills: Array<{ skillId: number; proficiency: string; yearsOfExp: number }>) => {
    const token = store.getState().auth?.token;
    const response = await axios.post('/api/professionals/skills', { skills }, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};

// Update professional skill
export const updateProfessionalSkillFn = async (skillId: number, data: { proficiency?: string; yearsOfExp?: number }) => {
    const token = store.getState().auth?.token;
    const response = await axios.put(`/api/professionals/skills/${skillId}`, data, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};

// Remove professional skill
export const removeProfessionalSkillFn = async (skillId: number) => {
    const token = store.getState().auth?.token;
    const response = await axios.delete(`/api/professionals/skills/${skillId}`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};

// Get professional's skills
export const getProfessionalSkillsFn = async (professionalId: string) => {
    const token = store.getState().auth?.token;
    const response = await axios.get(`/api/professionals/${professionalId}/skills`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};

// Get current user's skills
export const getMySkillsFn = async () => {
    const token = store.getState().auth?.token;
    const response = await axios.get('/api/my-skills', {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};
