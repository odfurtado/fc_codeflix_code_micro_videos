// @flow
import {
	Box,
	Button,
	ButtonProps,
	Checkbox,
	makeStyles,
	TextField,
	Theme,
	FormControlLabel,
} from '@material-ui/core';
import { useForm } from 'react-hook-form';

import * as React from 'react';
import categoryHttp from '../../util/http/category-http';
import * as yup from '../../util/vendor/yup';
import { useHistory, useParams } from 'react-router-dom';
import { useSnackbar } from 'notistack';

const useStyle = makeStyles((theme: Theme) => ({
	submit: {
		margin: theme.spacing(1),
	},
}));

const validationSchema = yup.object().shape({
	name: yup.string().label('Nome').required().max(255),
});

export const Form = () => {
	const classes = useStyle();

	const { register, handleSubmit, getValues, setValue, errors, reset, watch } =
		useForm<{
			name;
			is_active;
		}>({
			validationSchema,
			defaultValues: {
				is_active: true,
			},
		});

	const snackbar = useSnackbar();
	const history = useHistory();
	const { id } = useParams<{ id: string }>();
	const [category, setCategory] = React.useState<{ id: string } | null>(null);
	const [loading, setLoading] = React.useState(false);

	const buttonProps: ButtonProps = {
		variant: 'contained',
		size: 'small',
		className: classes.submit,
		color: 'secondary',
		disabled: loading,
	};

	React.useEffect(() => {
		if (!id) {
			return;
		}

		setLoading(true);
		categoryHttp
			.get(id)
			.then(({ data }) => {
				setCategory(data.data);
				reset(data.data);
			})
			.finally(() => setLoading(false));
	}, [id, reset]);

	React.useEffect(() => {
		register({ name: 'is_active' });
	}, [register]);

	const onSubmit = (formData, event) => {
		setLoading(true);
		const httpRequest = !id
			? categoryHttp.create(formData)
			: categoryHttp.update(category!.id, formData);

		httpRequest
			.then(({ data }) => {
				snackbar.enqueueSnackbar('Categoria salva com sucesso!', {
					variant: 'success',
				});
				setTimeout(() => {
					if (event.type === 'submit') {
						if (id) {
							history.replace(`/categories/${data.data.id}/edit`);
						} else {
							history.push(`/categories/${data.data.id}/edit`);
						}
					} else {
						history.push('/categories');
					}
				});
			})
			.catch((error) => {
				console.log(error);
				snackbar.enqueueSnackbar('Não foi possivel salvar a categoria.', {
					variant: 'error',
				});
			})
			.finally(() => setLoading(false));
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
				error={!!errors.name}
				helperText={errors.name && errors.name.message}
				InputLabelProps={{ shrink: true }}
				disabled={loading}
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
				InputLabelProps={{ shrink: true }}
				disabled={loading}
			/>
			<FormControlLabel
				control={
					<Checkbox
						color="primary"
						name="is_active"
						onChange={() =>
							setValue('is_active', !getValues()['is_active'])
						}
						checked={watch('is_active')}
					/>
				}
				label={'Ativo?'}
				labelPlacement="end"
				disabled={loading}
			/>

			<Box dir="rtl">
				<Button
					color="primary"
					{...buttonProps}
					onClick={handleSubmit(onSubmit)}
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
