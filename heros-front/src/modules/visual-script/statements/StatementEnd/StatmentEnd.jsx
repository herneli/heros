import React from "react";
import StatementBox from "../StatementBox";
import registry from ".";

export default function StatementEnd({ statement, variables, onChange }) {
    return (
        <StatementBox
            statement={statement}
            variables={variables}
            title={statement.name}
            iconPath={registry.iconPath}
            hideActions={true}
            onChange={onChange}></StatementBox>
    );
}
