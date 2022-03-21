import React, { Component } from "react";
import SchemaField from "@rjsf/core/lib/components/fields/SchemaField";
import FieldTemplate from "@rjsf/antd/dist/cjs/templates/FieldTemplate";

export default class SchemaFieldExpression extends Component {
    render() {
        if (this.props.schema.oneOf) {
            // let uiSchema = this.props.uiSchema || {};
            // uiSchema["ui:FieldTemplate"] = ({ children }) => {
            //     return <>{children}</>;
            // };
            return <SchemaField {...this.props} />;
        } else {
            return <SchemaField {...this.props} />;
        }
    }
}
