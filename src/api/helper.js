import axios from "axios"

const testingURL = "http://localhost:5000/api"
const baseURL = "/api"

export async function postFile(formData) {
    return axios.post(`${testingURL}/newFile`, formData)
        .then(response => {
            return response?.data
    }).catch((error) => console.error(error))
}

export async function getDirectories() {
    return axios.get(`${testingURL}/directories`)
        .then(response => {
            return response?.data
    }).catch((error) => console.error(error))
}

export async function getFile(dataObject) {
    console.log(dataObject)
    return axios.post(`${testingURL}/getFile`, dataObject)
        .then(response => {
            return response?.data
        }).catch((error) => console.error(error))
}


export async function deleteItems(dataObject) {
    console.log(dataObject)
    return axios.post(`${testingURL}/deleteObjects`, dataObject)
        .then(response => {
            return response?.data
        }).catch((error) => console.error(error))
}