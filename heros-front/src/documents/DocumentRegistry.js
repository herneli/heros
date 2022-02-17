import File from "./File";
import Folder from "./Folder";

export default class DocumentRegistry {
    constructor() {
        this.documents = {
            folder: Folder,
            file: File,
        };
    }

    getComponent(documentType) {
        const registry = this.documents[documentType];
        if (!registry) {
            throw new Error(`Document type ${documentType} not found`);
        } else {
            return registry.Component;
        }
    }
}
