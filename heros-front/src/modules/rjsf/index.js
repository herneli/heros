import AntdArrayFieldTemplate from "./AntdArrayFieldTemplate";
import AntdObjectFieldTemplate from "./AntdObjectFieldTemplate";
import SelectRemoteWidget from "./SelectRemoteWidget";
import SelectRemoteWithPackageWidget from "./SelectRemoteWithPackageWidget";
import AceEditorWidget from "./AceEditorWidget";
import ScriptField from "./ScriptField";
import SwitchField from "./SwitchField";
import ColorField from "./ColorField";

const formOptions = {
    widgets: {
        SelectRemoteWidget,
        SelectRemoteWithPackageWidget,
        ColorField,
        AceEditorWidget,
    },
    fields: { ScriptField },
    ArrayFieldTemplate: AntdArrayFieldTemplate,
    ObjectFieldTemplate: AntdObjectFieldTemplate,
};

export default formOptions;
