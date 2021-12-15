// @flow
import {
	Box,
	Button,
	ButtonProps,
	FormControl,
	FormControlLabel,
	FormLabel,
	makeStyles,
	Radio,
	RadioGroup,
	TextField,
	Theme,
} from '@material-ui/core';
import * as React from 'react';
import { useForm } from 'react-hook-form';
import memberHttp from '../../util/http/member-http';

const useStyle = makeStyles((theme: Theme) => ({
	submit: {
		margin: theme.spacing(1),
	},
	formElement: {
		margin: theme.spacing(1),
	},
}));

export const Form = () => {
	const classes = useStyle();

	const buttonProps: ButtonProps = {
		variant: 'outlined',
		size: 'small',
		className: classes.submit,
	};

	const { register, handleSubmit, getValues, setValue } = useForm<{
		name;
		type;
	}>({
		defaultValues: {},
	});

	React.useEffect(() => {
		register({ name: 'type' });
	}, [register]);

	const onSubmit = (formData, event) => {
		memberHttp.create(formData).then((data) => console.log(data.data));
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
				className={classes.formElement}
			/>
			<FormControl margin="dense" className={classes.formElement}>
				<FormLabel component="legend">Tipo</FormLabel>
				<RadioGroup
					name="type"
					onChange={(e) => {
						setValue('type', parseInt(e.target.value));
					}}
				>
					<FormControlLabel
						value="1"
						control={<Radio />}
						label="Diretor"
					/>
					<FormControlLabel value="2" control={<Radio />} label="Ator" />
				</RadioGroup>
			</FormControl>
			<Box dir="rtl">
				<Button
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
