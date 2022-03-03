import AntdArrayFieldTemplate from "./AntdArrayFieldTemplate";
import AntdObjectFieldTemplate from "./AntdObjectFieldTemplate";
import SelectRemoteWidget from "./SelectRemoteWidget";
import SelectRemoteWithPackageWidget from "./SelectRemoteWithPackageWidget";
import AceEditorWidget from "./AceEditorWidget";
import ColorField from "./ColorField";
import ScriptField from "./ScriptField";

const formOptions = {
    widgets: {
        SelectRemoteWidget,
        SelectRemoteWithPackageWidget,
        ColorField,
        AceEditorWidget,
    },
    fields: { ScriptField: ScriptField },
    ArrayFieldTemplate: AntdArrayFieldTemplate,
    ObjectFieldTemplate: AntdObjectFieldTemplate,
};

export default formOptions;
