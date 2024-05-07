import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faThumbtack } from "@fortawesome/free-solid-svg-icons";

import { useWindowContextData } from "@context/windowContext";
import * as Style from "../Titlebar.styles";

export const ButtonPin = () => {
  const { pin } = window.Api.window;
  const { isPinned } = useWindowContextData();
  
  return (
    <Style.ButtonPinned
        as={FontAwesomeIcon}
        icon={faThumbtack}
        onClick={pin}
        $pinned={isPinned}
    />
  );
}
