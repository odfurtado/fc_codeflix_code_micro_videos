// @flow
import { IconButton, Menu as MuiMenu, MenuItem } from '@material-ui/core';

import MenuIcon from '@material-ui/icons/Menu';
import * as React from 'react';
import { Link } from 'react-router-dom';
import routes from '../../routes';

const listRoutes = ['dashboard', 'categories.list'];
const menuRoutes = routes.filter((route) => listRoutes.includes(route.name));

export const Menu = () => {
	const [anchorEl, setAnchorEl] = React.useState(null);

	const handleOpen = (event: any) => setAnchorEl(event.currentTarget);
	const handleClose = (event: any) => setAnchorEl(null);
	return (
		<React.Fragment>
			<IconButton
				edge="start"
				color="inherit"
				aria-label="open drawer"
				aria-controls="menu-appbar"
				aria-haspopup="true"
				onClick={handleOpen}
			>
				<MenuIcon />
			</IconButton>

			<MuiMenu
				id="menu-appbar"
				open={Boolean(anchorEl)}
				anchorEl={anchorEl}
				onClose={handleClose}
				anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
				transformOrigin={{ vertical: 'top', horizontal: 'center' }}
				getContentAnchorEl={null}
			>
				{listRoutes.map((routeName) => {
					const route = menuRoutes.find(
						(route) => route.name === routeName
					);

					if (!route) {
						return <React.Fragment></React.Fragment>;
					}

					return (
						<MenuItem
							key={routeName}
							component={Link}
							to={route.path as string}
							onClick={handleClose}
						>
							{route.label}
						</MenuItem>
					);
				})}
			</MuiMenu>
		</React.Fragment>
	);
};
