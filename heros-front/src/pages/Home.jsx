import { Button, Popover } from "antd";
import React from "react";

const content = (
    <div>
        <p>Content</p>
        <p>Content</p>
    </div>
);

export default function Home() {
    const handleOnVisibleChange = () => {
        console.log("Click");
    };
    return (
        <div>
            <h1>Home</h1>

            <Popover content={content} trigger="click" onVisibleChange={handleOnVisibleChange}>
                <Button>test</Button>
            </Popover>
        </div>
    );
}
