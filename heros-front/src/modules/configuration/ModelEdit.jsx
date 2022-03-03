import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router";

import * as api from "./api";
import errorHandler from "./errorHandler";
import { usePackage } from "../packages/PackageContext";

import ModelEditor from "./components/ModelEditor";

const ModelEdit = ({ model, onElementLoad }) => {
    let navigate = useNavigate();
    const { id } = useParams();
    const [modelConfig, setModelConfig] = useState({
        modelInfo: null,
    });
    const [edit, setEdit] = useState(null);
    const setEditData = useCallback(
        async (id) => {
            const editModel = await api.getModelData(model, id);

            setEdit(editModel);
            if (onElementLoad) onElementLoad(editModel);
        },
        [onElementLoad, model]
    );
    const loadModelConfig = useCallback(async () => {
        try {
            const modelConfig = await api.getModelInfo(model);
            setModelConfig({
                modelInfo: modelConfig,
            });
        } catch (ex) {
            errorHandler()(ex);
        }
    }, [model]);
    const loadElement = useCallback(async () => {
        setEdit(null);

        if (id === "new") {
            setEdit({});
        } else {
            await setEditData(id);
        }
    }, [id, setEditData]);

    const packageData = usePackage();

    useEffect(() => {
        loadModelConfig();
    }, [loadModelConfig, model]);

    useEffect(() => {
        loadElement();
    }, [loadElement]);

    const handleOnSave = async (formData, overwrite = false) => {
        try {
            await api.saveModelData(model, formData, packageData, overwrite);

            navigate("..");
        } catch (ex) {
            errorHandler()(ex);
        }
    };

    const { modelInfo } = modelConfig;
    return (
        <div>
            {!modelInfo && <h1>Loading...</h1>}
            {modelInfo && (
                <ModelEditor
                    schema={modelInfo.schema}
                    uiSchema={modelInfo.uiSchema}
                    data={edit}
                    onCancel={() => {
                        navigate("..");
                    }}
                    onChange={({ formData }) => onElementLoad && onElementLoad(formData)}
                    onSave={handleOnSave}
                />
            )}
        </div>
    );
};

export default ModelEdit;
