import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTableList, faUser } from "@fortawesome/free-solid-svg-icons";
import * as Style from "./Footer.styles";
import { useFetchContextData } from "@context/fetchContext";
import { Tooltip } from "@mui/material";

export const Footer = () => {
    const { getCollection, hideOverlay, overlayVisible } = useFetchContextData();
    return (
        <Style.Footer id="app-footer">
            <Style.OverlayBack $visible={overlayVisible} onClick={hideOverlay}>&lt; Back</Style.OverlayBack>
            <Tooltip title="Fetch collection list">
                <Style.Button
                    as={FontAwesomeIcon}
                    icon={faTableList}
                    onClick={getCollection}
                />
            </Tooltip>
            <Tooltip title="Login and get downloadable data">
                <Style.Button
                    as={FontAwesomeIcon}
                    icon={faUser}
                    //onClick={syntyLogin}
                />
            </Tooltip>
        </Style.Footer>
    )
}
