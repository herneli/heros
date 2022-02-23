import React from "react";
import { usePackage } from "../packages/PackageContext";
import SelectRemoteWidget from "./SelectRemoteWidget";

export default function SelectRemoteWithPackageWidget(props) {
    let packageData = usePackage();
    let newOptions = props.options || {};
    newOptions.filters = {
        package_version_id__in: packageData.dependencies.join(","),
    };
    let filterProps = { ...props, options: newOptions };
    return <SelectRemoteWidget {...filterProps} />;
}
