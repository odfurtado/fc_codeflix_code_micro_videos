// @flow
import {
	Box,
	Button,
	ButtonProps,
	Checkbox,
	makeStyles,
	TextField,
	Theme,
} from '@material-ui/core';
import { useForm } from 'react-hook-form';

import * as React from 'react';
import categoryHttp from '../../util/http/category-http';

const useStyle = makeStyles((theme: Theme) => ({
	submit: {
		margin: theme.spacing(1),
	},
}));

export const Form = () => {
	const classes = useStyle();

	const buttonProps: ButtonProps = {
		variant: 'contained',
		size: 'small',
		className: classes.submit,
		color: 'secondary',
	};

	const { register, handleSubmit, getValues } = useForm<{ name; is_active }>({
		defaultValues: {
			is_active: true,
		},
	});

	const onSubmit = (formData, event) => {
		categoryHttp.create(formData).then((response) => console.log(response));
	};

	return (
		<form onSubmit={handleSubmit(onSubmit)}>
			<TextField
				name="name"
				label="Nome"
				fullWidth
				variant="outlined"
				margin="dense"
				inputRef={register}
			/>
			<TextField
				name="description"
				label="Descrição"
				multiline
				minRows={4}
				maxRows={4}
				fullWidth
				variant="outlined"
				margin="dense"
				inputRef={register}
			/>
			<Checkbox
				color="primary"
				name="is_active"
				inputRef={register}
				defaultChecked
			/>{' '}
			Ativo?
			<Box dir="rtl">
				<Button
					color="primary"
					{...buttonProps}
					onClick={() => onSubmit(getValues(), null)}
				>
					Salvar
				</Button>
				<Button {...buttonProps} type="submit">
					Salvar e continuar editando
				</Button>
			</Box>
		</form>
	);
};
