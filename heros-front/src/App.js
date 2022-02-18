import "moment/locale/es";
import locale from "antd/lib/locale/es_ES";
import "./App.css";
import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import axios from "axios";
import T from "i18n-react";
import texts from "./i18n/texts_es.json";
import { ConfigProvider } from "antd";
import Home from "./pages/Home";
import Document from "./documents/Document";
// Set axios defauts
axios.defaults.baseURL = process.env.REACT_APP_API_URL;
T.setTexts(texts);

function App() {
    return (
        <ConfigProvider locale={locale}>
            <Routes>
                <Route path="/" element={<Layout />}>
                    <Route index element={<Document documentType="folder" code="root" displayMode="edit" />} />
                </Route>
            </Routes>
        </ConfigProvider>
    );
}

export default App;
