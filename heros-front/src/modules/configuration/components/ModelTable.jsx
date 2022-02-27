import React, { useState, useEffect } from "react";
import { Button, Col, Row, Input, Table, message, Popconfirm } from "antd";
import { createUseStyles } from "react-jss";
import T from "i18n-react";
// import ModelOverwriteDialog from "./ModelOverwriteDialog";
import { mdiUpload, mdiPlus, mdiDelete, mdiContentCopy, mdiDownload, mdiPencil } from "@mdi/js";
import Icon from "@mdi/react";
const { Search } = Input;

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

export default function ModelTable({
    modelInfo,
    modelData,
    onAddData,
    onDeleteData,
    onEditData,
    onSaveData,
    total,
    onSearchData,
    onSaveDataBatch,
    buttonsConfig,
}) {
    const [importItems] = useState();
    const [searchString] = useState();
    const [pagination, setPagination] = useState({});
    const classes = useStyles();

    //ComponentDidMount
    useEffect(() => {
        onSearchData();
    }, [onSearchData]);

    useEffect(() => {
        setPagination({ total: total, showSizeChanger: true, pageSize: 100 });
    }, [total]);

    const calculateColumns = (info) => {
        if (info) {
            let columns = info.listFields.map((field) => ({
                title: field.title,
                key: field.key,
                dataIndex: field.field,
                sorter: true,
            }));

            columns.push({
                title: T.translate("configuration.actions"),
                key: "_actions",
                fixed: "right",
                width: 180,
                render: (text, record) => (
                    <Row justify="center">
                        {record.editable !== false && (
                            <Button
                                icon={<Icon path={mdiPencil} className={classes.icon} />}
                                type="text"
                                title={T.translate("common.button.edit")}
                                onClick={(e) => handleOnRowClick(record)}
                            />
                        )}

                        {(!buttonsConfig || buttonsConfig.clone) && (
                            <Popconfirm
                                title={T.translate("configuration.do_you_want_to_duplicate_the_item")}
                                onConfirm={(e) => handleOnDuplicateModel(e, record)}>
                                <Button
                                    icon={<Icon path={mdiContentCopy} className={classes.icon} />}
                                    type="text"
                                    title={T.translate("common.button.duplicate")}
                                />
                            </Popconfirm>
                        )}
                        {(!buttonsConfig || buttonsConfig.download) && (
                            <Button
                                icon={<Icon path={mdiDownload} className={classes.icon} />}
                                type="text"
                                title={T.translate("common.button.download")}
                                onClick={(e) => handleOnDownloadModel(e, record)}
                            />
                        )}
                        {record.editable !== false && (
                            <Popconfirm
                                title={T.translate("configuration.do_you_want_to_delete_the_item")}
                                onConfirm={(e) => handleOnDeleteModel(e, record)}>
                                <Button
                                    icon={<Icon path={mdiDelete} className={classes.icon} />}
                                    type="text"
                                    title={T.translate("common.button.delete")}
                                />
                            </Popconfirm>
                        )}
                    </Row>
                ),
            });
            return columns;
        } else {
            return null;
        }
    };

    const columns = calculateColumns(modelInfo);

    const handleOnRowClick = (rowData) => {
        onEditData(rowData);
    };

    const handleOnDeleteModel = (e, row) => {
        onDeleteData(row);
    };

    const handleOnDuplicateModel = (e, row) => {
        const newItem = {
            ...row,
            id: null,
            code: `${row.code}_CLONED`,
            name_: `${row.name} CLONED`,
        };
        onSaveData(newItem);
    };

    const downloadJsonFile = (data, filename) => {
        let filedata = JSON.stringify(data, null, 2);
        const blob = new Blob([filedata], {
            type: "application/json",
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.download = filename;
        link.href = url;
        link.click();
    };

    const uploadJsonFile = () => {
        return new Promise((resolve, reject) => {
            const uploadFile = (file) => {
                try {
                    var reader = new FileReader();
                    reader.onload = (readerEvent) => {
                        var content = readerEvent.target.result; // this is the content!
                        var data = JSON.parse(content);
                        resolve(data);
                    };
                    reader.readAsText(file, "UTF-8");
                } catch (error) {
                    reject(error);
                }
            };

            var input = document.createElement("input");
            input.type = "file";
            input.accept = "application/json";
            input.onchange = (e) => uploadFile(e.target.files[0]);
            input.click();
        });
    };

    const handleOnDownloadModel = (e, row) => {
        const data = [row];
        const code = row.code || row.name;

        downloadJsonFile(data, `${modelInfo.code}.${code}.json`);
    };

    const handleDownloadTable = (data) => {
        downloadJsonFile(data, `${modelInfo.code}.json`);
    };

    const handleUploadTable = () => {
        uploadJsonFile()
            .then((importItems) => {
                const promises = importItems.map((item) =>
                    onSaveDataBatch(modelInfo.id_mode === "uuid" ? { ...item } : { ...item, id: null }, false)
                );
                Promise.all(promises).then((values) => {
                    message.info(T.translate("configuration.end_of_loading_json_file"));
                    onSearchData();
                });
            })
            .catch((error) => message.error(T.translate("configuration.error_loading_json_file")));
    };

    // const handleOnCheckAction = (checked) => {
    //     const items = importItems;
    //     setImportItems(null);
    //     const promises = items.map((item) =>
    //         onSaveData({ ...item, id: null }, checked)
    //     );
    //     Promise.all(promises).then((values) => {
    //         message.info(T.translate("configuration.end_of_loading_json_file"));
    //     });
    // };

    let filteredData = !searchString ? modelData : "";

    if (!columns) {
        return <h1>Loading...</h1>;
    }

    return (
        <div>
            {/* {importItems && (
        <ModelOverwriteDialog
          open={!!importItems}
          onCheckAction={handleOnCheckAction}
          onClose={() => setImportItems(null)}
        />
      )} */}
            {importItems ? <h1>Imported items</h1> : null}

            <Row>
                <Col flex={1}>
                    <Search className={classes.search} onSearch={(element) => onSearchData()} enterButton />
                </Col>
                <Col flex={2}>
                    <Row justify="end" gutter={10}>
                        <Col>
                            {(!buttonsConfig || buttonsConfig.uploadTable) && (
                                <Button
                                    icon={<Icon path={mdiUpload} className={classes.icon} />}
                                    type="text"
                                    onClick={handleUploadTable}
                                />
                            )}
                        </Col>
                        <Col>
                            {(!buttonsConfig || buttonsConfig.downloadTable) && (
                                <Button
                                    icon={<Icon path={mdiDownload} className={classes.icon} />}
                                    type="text"
                                    onClick={() => handleDownloadTable(filteredData)}
                                />
                            )}
                        </Col>
                        <Col>
                            {(!buttonsConfig || buttonsConfig.add) && (
                                <Button
                                    icon={<Icon path={mdiPlus} className={classes.icon} />}
                                    type="text"
                                    onClick={onAddData}
                                />
                            )}
                        </Col>
                    </Row>
                </Col>
            </Row>
            <Table
                columns={columns}
                dataSource={filteredData}
                pagination={pagination}
                rowKey={"id"}
                sort
                onChange={onSearchData}
                bordered
                size="small"
            />
        </div>
    );
}
