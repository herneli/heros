import React from "react";
import DocumentRegistry from "./DocumentRegistry";

export default function DocumentCard({ document }) {
    const registry = new DocumentRegistry();
    const documentRegistry = registry.getRegistry(document.documentType);
    return (
        <div>
            Document Card {documentRegistry.emoji} {document.data.name}{" "}
        </div>
    );
}
