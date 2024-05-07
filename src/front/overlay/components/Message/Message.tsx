import React, { useEffect, useState } from 'react';
import * as Styles from './Message.styles';

export const Message = () => {
  const [message, setMessage] = useState("");
  const { on } = window.Api;
  
  useEffect(() => {
    on('message', (message: string) => setMessage(message));
  }, [])

  return (
    <Styles.Message>
      {message}
    </Styles.Message>
  );
}
