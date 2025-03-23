import axios from "axios";

// Set the base URL of your Django API (make sure it's running)
const API_URL = "http://127.0.0.1:8000/api/";

// Function to fetch mentors from your backend
export const fetchMentors = async () => {
    try {
        const response = await axios.get(`${API_URL}mentors/`);  // Example endpoint
        return response.data;  // Return the data (e.g., mentor list)
    } catch (error) {
        console.error("Error fetching mentors:", error);
        throw error;
    }
};

export const loginuser =async (credentials)=>{
    return axios.post(`${API_URL}login/`,credentials);
}

export const registeruser= async (userdata)=>{
    return axios.post(`${API_URL}register/`,userdata);
}
