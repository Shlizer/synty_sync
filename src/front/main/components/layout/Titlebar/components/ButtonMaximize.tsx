import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faWindowMaximize, faWindowRestore } from "@fortawesome/free-regular-svg-icons";
import * as Style from "../Titlebar.styles";
import { useEffect, useState } from "react";

export const ButtonMaximize = () => {
  const { maximize } = window.Api.window;
  const { onMaximize } = window.Api;

  const [maximized, setMaximized] = useState(false);

  useEffect(() => {
      onMaximize(setMaximized);
  }, []);

  return (
    <Style.Button
      as={FontAwesomeIcon}
      icon={maximized ? faWindowRestore : faWindowMaximize}
      onClick={maximize}
    />
  );
}