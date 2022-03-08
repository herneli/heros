import React from "react";
import DocumentRegistry from "./DocumentRegistry";
import { createUseStyles } from "react-jss";
import { whitespace } from "jshint/src/reg";
import { Button, Col, Row } from "antd";

const useStyles = createUseStyles({
    card: {
        backgroundColor: whitespace,
        border: "1px solid gray",
        width: "200px",
        height: "200px",
        margin: 10,
        padding: 10,
        display: "inline-block",
    },
});
export default function DocumentCard({ document, onShowSettings }) {
    const classes = useStyles();
    const registry = new DocumentRegistry();
    const documentRegistry = registry.getRegistry(document.documentType);
    return (
        <div className={classes.card}>
            <Row justify="end">
                <Col>
                    <Button size="small" onClick={() => onShowSettings(true)}>
                        Settings
                    </Button>
                </Col>
            </Row>
            <Row>
                <Col>
                    {documentRegistry.emoji} {document.data.name}
                </Col>
            </Row>
        </div>
    );
}
