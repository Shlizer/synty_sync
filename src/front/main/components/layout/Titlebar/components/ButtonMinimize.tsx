import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faWindowMinimize } from "@fortawesome/free-regular-svg-icons";
import * as Style from "../Titlebar.styles";

export const ButtonMinimize = () => {
  const { minimize } = window.Api.window;
  
  return (
    <Style.ButtonMinimize
      as={FontAwesomeIcon}
      icon={faWindowMinimize}
      onClick={minimize}
    />
  );
}
