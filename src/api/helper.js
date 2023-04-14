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

export async function getFileData(dataObject) {
    return axios.post(`${testingURL}/getFileData`, dataObject)
        .then(response => {
            return response?.data
        }).catch((error) => console.error(error))
}


export async function deleteItems(dataObject) {
    return axios.post(`${testingURL}/deleteObjects`, dataObject)
        .then(response => {
            return response?.data
        }).catch((error) => console.error(error))
}

export async function getFile(dataObject) {
    return axios.post(`${testingURL}/getFile`, dataObject, {responseType: "blob"}).then(response => {
        console.log(response.data)
        //Create a Blob from the PDF Stream
        const file = new Blob([response.data], {
          type: "application/json"
        });
        //Build a URL from the file
        const fileURL = URL.createObjectURL(file);
        //Open the URL on new Window
        window.location.href = fileURL;
      })
      .catch(error => {
        console.log(error);
      });
}