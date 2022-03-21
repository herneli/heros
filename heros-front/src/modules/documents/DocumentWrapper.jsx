import { notification, Spin } from "antd";
import React, { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import PackageContextProvider from "../packages/PackageContext";
import ScriptContextProvider from "../visual-script/ScriptContext";
import ScriptManager from "../visual-script/ScriptManager";
import axios from "axios";
import T from "i18n-react";

const manager = new ScriptManager({
    contextMember: {
        memberType: "context",
        code: "context",
        name: "context",
        type: {
            type: "object",
            objectCode: "orders.order_context",
        },
    },
    language: "python",
});

export default function DocumentWrapper() {
    const [currentVersion, setCurrentVersion] = useState();
    useEffect(() => {
        axios
            .get(
                `/configuration/versions/?package__code=${process.env.REACT_APP_DOCUMENTS_PACKAGE}&version=${process.env.REACT_APP_DOCUMENTS_VERSION}`
            )
            .then((response) => {
                if (response.data.results.length > 0) {
                    setCurrentVersion(response.data.results[0]);
                } else {
                    notification.error(T.translate("packages.document_package_not_found"));
                }
            });
    }, []);
    if (!currentVersion) {
        return <Spin />;
    }
    const dependiencies = [currentVersion.id, ...(currentVersion.dependencies || [])];
    return (
        <ScriptContextProvider manager={manager}>
            <PackageContextProvider currentVersion={currentVersion} dependencies={dependiencies}>
                <Outlet />
            </PackageContextProvider>
        </ScriptContextProvider>
    );
}
