import { TextField } from "@mui/material";
import * as Style from "./Filters.styles";

export const Filters = () => {
    
    return (
        <Style.Filters id="app-filters">
            <TextField id="outlined-basic" size="small" label="Name" variant="outlined" />
        </Style.Filters>
    )
}