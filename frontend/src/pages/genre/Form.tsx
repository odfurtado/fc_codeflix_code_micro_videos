import {
	Checkbox,
	FormControlLabel,
	makeStyles,
	MenuItem,
	TextField,
	Theme,
} from '@material-ui/core';
import { useSnackbar } from 'notistack';
import * as React from 'react';
import { useForm } from 'react-hook-form';
import { useHistory, useParams } from 'react-router-dom';
import { DefaultForm } from '../../components/DefaultForm';
import SubmitActions from '../../components/SubmitActions';
import categoryHttp from '../../util/http/category-http';
import genreHttp from '../../util/http/genre-http';
import { Category, Genre } from '../../util/models';
import * as yup from '../../util/vendor/yup';

const useStyle = makeStyles((theme: Theme) => ({
	formElement: {
		margin: theme.spacing(1),
	},
}));

const validationSchema = yup.object().shape({
	name: yup.string().label('Nome').required().max(255),
	categories_id: yup.array().min(1).label('Categorias').required(),
});

export const Form = () => {
	const classes = useStyle();

	const [categories, setCategories] = React.useState<Category[]>([]);
	const { register, handleSubmit, getValues, setValue, errors, reset, watch } =
		useForm<{
			name;
			categories_id;
			is_active;
		}>({
			validationSchema,
			defaultValues: {
				categories_id: [],
				is_active: true,
			},
		});
	const snackbar = useSnackbar();
	const history = useHistory();
	const { id } = useParams<{ id: string }>();
	const [genre, setGenre] = React.useState<Genre | null>(null);
	const [loading, setLoading] = React.useState(false);

	const loadData = React.useCallback(async () => {
		if (!id) {
			return;
		}

		setLoading(true);

		try {
			const { data } = await genreHttp.get(id);
			setGenre(data.data);
			const categories_id = data.data.categories.map(
				(category) => category.id
			);
			reset({
				...data.data,
				categories_id,
			});
		} catch (error) {
			console.log(error);
			snackbar.enqueueSnackbar('Não foi possível carregar as informações', {
				variant: 'error',
			});
		} finally {
			setLoading(false);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [id, reset]);

	React.useEffect(() => {
		loadData();
	}, [loadData]);

	React.useEffect(() => {
		register({ name: 'categories_id' });
		register({ name: 'is_active' });
	}, [register]);

	React.useEffect(() => {
		categoryHttp
			.list({
				queryParams: {
					all: '',
				},
			})
			.then(({ data }) => setCategories(data.data));
	}, []);

	const onSubmit = async (formData, event) => {
		setLoading(true);

		try {
			const httpRequest = !id
				? genreHttp.create(formData)
				: genreHttp.update(genre!.id, formData);

			const { data } = await httpRequest;
			snackbar.enqueueSnackbar('Gênero salvo com sucesso!', {
				variant: 'success',
			});

			setTimeout(() => {
				if (event.type === 'submit') {
					if (id) {
						history.replace(`/genres/${data.data.id}/edit`);
					} else {
						history.push(`/genres/${data.data.id}/edit`);
					}
				} else {
					history.push('/genres');
				}
			});
		} catch (error) {
			console.log(error);
			snackbar.enqueueSnackbar('Não foi possivel salvar o gênero.', {
				variant: 'error',
			});
		} finally {
			setLoading(false);
		}
	};

	return (
		<DefaultForm onSubmit={handleSubmit(onSubmit)}>
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
				error={!!errors.categories_id}
				helperText={errors.categories_id && errors.categories_id.message}
				InputLabelProps={{ shrink: true }}
				disabled={loading}
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

			<SubmitActions
				disabled={loading}
				handleSave={handleSubmit(onSubmit)}
			/>
		</DefaultForm>
	);
};
