import {
	Box,
	Button,
	ButtonProps,
	Checkbox,
	makeStyles,
	MenuItem,
	TextField,
	Theme,
} from '@material-ui/core';
import * as React from 'react';
import { useForm } from 'react-hook-form';
import categoryHttp from '../../util/http/category-http';
import genreHttp from '../../util/http/genre-http';

//Nome
//Categoria
//Ativo

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
		variant: 'contained',
		size: 'small',
		className: classes.submit,
		color: 'secondary',
	};

	const [categories, setCategories] = React.useState<any[]>([]);
	const { register, handleSubmit, getValues, setValue, watch } = useForm<{
		name;
		categories_id;
		is_active;
	}>({
		defaultValues: {
			categories_id: [],
			is_active: true,
		},
	});

	React.useEffect(() => {
		register({ name: 'categories_id' });
	}, [register]);

	React.useEffect(() => {
		categoryHttp.list().then(({ data }) => setCategories(data.data));
	}, []);

	const onSubmit = (formData, event) => {
		genreHttp.create(formData).then((response) => console.log(response));
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
			<TextField
				select
				name="categories_id"
				label="Categorias"
				fullWidth
				variant="outlined"
				margin="dense"
				value={watch('categories_id')}
				onChange={(e) => {
					setValue('categories_id', e.target.value);
				}}
				SelectProps={{ multiple: true }}
				className={classes.formElement}
			>
				<MenuItem value="" disabled>
					<em>Selecione</em>
				</MenuItem>
				{categories.map((category, key) => (
					<MenuItem key={key} value={category.id}>
						{category.name}
					</MenuItem>
				))}
			</TextField>
			<Checkbox name="is_active" inputRef={register} defaultChecked /> Ativo?
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
