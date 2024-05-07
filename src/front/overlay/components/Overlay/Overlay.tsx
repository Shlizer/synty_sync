import { useEffect, useState } from 'react';
import { Message } from '../Message';
import { FetchCollections } from '../FetchCollections';
import * as Styles from './Overlay.styles';
import './variables.css';
import './Overlay.css';

export const Overlay = () => {
  const [isVisible, setVisible] = useState(false);
  const { on } = window.Api;
  
  useEffect(() => {
    //viewsOpen();
    on('show', () => setVisible(true));
    on('hide', () => setVisible(false));
  }, [])

  return (
    <Styles.Overlay $visible={isVisible} id="app">
      <Message />
      <FetchCollections />
    </Styles.Overlay>
  );
}
