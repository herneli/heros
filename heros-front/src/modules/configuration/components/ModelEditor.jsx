import React, { useState } from "react";
import { createUseStyles } from "react-jss";
import { Button, Row, Space } from "antd";
import T from "i18n-react";
import { useEffect } from "react";
import formConfig from "../../rjsf";
import Form from "@rjsf/antd";

const useStyles = createUseStyles({
    tableWrapper: {
        padding: 15,
    },
    paper: {
        padding: 20,
    },
    leftActions: {
        float: "left",
    },
    rightActions: {
        float: "right",
    },
});

export default function ModelEditor({ data, schema, uiSchema, onCancel, onSave, onChange }) {
    const classes = useStyles();
    const [currentData, setCurrentData] = useState(data);

    useEffect(() => {
        if (data) {
            setCurrentData({ id: data.id, code: data.code, ...data.data });
        }
    }, [data]);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const handleOnSave = (event) => {
        onSave(event.formData);
    };

    return (
        <div className={classes.tableWrapper}>
            <Button onClick={onCancel}>{T.translate("configuration.return")}</Button>
            {currentData ? (
                <Form
                    ObjectFieldTemplate={formConfig.ObjectFieldTemplate}
                    ArrayFieldTemplate={formConfig.ArrayFieldTemplate}
                    widgets={formConfig.widgets}
                    fields={formConfig.fields}
                    schema={schema}
                    uiSchema={uiSchema}
                    omitExtraData={false}
                    formData={currentData}
                    onSubmit={handleOnSave}
                    onChange={(e) => {
                        setCurrentData({ ...currentData, ...e.formData });
                        if (onChange) onChange(e);
                    }}>
                    <Row justify="end">
                        <Space>
                            <Button onClick={onCancel}>{T.translate("configuration.return")}</Button>
                            <Button className={classes.rightActions} htmlType="submit" type="primary">
                                {T.translate("configuration.save")}
                            </Button>
                        </Space>
                    </Row>
                </Form>
            ) : null}
        </div>
    );
}
