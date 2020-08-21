import AppBar from "@material-ui/core/AppBar";
import green from "@material-ui/core/colors/green";
import purple from "@material-ui/core/colors/purple";
import IconButton from "@material-ui/core/IconButton";
import InputBase from "@material-ui/core/InputBase";
import {
	createMuiTheme,
	createStyles,
	fade,
	makeStyles,
	ThemeProvider,
} from "@material-ui/core/styles";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import MenuIcon from "@material-ui/icons/Menu";
import SearchIcon from "@material-ui/icons/Search";
import React from "react";

const theme = createMuiTheme({
	palette: {
		primary: {
			main: purple[500],
		},
		secondary: {
			main: green[500],
		},
	},
});

const useStyles = makeStyles(() =>
	createStyles({
		root: {
			flexGrow: 1,
		},
		menuButton: {
			marginRight: theme.spacing(2),
		},
		title: {
			flexGrow: 1,
			display: "none",
			[theme.breakpoints.up("sm")]: {
				display: "block",
			},
		},
		search: {
			position: "relative",
			borderRadius: theme.shape.borderRadius,
			backgroundColor: fade(theme.palette.common.white, 0.15),
			"&:hover": {
				backgroundColor: fade(theme.palette.common.white, 0.25),
			},
			marginLeft: 0,
			width: "100%",
			[theme.breakpoints.up("sm")]: {
				marginLeft: theme.spacing(1),
				width: "auto",
			},
		},
		searchIcon: {
			padding: theme.spacing(0, 2),
			height: "100%",
			position: "absolute",
			pointerEvents: "none",
			display: "flex",
			alignItems: "center",
			justifyContent: "center",
		},
		inputRoot: {
			color: "inherit",
		},
		inputInput: {
			padding: theme.spacing(1, 1, 1, 0),
			// vertical padding + font size from searchIcon
			paddingLeft: `calc(1em + ${theme.spacing(4)}px)`,
			transition: theme.transitions.create("width"),
			width: "100%",
			[theme.breakpoints.up("sm")]: {
				width: "12ch",
				"&:focus": {
					width: "20ch",
				},
			},
		},
	})
);

export default function SearchAppBar() {
	const classes = useStyles();

	return (
		<div className={classes.root}>
			<ThemeProvider theme={theme}>
				<AppBar position="static" color="secondary">
					<Toolbar>
						<IconButton
							edge="start"
							className={classes.menuButton}
							color="inherit"
							aria-label="open drawer"
						>
							<MenuIcon />
						</IconButton>
						<Typography className={classes.title} variant="h6" noWrap>
							Grid Console
						</Typography>
						<div className={classes.search}>
							<div className={classes.searchIcon}>
								<SearchIcon />
							</div>
							<InputBase
								placeholder="Search…"
								classes={{
									root: classes.inputRoot,
									input: classes.inputInput,
								}}
								inputProps={{ "aria-label": "search" }}
							/>
						</div>
					</Toolbar>
				</AppBar>
			</ThemeProvider>
		</div>
	);
}
