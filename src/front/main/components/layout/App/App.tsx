import { FetchContextProvider } from '@context/fetchContext';
import { WindowContextProvider } from '@context/windowContext';
import { Footer } from '@layout/Footer';
import { Titlebar } from '@layout/Titlebar';
import { Container } from '@content/Container';

import { Overlay } from '@layout/Overlay';
import * as Style from "./App.styles";
import './variables.css';

export const App = () => (
  <Style.App>
    <Style.GlobalStyle />
    <WindowContextProvider>
      <FetchContextProvider>
        <Titlebar />
        {/* <Filters /> */}
        <Container />
        <Footer />
        <Overlay />
      </FetchContextProvider>
    </WindowContextProvider>
  </Style.App>
);
