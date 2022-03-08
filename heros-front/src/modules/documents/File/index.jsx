import DocumentCard from "../DocumentCard";
import File from "./File";
const registry = {
    displayModes: {
        fullScreen: File,
        card: DocumentCard,
    },
    emoji: "📄",
    name: "Fichero",
    settingsSchema: {
        type: "object",
        properties: {
            name: { type: "string", title: "Nombre" },
            file: { type: "string", title: "Ruta fichero" },
        },
    },
};
export default registry;
