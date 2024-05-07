import styled, { css } from 'styled-components'

export const Overlay = styled.div<{ $visible?: boolean; }>`
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    flex-direction: column;

    background-color: rgba(0, 0, 0, 0);
    color: white;
    opacity: 0;
    transition: all ease-in-out .4s;

${props =>
  props.$visible &&
  css`
    opacity: 1;
    background-color: rgba(0, 0, 0, 0.6);
  `};
`;
