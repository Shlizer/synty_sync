import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faWindowClose } from "@fortawesome/free-solid-svg-icons";
import * as Style from "../Titlebar.styles";

export const ButtonClose = () => {
  const { close } = window.Api.window;
  
  return (
    <Style.ButtonClose
      as={FontAwesomeIcon}
      icon={faWindowClose}
      onClick={close}
    />
  );
}
