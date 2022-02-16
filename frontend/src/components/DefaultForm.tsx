// @flow
import { Grid, GridProps, makeStyles } from '@material-ui/core';
import * as React from 'react';

interface DefaultFormProps
	extends React.DetailedHTMLProps<
		React.FormHTMLAttributes<HTMLFormElement>,
		HTMLFormElement
	> {
	GridContainerProps?: GridProps;
	GridItemProps?: GridProps;
}

const useStyle = makeStyles((theme) => ({
	gridItem: {
		padding: theme.spacing(1, 0),
	},
}));

export const DefaultForm: React.FC<DefaultFormProps> = (props) => {
	const classes = useStyle();
	const { GridContainerProps, GridItemProps, ...FormProps } = props;
	return (
		<form {...FormProps}>
			<Grid container {...GridContainerProps}>
				<Grid item {...GridItemProps} className={classes.gridItem}>
					{props.children}
				</Grid>
			</Grid>
		</form>
	);
};
