import React, { useState, useContext } from "react";

const PackageContext = React.createContext();

export default function PackageContextProvider({ currentVersion, dependencies, children }) {
    const [state, setState] = useState({
        currentVersion: currentVersion,
        dependencies: dependencies,
    });

    return <PackageContext.Provider value={state}>{children}</PackageContext.Provider>;
}

/**
 *
 * @returns {{currentVersion: Object, dependencies: Array}}
 */
export const usePackage = () => useContext(PackageContext);
