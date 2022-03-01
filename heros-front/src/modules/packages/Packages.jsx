import React, { useEffect, useState } from "react";
import { Col, Row, Spin, Table, Layout, Button, message, notification, Input, Popconfirm } from "antd";
import T from "i18n-react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Icon from "@mdi/react";
import {
    mdiApplicationCogOutline,
    mdiCloudDownload,
    mdiCloudUpload,
    mdiContentCopy,
    mdiDelete,
    mdiGraph,
    mdiImport,
    mdiPlus,
    mdiRefresh,
} from "@mdi/js";
import { createUseStyles } from "react-jss";

import PackageNew from "./PackageNew";
import PackageVersionCopy from "./PackageVersionCopy";
import PackageVersionImport from "./PackageVersionImport";
import PackageVersionDependencies from "./PackageVersionDependencies";

const { Search } = Input;
const { Content } = Layout;
const useStyles = createUseStyles({
    card: {
        margin: 10,
    },
    search: {
        marginBottom: 15,
    },
    button: {
        fontSize: 10,
    },
    icon: {
        color: "#3d99f6",
        width: 20,
        height: 20,
    },
});

export default function Packages() {
    const navigate = useNavigate();
    const classes = useStyles();
    const [packages, setPackages] = useState();
    const [dialogActive, setDialogActive] = useState();
    const [searchTerm, setSearchTerm] = useState("");
    const loadPackages = () => {
        axios.get("/configuration/packages").then((response) => {
            setPackages(response.data.results.map((item) => ({ ...item, key: item.id })));
        });
    };
    useEffect(() => {
        loadPackages();
    }, []);

    const handleOnPublish = (packageId, versionId) => () => {
        axios
            .post(`/configuration/packages/${packageId}/versions/${versionId}/publish/`)
            .then((response) => {
                message.info(T.translate("packages.publish_successful"));
                loadPackages();
            })
            .catch((error) => {
                notification.error({ message: T.translate("packages.publish_error") });
            });
    };

    const handleOnCopy = (packageVersion) => () => {
        setDialogActive({ code: "copyVersion", payload: packageVersion });
    };

    const handleOnImport = (packageId, versionId) => () => {
        axios
            .get(`/configuration/packages/${packageId}/versions/${versionId}/import_remote`)
            .then((response) => {
                message.info(T.translate("packages.import_successful"));
                loadPackages();
            })
            .catch((error) => {
                notification.error({ message: T.translate("packages.import_error") });
            });
    };
    const handleOnRefreshStatus = (packageId) => () => {
        axios
            .get(`/configuration/packages/${packageId}/update_remote_status`)
            .then((response) => {
                message.info(T.translate("packages.remote_status_updated"));
                loadPackages();
            })
            .catch((error) => {
                notification.error({ message: T.translate("packages.remote_status_error") });
            });
    };

    const handleOnAddPackage = () => {
        setDialogActive({ code: "newPackage", payload: null });
    };

    const handleOnManageDepencencies = (version) => () => {
        setDialogActive({ code: "manageDependencies", payload: version });
    };

    const handleOnImportVersion = (packageId) => () => {
        setDialogActive({ code: "importVersion", payload: packageId });
    };

    const handleOnDeletePackage = (id) => () => {
        axios
            .delete(`/configuration/packages/${id}`)
            .then((response) => {
                message.info(T.translate("packages.delete_successful"));
                loadPackages();
            })
            .catch((error) => {
                notification.error({ message: T.translate("packages.delete_error") });
            });
    };

    const handleOnDeletePackageVersion = (packageId, id) => () => {
        axios
            .delete(`/configuration/packages/${packageId}/versions/${id}`)
            .then((response) => {
                message.info(T.translate("packages.delete_successful"));
                loadPackages();
            })
            .catch((error) => {
                notification.error({ message: T.translate("packages.delete_error") });
            });
    };

    const renderExpandable = (packageData) => {
        let extendedColumns = [
            { title: T.translate("packages.version"), key: "version", dataIndex: "version" },
            {
                title: T.translate("packages.local_commit"),
                key: "localCommit",
                dataIndex: "localCommit",
                render: (value) => value && value.substring(0, 7),
            },
            {
                title: T.translate("packages.remote_commit"),
                key: "remoteCommit",
                dataIndex: "remoteCommit",
                render: (value) => value && value.substring(0, 7),
            },
            {
                title: "Acciones",
                key: "actions",
                render: (text, record) => {
                    return (
                        <>
                            {!packageData.remote || record.localCommit ? (
                                <Button
                                    type="text"
                                    onClick={() => navigate(packageData.id.toString() + "/versions/" + record.id)}
                                    icon={
                                        <Icon
                                            path={mdiApplicationCogOutline}
                                            title={T.translate("packages.configure")}
                                            className={classes.icon}
                                        />
                                    }></Button>
                            ) : null}
                            {packageData.remote && record.remoteCommit && record.remoteCommit !== record.localCommit ? (
                                <Button
                                    type="text"
                                    onClick={handleOnImport(packageData.id, record.id)}
                                    icon={
                                        <Icon
                                            path={mdiCloudDownload}
                                            title={T.translate("packages.import")}
                                            className={classes.icon}
                                        />
                                    }></Button>
                            ) : null}
                            {packageData.remote && record.localCommit && record.remoteCommit === record.localCommit ? (
                                <Button
                                    type="text"
                                    onClick={handleOnPublish(packageData.id, record.id)}
                                    icon={
                                        <Icon
                                            path={mdiCloudUpload}
                                            title={T.translate("packages.publish")}
                                            className={classes.icon}
                                        />
                                    }></Button>
                            ) : null}
                            {!packageData.remote || (record.remoteCommit && record.remoteCommit !== "initial") ? (
                                <Button
                                    type="text"
                                    onClick={handleOnCopy(record)}
                                    icon={
                                        <Icon
                                            path={mdiContentCopy}
                                            title={T.translate("packages.copy_version")}
                                            className={classes.icon}
                                        />
                                    }></Button>
                            ) : null}
                            <Button
                                type="text"
                                onClick={handleOnManageDepencencies(record)}
                                icon={
                                    <Icon
                                        path={mdiGraph}
                                        title={T.translate("packages.copy_version")}
                                        className={classes.icon}
                                    />
                                }
                            />
                            <Popconfirm
                                title={T.translate("packages.delete_package_version_confirmation")}
                                onConfirm={handleOnDeletePackageVersion(packageData.id, record.id)}>
                                <Button
                                    type="text"
                                    icon={
                                        <Icon
                                            path={mdiDelete}
                                            title={T.translate("packages.delete_package")}
                                            className={classes.icon}
                                        />
                                    }></Button>
                            </Popconfirm>
                        </>
                    );
                },
            },
        ];
        return (
            <Row style={{ margin: "10px" }}>
                <Col span={12}>
                    <Table
                        bordered
                        size="small"
                        columns={extendedColumns}
                        dataSource={packageData.versions}
                        pagination={false}
                        rowKey="version"
                    />
                </Col>
            </Row>
        );
    };

    const handleOnDialogCancel = () => {
        setDialogActive(null);
    };

    const handleOnDialogComplete = () => {
        setDialogActive(null);
        loadPackages();
    };

    const renderDialog = (dialog) => {
        switch (dialog.code) {
            case "newPackage":
                return <PackageNew onCancel={handleOnDialogCancel} onCreate={handleOnDialogComplete} />;
            case "importVersion":
                return (
                    <PackageVersionImport
                        packageId={dialog.payload}
                        onCancel={handleOnDialogCancel}
                        onOk={handleOnDialogComplete}
                    />
                );
            case "copyVersion":
                return (
                    <PackageVersionCopy
                        baseVersion={dialog.payload}
                        onCancel={handleOnDialogCancel}
                        onOk={handleOnDialogComplete}
                    />
                );
            case "manageDependencies":
                return (
                    <PackageVersionDependencies
                        version={dialog.payload}
                        onCancel={handleOnDialogCancel}
                        onOk={handleOnDialogComplete}
                    />
                );

            default:
                return null;
        }
    };

    const columns = [
        {
            title: T.translate("packages.id"),
            dataIndex: "id",
            key: "id",
        },
        {
            title: T.translate("packages.name"),
            dataIndex: "name",
            key: "name",
        },
        {
            title: T.translate("packages.code"),
            dataIndex: "code",
            key: "code",
        },
        {
            title: T.translate("packages.remote"),
            dataIndex: "remote",
            key: "remote",
        },
        {
            title: T.translate("packages.actions"),
            key: "actions",
            render: (key, record) => {
                return (
                    <>
                        {record.remote ? (
                            <>
                                <Button
                                    type="text"
                                    onClick={handleOnRefreshStatus(record.id)}
                                    icon={
                                        <Icon
                                            path={mdiRefresh}
                                            title={T.translate("packages.refresh_status")}
                                            className={classes.icon}
                                        />
                                    }
                                />
                                <Button
                                    type="text"
                                    onClick={handleOnImportVersion(record.id)}
                                    icon={
                                        <Icon
                                            path={mdiImport}
                                            title={T.translate("packages.import_version")}
                                            className={classes.icon}
                                        />
                                    }
                                />
                            </>
                        ) : null}
                        <Popconfirm
                            title={T.translate("packages.delete_package_confirmation")}
                            onConfirm={handleOnDeletePackage(record.id)}>
                            <Button
                                type="text"
                                icon={
                                    <Icon
                                        path={mdiDelete}
                                        title={T.translate("packages.delete_package")}
                                        className={classes.icon}
                                    />
                                }></Button>
                        </Popconfirm>
                    </>
                );
            },
        },
    ];

    if (!packages) {
        return <Spin></Spin>;
    }

    return (
        <>
            <Content>
                <Row className={classes.card}>
                    <Col flex={4}>
                        <Search
                            className={classes.search}
                            enterButton
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </Col>
                    <Col flex={2}>
                        <Row justify="end">
                            <Col>
                                <Button
                                    icon={<Icon path={mdiPlus} className={classes.icon} />}
                                    type="text"
                                    onClick={handleOnAddPackage}
                                />
                            </Col>
                        </Row>
                    </Col>
                </Row>

                <Table
                    style={{ margin: 10 }}
                    dataSource={packages}
                    columns={columns}
                    size="small"
                    bordered
                    expandable={{
                        expandedRowRender: renderExpandable,
                        rowExpandable: (record) => true,
                    }}></Table>
            </Content>
            {dialogActive ? renderDialog(dialogActive) : null}
        </>
    );
}
