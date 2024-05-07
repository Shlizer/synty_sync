import { LinearProgress, linearProgressClasses } from '@mui/material';
import styled, { css } from 'styled-components'

export const Fetch = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translateX(-50%) translateY(-50%);
  display: flex;
  flex-direction: column;
  gap: 1em;
  background-color: var(--content-background);
  color: var(--content-color);
  box-shadow: 0 0 1em rgba(0, 0, 0, 0.8);
  padding: 10px;
`;

export const Title = styled.div`
  margin-bottom: 1em;
`;

export const ProgressWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5em;
`;

export const ProgressHeader = styled.div`
  display: flex;
  flex-direction: row;
`;

export const ProgressTitle = styled.div`
  flex-grow: 1;
`;

export const ProgressStatus = styled.div`
`;

export const Progress = styled(LinearProgress)(() => ({
  width: 350,
  height: 40,
  borderRadius: 5,
  [`&.${linearProgressClasses.colorPrimary}`]: {
    backgroundColor: "#424242",
  },
  [`& .${linearProgressClasses.bar}`]: {
    borderRadius: 5,
    backgroundColor: '#308fe8',
  },
}));
