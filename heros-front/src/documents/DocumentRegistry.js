import FileMetadata from "./File";
import FolderMetadata from "./Folder";

export default class DocumentRegistry {
    constructor() {
        this.documents = {
            folder: FolderMetadata,
            file: FileMetadata,
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

    getRegistry(documentType) {
        const registry = this.documents[documentType];
        if (!registry) {
            throw new Error(`Document type ${documentType} not found`);
        } else {
            return registry;
        }
    }
}
