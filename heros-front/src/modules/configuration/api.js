import axios from "axios";
const { ConcurrencyManager } = require("axios-concurrency");
const MAX_CONCURRENT_REQUESTS = 100;
ConcurrencyManager(axios, MAX_CONCURRENT_REQUESTS);

export function getModelInfo(model) {
    return axios.get("/configuration/model/" + model + "/info", {}).then((response) => {
        return response.data;
    });
}

export function getModelDataList(model, filters) {
    return axios
        .get("/configuration/model/" + model, {
            params: filters,
        })
        .then((response) => {
            return response.data;
        });
}

export function getModelData(model, id) {
    return axios.get("/configuration/model/" + model + "/" + id.toString()).then((response) => {
        return response.data;
    });
}

export function deleteModelData(model, id) {
    return axios.delete("/configuration/model/" + model + "/" + id.toString()).then((response) => {
        return response.data.data;
    });
}

export function saveModelData(model, formData, packageData, overwrite = false) {
    let { id, ...data } = formData;
    formData = {
        id: formData.id,
        documentType: model,
        code: formData.code,
        data: data,
        packageVersion: packageData.currentVersion.id,
    };
    if (formData.id) {
        return axios
            .put("/configuration/model/" + model + "/" + formData.id.toString() + "/", formData)
            .then((response) => response.data.data);
    } else {
        return axios.post("/configuration/model/" + model + "/", formData).then((response) => response.data.data);
    }
}
