import React from "react";
import { Link, Outlet } from "react-router-dom";
import { createUseStyles } from "react-jss";
import { Layout, Menu } from "antd";

const { Header, Content } = Layout;

const useStyles = createUseStyles({
    header: {
        backgroundColor: "white",
    },
    content: {
        padding: "20px",
        backgroundColor: "white",
    },
});
export default function CustomLayout() {
    const classes = useStyles();
    return (
        <Layout>
            <Header className={classes.header}>
                <Menu
                    // theme="dark"
                    mode="horizontal"
                    defaultSelectedKeys={["2"]}>
                    <Menu.Item key="home">
                        <Link to="/">Inicio</Link>
                    </Menu.Item>
                    <Menu.Item key="packages">
                        <Link to="/packages">Packages</Link>
                    </Menu.Item>
                </Menu>
            </Header>
            <Content className={classes.content}>
                <Outlet />
            </Content>
        </Layout>
    );
}
