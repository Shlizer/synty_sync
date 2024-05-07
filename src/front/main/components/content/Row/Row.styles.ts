import styled, { css } from 'styled-components'

const sizes = {
    scrollWidth: 14,
    scrollHeight: 14,
    listViewHeight: 80,
    gridViewHeight: 160,
}

const getCellPosition = (_index: number, _width: number, _list: boolean) => {
    if (_list) {
        return {
            height: sizes.listViewHeight,
            width: _width - sizes.scrollWidth,
            top: _index * sizes.listViewHeight,
            left: 0,
        }
    }

    const colCount = Math.floor(_width / sizes.gridViewHeight);
    const col = Math.floor(_index % colCount);
    const row = Math.floor(_index / colCount);

    const left = col * sizes.gridViewHeight
    const top = row * sizes.gridViewHeight

    return {
        height: sizes.gridViewHeight,
        width: sizes.gridViewHeight,
        top,
        left,
    }
}

export const Content = styled.div`
    position: relative;
    display: flex;
    flex-direction: column;
    color: var(--content-color);
    background-color: var(--content-background);
    box-shadow: var(--content-shadow);
    margin: 1em;
    flex-grow: 1;
    overflow: auto;

    &::-webkit-scrollbar {
        position: absolute;
        top: 0;
        right: 0;
        bottom: 0;
        width: ${sizes.scrollWidth}px;
        height: ${sizes.scrollHeight}px;
    }
    
    &::-webkit-scrollbar-thumb {
        background: #6c6c6c;
    }
    
    &::-webkit-scrollbar-track {
        background: #262626;
    }
`;

export const Scroll = styled.div<{ $count: number }>`
    ${props =>
      css`
        width: 100%;
        //height: $ {props.$count*blockSize}px;
      `};

`;

export const Pack = styled.div<{ $list: boolean; $index: number; $width: number; }>`
    position: absolute;
    display: flex;
    flex-direction: row;
    gap: 1em;
    --padding: 4px;
    --background-color: var(--titlebar-background);
    --color: var(--titlebar-color);
    overflow: hidden;

    transition: all ease-in-out 0.4s;

    &:nth-child(even) {
        background-color: rgba(0, 0, 0, 0.2);
    }

    &:hover img {
        opacity: 1;
    }

    ${({ $index, $list, $width}) => {
        const cellPosition = getCellPosition($index, $width, $list);
    
        return css`
            height: ${cellPosition.height}px;
            line-height: ${cellPosition.height}px;
            width: ${cellPosition.width}px;
            left: ${cellPosition.left}px;
            top: ${cellPosition.top}px;

            ${Icon} {
                height: ${cellPosition.height}px;
                width: ${cellPosition.height}px;
            }
        `
    }}
`;

export const Icon = styled.img`
    opacity: 0.6;
    transition: all ease-in-out 0.4s;
`;

export const Name = styled.span`
    flex-grow: 1;
`;

export const ViewFilter = styled.div`
    display: flex;
    flex-direction: row;
    margin: 2em;
    gap: 1em;

    & > * {
        opacity: 0.7;

        &:hover {
            opacity: 1;
            cursor: pointer;
        }
    }
`