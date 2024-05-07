import styled, { css } from 'styled-components'
import { headerHeight } from '@utils/styleVariables';

export const Titlebar = styled.div<{ $focused?: boolean; }>`
    display: flex;
    flex-shrink: 0;
    flex-direction: row;
    align-items: center;
    height: ${headerHeight}px;
    line-height: ${headerHeight}px;
    padding: 0 12px;
    margin: -1px -1px 0 -1px;
    background-color: var(--titlebar-background);
    color: var(--titlebar-color);
    border-bottom: 1px solid #333;
    box-shadow: 0 0 1em rgba(0, 0, 0, 0.7);
    font-weight: bold;
    font-size: 14px;
    -webkit-user-select: none;
    transition: opacity ease-in-out 0.3s;

    ${props =>
      !props.$focused &&
      css`
        -background: #555;
        -color: white;
        opacity: 0.5;
      `};
`;

export const Icon = styled.div`
    width: 22px;
    height: 22px;
    margin-right: 8px;
    background-size: contain;
    background-image: url(data:image/png;base64,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);
`;

export const Title = styled.div`
    flex-grow: 1;
    -webkit-app-region: drag;
`

export const Button = styled.div`
    width: 15px;
    height: 15px;
    padding: 2px 8px;
    color: rgba(255, 255, 255, 0.4);
    transition: all ease-in-out 0.2s;

    &:hover {
        color: rgba(255, 255, 255, 0.75);
    }

`

export const ButtonClose = styled(Button)`
    &:hover {
        color: rgba(255, 0, 0, 0.6);
    }
`;

export const ButtonMinimize = styled(Button)`
    margin-left: 15px;
`;

export const ButtonPinned = styled(Button)<{ $pinned?: boolean }>`
    transform: rotate(45deg);

    ${props => 
    props.$pinned &&
    css`
        color: rgba(255, 255, 255, 0.4);
        transform: rotate(0deg);

        &:hover {
            color: rgba(255, 255, 255, 0.8);
        }
    `};
`;

/*
        #app-button-options {
            &.opened {
                color: rgba(255, 255, 255, 0.4);
                transform: rotate(0deg);

                &:hover {
                    color: rgba(255, 255, 255, 0.8);
                }
            }
        }
    }
}*/