import { SnackbarProviderProps } from 'notistack';
import * as React from 'react';
import { SnackbarProvider as NotistackProvider } from 'notistack';
import { IconButton, makeStyles, Theme } from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';

const useStyle = makeStyles((theme: Theme) => ({
	variantSuccess: {
		backgroundColor: theme.palette.success.main,
	},
	variantError: {
		backgroundColor: theme.palette.error.main,
	},
	variantInfo: {
		backgroundColor: theme.palette.primary.main,
	},
}));

export const SnackbarProvider: React.FC<SnackbarProviderProps> = (props) => {
	let snackbarProvideRef;
	const classes = useStyle();
	const defaultProps: SnackbarProviderProps = {
		classes,
		autoHideDuration: 3000,
		maxSnack: 3,
		anchorOrigin: {
			horizontal: 'right',
			vertical: 'top',
		},
		ref: (el) => (snackbarProvideRef = el),
		action: (key) => (
			<IconButton
				color="inherit"
				style={{ fontSize: 20 }}
				onClick={() => snackbarProvideRef.closeSnackbar(key)}
			>
				<CloseIcon />
			</IconButton>
		),
	};

	const newProps = { ...defaultProps, ...props };

	return <NotistackProvider {...newProps}>{props.children}</NotistackProvider>;
};
