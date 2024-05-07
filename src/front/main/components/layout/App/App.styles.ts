import styled, { createGlobalStyle } from 'styled-components'

export const GlobalStyle = createGlobalStyle`
    body {
        font-family: 'Lato', 'Open Sans', sans-serif;
        font-size: 12px;
        cursor: default;
        user-select: none;
    }

    body #root {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
    }
`

export const App = styled.div`
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    flex-direction: column;
    border: 1px solid #3f3f3f;
    background-color: var(--app-background);
    color: var(--app-color);
`;
