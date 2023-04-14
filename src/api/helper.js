import axios from "axios"

const testingURL = "http://localhost:5000/api"
const baseURL = "/api"

export async function postFile(formData) {
    return axios.post(`${testingURL}/file`, formData)
        .then(response => {
            return response?.data
    }).catch((error) => console.error(error))
}