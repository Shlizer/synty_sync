import { ReactNode, createContext, useMemo, useState } from 'react';

import { createUseContext } from '../utils/createUseContext';

type FetchContextProps = {
    overlayVisible: boolean;
    showOverlay: () => void;
    hideOverlay: () => void;
    getCollection: () => void;
}

export const useFetchContextData = () => {
    const { list } = window.Api.fetch;
    const { collection, packages } = window.Api.generate;
    const [overlayVisible, setOverlayVisible] = useState(false);

    const showOverlay = () => {
        setOverlayVisible(true);
    }

    const hideOverlay = () => {
        setOverlayVisible(false);
        //viewsClose();
    }

    const getCollection = () => {
        showOverlay();
        collection();
    }

    const syntyLogin = () => {
        showOverlay();
        //showSyntyLogin();
    }

    return useMemo(
        () => ({
            overlayVisible,
            showOverlay,
            hideOverlay,
            getCollection,
            syntyLogin,
        }),
        [overlayVisible],
    );
};

interface ProviderType {
    children: ReactNode;
}

export const FetchContextProvider = ({ children }: ProviderType) => {
    return (
        <FetchContext.Provider value={useFetchContextData()}>
            {children}
        </FetchContext.Provider>
    );
};

export const FetchContext = createContext<FetchContextProps | null>(null);
export const FetchContextConsumer = FetchContext.Consumer
export const useFetchState = createUseContext<FetchContextProps>(FetchContext);
