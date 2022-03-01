import axios from "axios";
import React, { useEffect } from "react";
import { useState } from "react";
import T from "i18n-react";
import { Form, message, Modal, notification, Select } from "antd";
import { createUseStyles } from "react-jss";

const useStyles = createUseStyles({
    root: { padding: "20px" },
});

export default function PackageVersionDependencies({ version, onOk, onCancel }) {
    let [state, setState] = useState({ dependencies: version.dependencies });
    let [versionOptions, setVersionOptions] = useState();
    let classes = useStyles();

    useEffect(() => {
        axios.get(`/configuration/packages/`).then((response) => {
            let options = [];
            response.data.results.forEach((packageData) => {
                if (packageData.versions && packageData.id !== version.package.id) {
                    packageData.versions.forEach((v) => {
                        options.push({
                            label: packageData.code + "/" + v.version,
                            value: v.id,
                        });
                    });
                }
            });
            setVersionOptions(options);
        });
    }, [version]);

    const handleOnChange = (field) => (value) => {
        setState({ ...state, [field]: value });
    };
    const handleSavePackageVersion = () => {
        axios
            .patch(`/configuration/packages/${version.package.id}/versions/${version.id}/`, {
                dependencies: state.dependencies,
            })
            .then((response) => {
                message.info(T.translate("packages.package_version_update_success"));
                onOk && onOk();
            })
            .catch((error) => {
                notification.error({ message: T.translate("packages.package_version_update_error") });
            });
    };

    return (
        <Modal visible={true} onCancel={onCancel} onOk={handleSavePackageVersion}>
            <Form layout="vertical" className={classes.root}>
                <Form.Item label={T.translate("packages.version")} required>
                    <Select
                        mode="multiple"
                        value={state.dependencies}
                        options={versionOptions}
                        onChange={handleOnChange("dependencies")}
                        loading={!versionOptions}
                    />
                </Form.Item>
            </Form>
        </Modal>
    );
}
