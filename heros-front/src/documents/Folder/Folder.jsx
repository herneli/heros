import React from "react";
import Document from "../Document";

export default function Folder({ document }) {
    return (
        <div>
            <div>Folder {document.data.name}</div>
            <ul>
                {document.relations_as_base
                    .filter((doc) => doc.relation === "children")
                    .map((doc) => {
                        return (
                            <li key={doc.id}>
                                <Document id={doc.document_related.id} />
                            </li>
                        );
                    })}
            </ul>
        </div>
    );
}
