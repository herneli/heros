import { Spin } from "antd";
import axios from "axios";
import React, { useEffect, useState } from "react";
import DocumentRegistry from "./DocumentRegistry";

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

    if (!documentState) {
        return <Spin />;
    }

    const documentRegistry = registry.getRegistry(documentState.documentType);
    let Component;
    switch (displayMode) {
        case "fullScreen":
            Component = documentRegistry.FullScreen;
            return <Component document={documentState} displayMode={displayMode} />;
        case "card":
            Component = documentRegistry.Card;
            return <Component document={documentState} displayMode={displayMode} />;
        default:
            throw Error(`Display mode ${displayMode} not expected`);
    }
}
