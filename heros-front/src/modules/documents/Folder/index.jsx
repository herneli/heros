import DocumentCard from "../DocumentCard";
import Folder from "./Folder";

const registry = {
    displayModes: {
        fullScreen: Folder,
        card: DocumentCard,
    },
    emoji: "📁",
    name: "Carpeta",
    settingsSchema: {
        type: "object",
        properties: {
            name: { type: "string", title: "Nombre" },
        },
    },
};

export default registry;
