import React from "react";

export default function File({ document, displayMode }) {
    switch (displayMode) {
        case "edit":
            return <div>File edit {document.data.name}</div>;
        case "card":
            return <div>File card {document.data.name}</div>;
        default:
            throw Error(`Display model ${displayMode} not expected`);
    }
}
