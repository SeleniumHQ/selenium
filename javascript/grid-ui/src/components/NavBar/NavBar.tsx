import Divider from '@material-ui/core/Divider';
import Drawer from '@material-ui/core/Drawer';
import IconButton from '@material-ui/core/IconButton';
import List from '@material-ui/core/List';
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import {makeStyles} from '@material-ui/core/styles';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import DashboardIcon from "@material-ui/icons/Dashboard";
import clsx from 'clsx';
import * as React from 'react';

const drawerWidth = 240;

const useStyles = makeStyles((theme) => ({
	root: {
		display: 'flex',
	},
	toolbarIcon: {
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'flex-end',
		padding: '0 8px',
		...theme.mixins.toolbar,
		backgroundColor: theme.palette.primary.main,
	},
	drawerPaper: {
		position: 'relative',
		whiteSpace: 'nowrap',
		width: drawerWidth,
		minHeight: '100vh',
		transition: theme.transitions.create('width', {
			easing: theme.transitions.easing.sharp,
			duration: theme.transitions.duration.enteringScreen,
		}),
	},
	drawerPaperClose: {
		overflowX: 'hidden',
		minHeight: '100vh',
		transition: theme.transitions.create('width', {
			easing: theme.transitions.easing.sharp,
			duration: theme.transitions.duration.leavingScreen,
		}),
		width: theme.spacing(7),
		[theme.breakpoints.up('sm')]: {
			width: theme.spacing(9),
		},
	},
}));

function ListItemLink(props) {
	return <ListItem button component="a" {...props} />;
}

export default function NavBar(props) {
	const classes = useStyles();
	const open = props.open;

	return (
		<Drawer
			variant="permanent"
			classes={{
				paper: clsx(classes.drawerPaper, !open && classes.drawerPaperClose),
			}}
			open={open}
		>
			<div className={classes.toolbarIcon}>
				<IconButton color={"secondary"}>
					<ChevronLeftIcon/>
				</IconButton>
			</div>
			<Divider/>
			<List>
				<div>
					<ListItemLink href={"#"}>
						<ListItemIcon>
							<DashboardIcon/>
						</ListItemIcon>
						<ListItemText primary="Overview"/>
					</ListItemLink>
				</div>
			</List>
			{/*<Divider/>*/}
			{/*<List>{secondaryListItems}</List>*/}
		</Drawer>
	);
}

