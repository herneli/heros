import axios from "axios";
import React, { useEffect } from "react";
import { useState } from "react";
import T from "i18n-react";
import { Form, message, Modal, Select } from "antd";
import { createUseStyles } from "react-jss";
import errorHandler from "../configuration/errorHandler";

const useStyles = createUseStyles({
    root: { padding: "20px" },
});

export default function PackageVersionImport({ packageId, onOk, onCancel }) {
    let [state, setState] = useState({});
    let [versionOptions, setVersionOptions] = useState();
    let classes = useStyles();

    useEffect(() => {
        axios(`/configuration/packages/${packageId}/missing_branches`).then((response) => {
            setVersionOptions(response.data.map((version) => ({ label: version, value: version })));
        });
    }, [packageId]);

    const handleOnChange = (field) => (value) => {
        setState({ ...state, [field]: value });
    };
    const handleSavePackageVersion = () => {
        if (!state.version) {
            message.error(T.translate("packages.enter_required_fields"));
            return;
        }

        axios
            .post(`/configuration/packages/${packageId}/import/${state.version}/`)
            .then((response) => {
                message.info(T.translate("packages.package_version_import_successful"));
                onOk && onOk();
            })
            .catch(errorHandler(T.translate("packages.package_version_import_error")));
    };

    return (
        <Modal visible={true} onCancel={onCancel} onOk={handleSavePackageVersion}>
            <Form layout="vertical" className={classes.root}>
                <Form.Item label={T.translate("packages.version")} required>
                    <Select
                        value={state.version}
                        options={versionOptions}
                        onChange={handleOnChange("version")}
                        loading={!versionOptions}
                    />
                </Form.Item>
            </Form>
        </Modal>
    );
}
