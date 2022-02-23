import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import * as api from "./api";
import errorHandler from "./errorHandler";
import { usePackage } from "../packages/PackageContext";

import ModelTable from "./components/ModelTable";

const ModelAdmin = ({ buttonsConfig, model }) => {
    const [modelConfig, setModelConfig] = useState({
        modelInfo: null,
        modelData: null,
    });

    let navigate = useNavigate();
    const packageData = usePackage();

    useEffect(() => {
        search();
    }, [model]);

    const search = async (filters) => {
        let searchFilters = { ...filters };
        if (packageData) {
            searchFilters["package_version_id__in"] = packageData.currentVersion.id;
        }
        try {
            const modelConfig = await api.getModelInfo(model);
            const modelData = await api.getModelDataList(model, searchFilters);
            setModelConfig({
                modelInfo: modelConfig,
                modelData: modelData,
            });
        } catch (ex) {
            errorHandler(ex);
        }
    };

    const handleOnDelete = async (data) => {
        await api.deleteModelData(model, data.id);
        await search();
    };

    const setEditData = async (data) => {
        navigate(`../${model}/${data.id}`);
    };

    const handleOnSave = async (formData, overwrite = false) => {
        try {
            await api.saveModelData(model, formData, packageData, overwrite);
            await search();
        } catch (ex) {
            errorHandler(ex);
        }
    };

    const handleOnSaveBatch = async (formData, overwrite = false) => {
        try {
            await api.saveModelData(model, formData, packageData, overwrite);
            return true;
        } catch (ex) {
            errorHandler(ex);
        }
    };

    const addCreateData = (e) => {
        navigate("./new");
    };

    const { modelInfo, modelData } = modelConfig;
    return (
        <div>
            {!modelData && <h1>Loading...</h1>}
            {modelData && (
                <ModelTable
                    modelInfo={modelInfo}
                    buttonsConfig={buttonsConfig}
                    modelData={Object.values(modelData.results)}
                    onAddData={addCreateData}
                    onDeleteData={handleOnDelete}
                    onEditData={setEditData}
                    onSearchData={search}
                    onSaveData={handleOnSave}
                    total={modelData.count}
                    onSaveDataBatch={handleOnSaveBatch}
                />
            )}
        </div>
    );
};

export default ModelAdmin;
