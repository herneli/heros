import React from "react";
import { Form, Input, message, Modal, Select } from "antd";
import T from "i18n-react";
import { useState } from "react";
import { createUseStyles } from "react-jss";
import { useEffect } from "react";
import axios from "axios";
import errorHandler from "../configuration/errorHandler";

const useStyles = createUseStyles({
    root: { padding: "20px" },
});

export default function PackageNew({ onCancel, onCreate }) {
    const classes = useStyles();
    const [packageData, setPackageData] = useState({ placement: "local" });
    const [remotePackages, setRemotePackages] = useState(null);
    const handleOnChange = (field) => (value) => {
        setPackageData({ ...packageData, [field]: value });
    };

    const placementOptions = [
        { value: "local", label: T.translate("packages.placement_local") },
        { value: "remote", label: T.translate("packages.placement_remote") },
    ];

    useEffect(() => {
        if (!remotePackages) {
            axios.get("/configuration/packages/remote_list").then((response) => {
                let options = response.data
                    .filter((packageData) => !packageData.local)
                    .map((packageData) => ({
                        label: packageData.name + " (" + packageData.code + ")",
                        value: packageData.code,
                        item: packageData,
                    }));
                setRemotePackages(options);
            });
        }
    }, [remotePackages]);

    const handleSavePackage = () => {
        if (packageData.placement === "remote") {
            let data = remotePackages.find((entry) => entry.value === packageData.remotePackage);
            if (!data) {
                message.error(T.translate("packages.remote_package_not_selected"));
                return;
            }
            let { local, ...newPackageData } = data.item;

            axios
                .post("/configuration/packages/", newPackageData)
                .then((response) => {
                    message.info(T.translate("packages.package_save_successful"));
                    onCreate && onCreate();
                })
                .catch(errorHandler(T.translate("packages.package_save_error")));
        } else {
            if (!packageData.code || !packageData.name) {
                message.error(T.translate("packages.enter_required_fields"));
            }
            let newPackageData = {
                code: packageData.code,
                name: packageData.name,
                remote: packageData.remote,
                initialVersion: "1.0.0",
            };
            axios
                .post("/configuration/packages/", newPackageData)
                .then((response) => {
                    message.info(T.translate("packages.package_save_successful"));
                    onCreate && onCreate();
                })
                .catch(errorHandler(T.translate("packages.package_save_error")));
        }
    };

    return (
        <Modal visible={true} onCancel={onCancel} onOk={handleSavePackage}>
            <Form layout="vertical" className={classes.root}>
                <Form.Item label={T.translate("packages.placement")}>
                    <Select
                        value={packageData.placement}
                        options={placementOptions}
                        onChange={handleOnChange("placement")}
                    />
                </Form.Item>
                {packageData.placement === "local" ? (
                    <>
                        <Form.Item label={T.translate("packages.code")} required>
                            <Input value={packageData.code} onChange={(e) => handleOnChange("code")(e.target.value)} />
                        </Form.Item>
                        <Form.Item label={T.translate("packages.name")} required>
                            <Input value={packageData.name} onChange={(e) => handleOnChange("name")(e.target.value)} />
                        </Form.Item>
                        <Form.Item label={T.translate("packages.remote")}>
                            <Input
                                value={packageData.remote}
                                onChange={(e) => handleOnChange("remote")(e.target.value)}
                            />
                        </Form.Item>
                    </>
                ) : (
                    <>
                        <Form.Item label={T.translate("packages.remote_package")}>
                            <Select
                                value={packageData.remotePackage}
                                options={remotePackages}
                                loading={remotePackages === null}
                                onChange={handleOnChange("remotePackage")}></Select>
                        </Form.Item>
                    </>
                )}
            </Form>
        </Modal>
    );
}
