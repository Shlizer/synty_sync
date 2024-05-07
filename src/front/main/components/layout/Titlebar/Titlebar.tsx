import { useWindowContextData } from "@context/windowContext";
import { ButtonClose } from "./components/ButtonClose";
import { ButtonMaximize } from "./components/ButtonMaximize";
import { ButtonMinimize } from "./components/ButtonMinimize";
// import ButtonOptions from "./components/ButtonOptions";
import { ButtonPin } from "./components/ButtonPin";
import * as Style from "./Titlebar.styles";

export const Titlebar = () => {
    const { isFocused } = useWindowContextData();
    return (
        <Style.Titlebar id="app-titlebar" $focused={isFocused}>
            <div id="app-icon" />
            <Style.Title>Synty Sync</Style.Title>
            {/* <ButtonOptions /> */}
            <ButtonPin />
            <ButtonMinimize />
            <ButtonMaximize />
            <ButtonClose />
        </Style.Titlebar>
    );
}