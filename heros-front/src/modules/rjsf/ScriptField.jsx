import React, { useEffect } from "react";
import VisualScript from "../visual-script/VisualScript";
import axios from "axios";

export default function ScriptField({ name, formData, schema, uiSchema, onChange }) {
    useEffect(() => {
        if (!formData) {
            axios.get("/script/new/" + uiSchema["ui:options"].contextCode).then((response) => {
                onChange(response.data.data);
            });
        }
    });

    return <div>{formData ? <VisualScript script={formData} onChange={onChange} /> : null}</div>;
}
