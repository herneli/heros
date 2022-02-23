import "moment/locale/es";
import locale from "antd/lib/locale/es_ES";
import "./App.css";
import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import axios from "axios";
import { ConfigProvider } from "antd";
import Document from "./documents/Document";
import { Spin } from "antd";
import { useEffect, useState } from "react";
import fileTexts from "./i18n/texts_es.json";
import Packages from "./modules/packages/Packages";
import PackageVersion from "./modules/packages/PackageVersion";
import T from "i18n-react";
// Set axios defauts
axios.defaults.baseURL = process.env.REACT_APP_API_URL;

function App() {
    const [loaded, setLoaded] = useState();
    useEffect(() => {
        T.setTexts(fileTexts);
        setLoaded(true);
    }, []);
    return loaded ? (
        <ConfigProvider locale={locale}>
            <Routes>
                <Route path="/" element={<Layout />}>
                    <Route index element={<Document documentType="folder" code="root" displayMode="fullScreen" />} />
                    <Route path="packages">
                        <Route index element={<Packages />} />
                        <Route path={":packageId/versions/:versionId/*"} element={<PackageVersion />} />
                    </Route>
                </Route>
            </Routes>
        </ConfigProvider>
    ) : (
        <Spin />
    );
}

export default App;
