// @flow
import * as React from 'react';
import { Box, Button, ButtonProps, makeStyles, Theme } from '@material-ui/core';

type SubmitActionProps = {
	disabled: boolean;
	handleSave: () => void;
};

const useStyle = makeStyles((theme: Theme) => ({
	submit: {
		margin: theme.spacing(1),
	},
}));

const SubmitActions = (props: SubmitActionProps) => {
	const classes = useStyle();

	const buttonProps: ButtonProps = {
		variant: 'contained',
		size: 'small',
		className: classes.submit,
		color: 'secondary',
		disabled: props.disabled,
	};

	return (
		<Box dir="rtl">
			<Button color="primary" {...buttonProps} onClick={props.handleSave}>
				Salvar
			</Button>
			<Button {...buttonProps} type="submit">
				Salvar e continuar editando
			</Button>
		</Box>
	);
};

export default SubmitActions;
