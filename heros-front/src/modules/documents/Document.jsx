import { Spin } from "antd";
import axios from "axios";
import React, { useEffect, useState } from "react";
import DocumentRegistry from "./DocumentRegistry";
import DocumentSettings from "./DocumentSettings";

const registry = new DocumentRegistry();

/**
 * Description of the function
 *
 * @param {Object} config - The configuration
 * @param {Object} [config.document] - Optional code
 * @param {BigInteger} config.id - Optioan Document id
 * @param {String} [config.documentType] - Optional document type
 * @param {String} [config.code] - Optional code
 * @param {"fullScreen"|"card"|"listItem"|"widget"} [config.displayMode] - Optional code
 */
export default function Document({ id, documentType, code, document, displayMode = "fullScreen" }) {
    const [documentState, setDocumentState] = useState();
    const [settingsVisible, setSettingsVisible] = useState(false);
    useEffect(() => {
        if (document) {
            setDocumentState(document);
        } else if (id) {
            axios.get("api/documents/" + id.toString()).then((response) => {
                setDocumentState(response.data);
            });
        } else if (documentType && code) {
            axios.get("api/documents/get_by_code/" + documentType + "/" + code).then((response) => {
                setDocumentState(response.data);
            });
        }
    }, [document, id, documentType, code]);

    const handleOnShowSettings = (visible) => {
        setSettingsVisible(visible);
    };

    if (!documentState) {
        return <Spin />;
    }

    const documentRegistry = registry.getRegistry(documentState.documentType);
    try {
        const Component = documentRegistry.displayModes[displayMode];
        return (
            <>
                <Component document={documentState} displayMode={displayMode} onShowSettings={handleOnShowSettings} />
                {settingsVisible ? (
                    <DocumentSettings document={documentState} onClose={() => handleOnShowSettings(false)} />
                ) : null}
            </>
        );
    } catch {
        throw Error(`Display mode ${displayMode} not expected`);
    }
}
