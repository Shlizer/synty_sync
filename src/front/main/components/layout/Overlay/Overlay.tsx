// import { Message } from '../Message';
// import { FetchCollections } from '../FetchCollections';
import * as Styles from './Overlay.styles';
import { useFetchContextData } from '@context/fetchContext';

export const Overlay = () => {
  const { overlayVisible } = useFetchContextData();
  const { on } = window.Api;
  
  return (
    <Styles.Overlay $visible={false} id="overlay">
      {/* <Message />
      <FetchCollections /> */}
    </Styles.Overlay>
  );
}
