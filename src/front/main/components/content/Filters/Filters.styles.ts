import styled, { css } from 'styled-components'

export const Filters = styled.div`
    margin: 1em;
    padding: 1em;
    display: flex;
    flex-shrink: 0;
    flex-direction: row;
    gap: 1em;
    background-color: var(--content-background);
    color: var(--content-color);
    box-shadow: 0 0 1em rgba(0, 0, 0, 0.8);
`;

export const FilterWrap = styled.div`
    height: 30px;
    line-height: 30px;
    display: flex;
    flex-direction: row;
    gap: 1em;
    margin: 2px;
    --background-color: var(--titlebar-background);
    color: var(--titlebar-color);
`;

export const FilterLabel = styled.span`
    color: var(--titlebar-color);
`;

export const FilterName = styled.input`
    border: 1px solid gray;
    padding: 2px;
    background-color: var(--titlebar-background);
    color: var(--titlebar-color);
`;
