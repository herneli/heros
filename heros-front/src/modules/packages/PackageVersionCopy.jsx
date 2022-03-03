import axios from "axios";
import React from "react";
import { useState } from "react";
import T from "i18n-react";
import { Form, Input, message, Modal } from "antd";
import { createUseStyles } from "react-jss";
import errorHandler from "../configuration/errorHandler";

const useStyles = createUseStyles({
    root: { padding: "20px" },
});

export default function PackageVersionCopy({ baseVersion, onOk, onCancel }) {
    let [newVersion, setNewVersion] = useState({});
    let classes = useStyles();

    const handleOnChange = (field) => (value) => {
        setNewVersion({ ...newVersion, [field]: value });
    };
    const handleSavePackageVersion = () => {
        if (!newVersion.version) {
            message.error(T.translate("packages.enter_required_fields"));
            return;
        }

        axios
            .post(`/configuration/packages/${baseVersion.package.id}/versions/${baseVersion.id}/copy/`, newVersion)

            .then((response) => {
                message.info(T.translate("packages.package_version_copy_successful"));
                onOk && onOk();
            })
            .catch(errorHandler(T.translate("packages.package_version_copy_error")));
    };

    return (
        <Modal visible={true} onCancel={onCancel} onOk={handleSavePackageVersion}>
            <Form layout="vertical" className={classes.root}>
                <Form.Item label={T.translate("packages.new_version")} required>
                    <Input value={newVersion.version} onChange={(e) => handleOnChange("version")(e.target.value)} />
                </Form.Item>
            </Form>
        </Modal>
    );
}
