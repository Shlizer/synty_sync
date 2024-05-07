import { ReactNode, createContext, useEffect, useMemo, useState } from 'react';

import { createUseContext } from '../utils/createUseContext';

type WindowContextProps = {
    isFocused: boolean;
    isPinned: boolean;
}

export const useWindowContextData = () => {
    const { isPinned: isPinnedRaw } = window.Api.window;
    const [isFocused, setFocused] = useState(true);
    const [isPinned, setPinned] = useState(isPinnedRaw);

    const { onFocus, onBlur, onPin } = window.Api;

    useEffect(() => {
        onFocus(() => setFocused(true));
        onBlur(() => setFocused(false));
        onPin((pinned: boolean) => setPinned(pinned));
    }, []);

    return useMemo(
        () => ({
            isFocused,
            isPinned,
        }),
        [
            isFocused,
            isPinned,
        ],
    );
};

interface ProviderType {
    children: ReactNode;
}

export const WindowContextProvider = ({ children }: ProviderType) => {
    return (
        <WindowContext.Provider value={useWindowContextData()}>
            {children}
        </WindowContext.Provider>
    );
};

export const WindowContext = createContext<WindowContextProps | null>(null);
export const WindowContextConsumer = WindowContext.Consumer
export const useWindowState = createUseContext<WindowContextProps>(WindowContext);
