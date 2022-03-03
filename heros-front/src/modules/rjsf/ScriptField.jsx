import React, { useEffect } from "react";
import VisualScript from "../visual-script/VisualScript";
import { Spin } from "antd";
export default function ScriptField({ name, formData, schema, uiSchema, onChange }) {
    useEffect(() => {
        if (!formData || Object.keys(formData).length === 0) {
            if (uiSchema["ui:options"] && uiSchema["ui:options"].default) {
                // If setTimeout is not placed, onchange is not triggering changes - JH
                setTimeout(() => {
                    onChange(uiSchema["ui:options"].default);
                }, 1);
            }
        }
    }, []);

    if (formData && Object.keys(formData).length !== 0) {
        return (
            <div>
                <VisualScript script={formData} onChange={onChange} />
            </div>
        );
    } else {
        return <Spin />;
    }
}
