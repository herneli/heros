import { Spin } from "antd";
import axios from "axios";
import React, { useEffect, useState } from "react";
import DocumentRegistry from "./DocumentRegistry";

const registry = new DocumentRegistry();

export default function Document({ id, documentType, code, displayMode = "edit" }) {
    const [document, setDocument] = useState();
    useEffect(() => {
        if (id) {
            axios.get("api/documents/" + id.toString()).then((response) => {
                setDocument(response.data);
            });
        } else if (documentType && code) {
            axios.get("api/documents/get_by_code/" + documentType + "/" + code).then((response) => {
                setDocument(response.data);
            });
        }
    }, [id, documentType, code]);

    if (!document) {
        return <Spin />;
    }

    const documentRegistry = registry.getRegistry(document.documentType);
    let Component;
    switch (displayMode) {
        case "edit":
            Component = documentRegistry.Edit;
            return <Component document={document} displayMode={displayMode} />;
        case "card":
            Component = documentRegistry.Card;
            return <Component document={document} displayMode={displayMode} />;
    }
    return null;
}
