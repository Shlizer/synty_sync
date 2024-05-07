import { useEffect, useState } from 'react';
import * as Styles from './FetchCollections.styles';

type status = {
  count?: number;
  current?: number;
  name?: string;
}
export type fetchStatus = {
  collection: status;
  page: status;
  pack: status;
}

export const FetchCollections = () => {
  const [status, setStatus] = useState<fetchStatus>();
  const { on } = window.Api;
  
  useEffect(() => {
    /*
    setStatus({
      collectionCount: 12,
      collectionCurrent: 3,
      collectionName: "POLYGON",
      pageCount: 0,
      pageCurrent: 0,
      pageName: "",
      packCount: 0,
      packCurrent: 0,
      packName: "",
    })*/
    on('fetchStatus', (status: fetchStatus) => setStatus(status));
  }, [])

  if (!status?.collection?.count) return null;

  return (
    <Styles.Fetch>
      <Styles.Title>Fetching</Styles.Title>
      <Bar status={status?.collection} />
      <Bar status={status?.page} />
      <Bar status={status?.pack} />
    </Styles.Fetch>
  );
}

const Bar = ({status} : { status?: status}) => {
  if (!status?.count || !status?.current) return null;

  return (
    <Styles.ProgressWrapper>
      <Styles.ProgressHeader>
        <Styles.ProgressTitle>{status?.name}</Styles.ProgressTitle>
        <Styles.ProgressStatus>[{status?.current} / {status?.count}]</Styles.ProgressStatus>
      </Styles.ProgressHeader>
    <Styles.Progress variant="determinate" value={status?.current / status?.count * 100} />
    </Styles.ProgressWrapper>
  )
};