import {
	Drawer,
	Icon,
	IconButton,
	List,
	ListItem,
	ListItemText,
	makeStyles,
} from '@material-ui/core';
import clsx from 'clsx';
import MenuIcon from '@material-ui/icons/Menu';
import * as React from 'react';
import routes from '../../routes';
import { useHistory } from 'react-router';

const listRoutes = [
	'dashboard',
	'categories.list',
	'genres.list',
	'members.list',
];
const menuRoutes = routes.filter((route) => listRoutes.includes(route.name));
const boxShadowColor = '#bdbdbd';

const hexToRgb = (input: string) => {
	input = input + '';
	input = input.replace('#', '');
	let hexRegex = /[0-9A-Fa-f]/g;
	if (!hexRegex.test(input) || (input.length !== 3 && input.length !== 6)) {
		throw new Error('input is not a valid hex color.');
	}
	if (input.length === 3) {
		let first = input[0];
		let second = input[1];
		let last = input[2];
		input = first + first + second + second + last + last;
	}
	input = input.toUpperCase();
	let first = input[0] + input[1];
	let second = input[2] + input[3];
	let last = input[4] + input[5];
	return (
		parseInt(first, 16) +
		', ' +
		parseInt(second, 16) +
		', ' +
		parseInt(last, 16)
	);
};

const useStyles = makeStyles({
	drawerPaper: {
		width: 250,
		background: '#212121',
		boxShadow:
			'0px 8px 10px -5px rgba(0,0,0,0.2),0px 16px 24px 2px rgba(0,0,0,0.14),0px 6px 30px 5px rgba(0,0,0,0.12);',
	},
	list: {
		marginTop: '20px',
		paddingLeft: '0',
		paddingTop: '0',
		paddingBottom: '0',
		marginBottom: '0',
		listStyle: 'none',
		position: 'unset',
	},

	itemLink: {
		width: 'auto',
		transition: 'all 300ms linear',
		margin: '10px 15px 0',
		borderRadius: '3px',
		position: 'relative',
		display: 'block',
		padding: '10px 15px',
		backgroundColor: 'transparent',
	},
	itemLinkActive: {
		backgroundColor: boxShadowColor,
		boxShadow:
			'0 12px 20px -10px rgba(' +
			hexToRgb(boxShadowColor) +
			',.28), 0 4px 20px 0 rgba(' +
			hexToRgb(boxShadowColor) +
			',.12), 0 7px 8px -5px rgba(' +
			hexToRgb(boxShadowColor) +
			',.2)',
		'&:hover,&:focus': {
			backgroundColor: boxShadowColor,
			boxShadow:
				'0 12px 20px -10px rgba(' +
				hexToRgb(boxShadowColor) +
				',.28), 0 4px 20px 0 rgba(' +
				hexToRgb(boxShadowColor) +
				',.12), 0 7px 8px -5px rgba(' +
				hexToRgb(boxShadowColor) +
				',.2)',
		},
	},
	itemIcon: {
		width: '24px',
		height: '30px',
		fontSize: '24px',
		lineHeight: '30px',
		float: 'left',
		marginRight: '15px',
		textAlign: 'center',
		verticalAlign: 'middle',
		color: 'rgba(' + hexToRgb('#ffffff') + ', 0.8)',
	},
	itemIconActive: {
		color: 'rgba(' + hexToRgb('#000000') + ', 0.8)',
	},
	itemText: {
		margin: '0',
		lineHeight: '30px',
		color: 'rgba(' + hexToRgb('#ffffff') + ', 0.8)',
	},
	itemTextActive: {
		color: 'rgba(' + hexToRgb('#000000') + ', 0.8)',
	},
});

export const Menu = () => {
	const classes = useStyles();
	const history = useHistory();
	const [drawerOpen, setDrawerOpen] = React.useState(false);
	const [currentPage, setCurrentPage] = React.useState('/');

	React.useEffect(() => {
		setCurrentPage(history.location.pathname);
	}, [history.location.pathname]);

	const setPath = (path: string) => {
		setCurrentPage(path);
		history.push(path);
	};

	return (
		<React.Fragment>
			<IconButton
				edge="start"
				color="inherit"
				aria-label="open drawer"
				aria-controls="menu-appbar"
				aria-haspopup="true"
				onClick={() => setDrawerOpen(true)}
			>
				<MenuIcon />
			</IconButton>

			<Drawer
				anchor="left"
				open={drawerOpen}
				onClose={() => setDrawerOpen(false)}
				classes={{ paper: classes.drawerPaper }}
			>
				<List>
					{listRoutes.map((routeName) => {
						const route = menuRoutes.find(
							(route) => route.name === routeName
						);

						if (!route) {
							return <React.Fragment></React.Fragment>;
						}

						return (
							<ListItem
								button
								key={routeName}
								onClick={() => {
									setDrawerOpen(false);
									setPath(route.path as string);
								}}
								className={clsx(classes.itemLink, {
									[classes.itemLinkActive]: currentPage === route.path,
								})}
							>
								<Icon
									color="inherit"
									className={clsx(classes.itemIcon, {
										[classes.itemIconActive]:
											currentPage === route.path,
									})}
								>
									{route.icon}
								</Icon>
								<ListItemText
									className={clsx(classes.itemText, {
										[classes.itemTextActive]:
											currentPage === route.path,
									})}
									disableTypography={true}
								>
									{route.label}
								</ListItemText>
							</ListItem>
						);
					})}
				</List>
			</Drawer>
		</React.Fragment>
	);
};
