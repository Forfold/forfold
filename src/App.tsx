import * as React from "react";
import { styled } from "@mui/material/styles";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Paper from "@mui/material/Paper";
import Fab from "@mui/material/Fab";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import ListItemText from "@mui/material/ListItemText";
import ListSubheader from "@mui/material/ListSubheader";
import Avatar from "@mui/material/Avatar";
import MenuIcon from "@mui/icons-material/Menu";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import MoreIcon from "@mui/icons-material/MoreVert";

const darkTheme = createTheme({
  palette: {
    mode: "dark",
  },
});

export default function BottomAppBar() {
  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      Test
      <AppBar position="fixed" color="primary">
        <Toolbar>
          <IconButton color="inherit" aria-label="open drawer">
            <MenuIcon />
          </IconButton>
          <Box sx={{ flexGrow: 1 }} />
          <IconButton color="inherit">
            <SearchIcon />
          </IconButton>
          <IconButton color="inherit">
            <MoreIcon />
          </IconButton>
        </Toolbar>
      </AppBar>
    </ThemeProvider>
  );
}
