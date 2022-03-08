import DocumentCard from "../DocumentCard";
import LabResults from "./LabResults";
const registry = {
    displayModes: {
        fullScreen: LabResults,
        card: DocumentCard,
    },
    emoji: "🩸",
    name: "Resultados de laboratorio",
    settingsSchema: {
        type: "object",
        properties: {
            name: { type: "string", title: "Nombre" },
            patient: { type: "string", title: "Paciente" },
            dateFrom: { type: "date", title: "Fecha desde" },
            dateTo: { type: "date", title: "Fecha hasta" },
        },
    },
    parameters: ["patient", "dateFrom", "dateTo"],
};
export default registry;
