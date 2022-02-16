// @flow
import * as React from 'react';
import { IconButton, makeStyles, Tooltip } from '@material-ui/core';
import ClearAllIcon from '@material-ui/icons/ClearAll';

interface FilterResetButtonProps {
	handleClick: () => void;
}

const useStyles = makeStyles((theme) => ({
	iconButton: (theme.overrides as any).MUIDataTableToolbar.icon,
}));

export const FilterResetButton = (props: FilterResetButtonProps) => {
	const classes = useStyles();

	return (
		<Tooltip title="Limpar busca">
			<IconButton className={classes.iconButton} onClick={props.handleClick}>
				<ClearAllIcon />
			</IconButton>
		</Tooltip>
	);
};
