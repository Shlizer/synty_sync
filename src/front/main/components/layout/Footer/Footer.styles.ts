import styled, { css } from 'styled-components'

export const Footer = styled.div`
    position: relative;
    overflow: hidden;
    display: flex;
    flex-shrink: 0;
    flex-direction: row;
    align-items: center;
    height: 30px;
    line-height: 30px;
    padding: 0 12px;
    margin: -1px -1px 0 -1px;
    background-color: var(--titlebar-background);
    color: var(--titlebar-color);
    border-top: 1px solid #333;
    box-shadow: 0 0 -1em rgba(0, 0, 0, 0.7);
    font-weight: bold;
    font-size: 14px;
`;

export const OverlayBack = styled.div<{ $visible?: boolean; }>`
    position: absolute;
    top: 0;
    left: -124px;
    width: 100px;
    height: 30px;
    line-height: 30px;
    padding: 0 12px;
    margin: -1px -1px 0 -1px;
    background-color: black;
    color: var(--titlebar-color);
    transition: left ease-in-out .4s;

    ${props =>
      props.$visible &&
      css`
        left: 0;
      `};
`;

export const Button = styled.div`
    width: 12px;
    height: 12px;
    padding: 2px 8px;
    color: rgba(255, 255, 255, 0.4);
    transition: all ease-in-out 0.2s;

    &:hover {
        color: rgba(255, 255, 255, 0.75);
    }
`

export const Overlay = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    background-color: rgba(0, 0, 0, 0.4);
`