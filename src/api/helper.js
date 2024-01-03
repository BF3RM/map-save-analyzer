import axios from "axios";

const url =
    process.env.NODE_ENV === "development"
        ? "http://localhost:5000/api"
        : "/api";

export async function postFile(formData) {
    return axios
        .post(`${url}/newFile`, formData)
        .then((response) => {
            return response?.data;
        })
        .catch((error) => console.error(error));
}

export async function postModifiedFile(formData) {
    return axios
        .post(`${url}/newModifiedFile`, formData)
        .then((response) => {
            return response?.data;
        })
        .catch((error) => console.error(error));
}

export async function getDirectories() {
    return axios
        .get(`${url}/directories`)
        .then((response) => {
            return response?.data;
        })
        .catch((error) => console.error(error));
}

export async function getFileData(dataObject) {
    return axios
        .post(`${url}/getFileData`, dataObject)
        .then((response) => {
            return response?.data;
        })
        .catch((error) => console.error(error));
}

export async function deleteItems(dataObject) {
    return axios
        .post(`${url}/deleteObjects`, dataObject)
        .then((response) => {
            return response?.data;
        })
        .catch((error) => console.error(error));
}

export async function getFile(dataObject) {
    return axios
        .post(`${url}/getFile`, dataObject, { responseType: "blob" })
        .then((response) => {
            console.log(response.data);
            //Create a Blob from the PDF Stream
            const file = new Blob([response.data], {
                type: "application/json",
            });
            //Build a URL from the file
            const fileURL = URL.createObjectURL(file);
            //Open the URL on new Window
            window.location.href = fileURL;
        })
        .catch((error) => {
            console.log(error);
        });
}

export async function deleteFile(dataObject) {
    return axios
        .post(`${url}/deleteFile`, dataObject)
        .then((response) => {
            return response?.data;
        })
        .catch((error) => console.error(error));
}

export async function mergeTwoFiles(dataObject) {
    return axios
        .post(`${url}/mergeTwoFiles`, dataObject)
        .then((response) => {
            return response?.data;
        })
        .catch((error) => console.error(error));
}
