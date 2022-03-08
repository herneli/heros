import React from "react";
import Document from "../Document";

export default function Folder({ document }) {
    return (
        <div>
            <div>Folder {document.data.name}</div>
            <ul>
                {document.relationsAsBase
                    .filter((doc) => doc.relation === "children")
                    .map((doc) => {
                        return <Document key={doc.id} document={doc.documentRelated} displayMode="card" />;
                    })}
            </ul>
        </div>
    );
}
