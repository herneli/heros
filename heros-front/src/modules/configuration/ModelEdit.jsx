import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, useParams } from "react-router";

import * as api from "./api";
import errorHandler from "./errorHandler";
import { usePackage } from "../packages/PackageContext";

import ModelEditor from "./components/ModelEditor";

const ModelEdit = ({ model, onElementLoad }) => {
    const [modelConfig, setModelConfig] = useState({
        modelInfo: null,
    });
    const [edit, setEdit] = useState(null);

    const packageData = usePackage();

    let navigate = useNavigate();
    const { state } = useLocation();
    const { id } = useParams();

    useEffect(() => {
        loadModelConfig();
    }, [model]);

    useEffect(() => {
        loadElement();
    }, [state]);

    const loadElement = async () => {
        setEdit(null);

        if (id === "new") {
            setEdit({});
        } else {
            await setEditData(id);
        }
    };

    const loadModelConfig = async () => {
        try {
            const modelConfig = await api.getModelInfo(model);
            setModelConfig({
                modelInfo: modelConfig,
            });
        } catch (ex) {
            errorHandler(ex);
        }
    };

    const setEditData = async (id) => {
        const editModel = await api.getModelData(model, id);

        setEdit(editModel);
        if (onElementLoad) onElementLoad(editModel);
    };

    const handleOnSave = async (formData, overwrite = false) => {
        try {
            await api.saveModelData(model, formData, packageData, overwrite);

            navigate("../" + model);
        } catch (ex) {
            errorHandler(ex);
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
                        navigate(".");
                    }}
                    onClose={() => {
                        setEdit(null);
                    }}
                    onChange={({ formData }) => onElementLoad && onElementLoad(formData)}
                    onSave={handleOnSave}
                />
            )}
        </div>
    );
};

export default ModelEdit;
