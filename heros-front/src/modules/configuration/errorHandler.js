import { message } from "antd";

const errorHandler = (defaultMessage) => (reason) => {
    if (reason.response && reason.response.data && reason.response.data.detail) {
        message.error(reason.response.data.detail);
    } else if (defaultMessage) {
        message.error(defaultMessage);
    } else {
        message.error("Internal Server Error");
    }
};

export default errorHandler;
