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
                        return (
                            <li key={doc.id}>
                                <Document id={doc.documentRelated.id} displayMode="card" />
                            </li>
                        );
                    })}
            </ul>
        </div>
    );
}
