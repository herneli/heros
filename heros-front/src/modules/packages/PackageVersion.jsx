import React, { useEffect, useState } from "react";
import { Layout, Menu, Tag } from "antd";
import { Routes, Route, useParams, Link } from "react-router-dom";
import axios from "axios";
import { createUseStyles } from "react-jss";
import PackageContextProvider from "./PackageContext";
import ModelAdmin from "../configuration/ModelAdmin";
import ModelEdit from "../configuration/ModelEdit";
import T from "i18n-react";

const { Content, Header, Sider } = Layout;

const useStyles = createUseStyles({
    header: {
        backgroundColor: "white",
        height: 40,
        lineHeight: "40px",
    },
    packageContent: {
        backgroundColor: "white",
        padding: "20px",
    },
});

const ModelAdminParams = () => {
    const params = useParams();
    return <ModelAdmin model={params.model} />;
};

const ModelEditParams = () => {
    const params = useParams();
    return <ModelEdit model={params.model} />;
};

export default function PackageVersion() {
    const params = useParams();
    const [currentVersion, setCurrentVersion] = useState();
    const classes = useStyles();

    useEffect(() => {
        axios.get("/configuration/packages/" + params.packageId + "/versions/" + params.versionId).then((response) => {
            setCurrentVersion(response.data);
        });
    }, [params]);

    if (!currentVersion) {
        return "Loading";
    }
    const dependiencies = [currentVersion.id, ...(currentVersion.dependencies || [])];
    return (
        <PackageContextProvider currentVersion={currentVersion} dependencies={dependiencies}>
            <Layout>
                <Header className={classes.header} style={{ backgroundColor: "#deefff" }}>
                    <Tag color={"geekblue"}>
                        {currentVersion?.package?.name} ({currentVersion?.package?.code}/{currentVersion.version})
                    </Tag>
                </Header>
                <Layout>
                    <Sider width={200} className="adm-submenu">
                        <Menu mode="inline" style={{ height: "100%", borderRight: 0 }}>
                            <Menu.Item key="context">
                                <Link to={"context"}>{T.translate("packages.contexts")}</Link>
                            </Menu.Item>
                            <Menu.Item key="object">
                                <Link to={"object"}>{T.translate("packages.objects")}</Link>
                            </Menu.Item>
                            <Menu.Item key="method">
                                <Link to={"method"}>{T.translate("packages.methods")}</Link>
                            </Menu.Item>
                        </Menu>
                    </Sider>
                    <Content className={classes.packageContent}>
                        <Routes>
                            <Route path={":model"} element={<ModelAdminParams />} />
                            <Route path=":model/:id" element={<ModelEditParams />} />
                        </Routes>
                    </Content>
                </Layout>
            </Layout>
        </PackageContextProvider>
    );
}
