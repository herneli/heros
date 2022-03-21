import { Button, Divider, Modal, Row, Spin } from "antd";
import React, { useEffect, useState } from "react";
import DocumentRegistry from "./DocumentRegistry";
import ScriptForm from "../visual-script/rjsf/ScriptForm";
import ScriptContextProvider from "../visual-script/ScriptContext";
import convertToExpressionSchema from "../visual-script/expressions/convertToExpressionSchema";

const registry = new DocumentRegistry();

export default function DocumentSettings({ document, onClose }) {
    const [state, setState] = useState(null);

    useEffect(() => {
        const documentRegistry = registry.getRegistry(document.documentType);
        const { schema, uiSchema } = convertToExpressionSchema(
            documentRegistry.settingsSchema,
            documentRegistry.settingsUiSchema,
            {}
        );
        // const schema = documentRegistry.settingsSchema;
        // const uiSchema = documentRegistry.settingsUiSchema;
        setState({ schema, uiSchema, data: { id: document.id, code: document.code, ...document.data } });
    }, [document.documentType]);

    const handleOnSave = (a, b, c) => {
        console.log(a, b, c);
    };
    if (!state) {
        return <Spin />;
    }
    return (
        <Modal visible={true} onCancel={onClose} footer={false}>
            <div>DocumentSettings</div>
            <ScriptForm formData={state.data} schema={state.schema} uiSchema={state.uiSchema} onSubmit={handleOnSave}>
                <Divider />
                <Row justify="end">
                    <Button type="primary" htmlType="submit">
                        Guardar
                    </Button>
                </Row>
            </ScriptForm>
        </Modal>
    );
}
