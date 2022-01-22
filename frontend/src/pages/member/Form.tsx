// @flow
import {
	Box,
	Button,
	ButtonProps,
	FormControl,
	FormControlLabel,
	FormHelperText,
	FormLabel,
	makeStyles,
	Radio,
	RadioGroup,
	TextField,
	Theme,
} from '@material-ui/core';
import * as React from 'react';
import * as yup from '../../util/vendor/yup';
import { useForm } from 'react-hook-form';
import memberHttp from '../../util/http/member-http';
import { useHistory, useParams } from 'react-router-dom';
import { useSnackbar } from 'notistack';

const useStyle = makeStyles((theme: Theme) => ({
	submit: {
		margin: theme.spacing(1),
	},
	formElement: {
		margin: theme.spacing(1),
	},
}));

const validationSchema = yup.object().shape({
	name: yup.string().label('Nome').required().max(255),
	type: yup.number().label('Tipo').required(),
});

export const Form = () => {
	const classes = useStyle();

	const { register, handleSubmit, setValue, errors, reset, watch } = useForm<{
		name;
		type;
	}>({
		validationSchema,
		defaultValues: {},
	});
	const snackbar = useSnackbar();
	const history = useHistory();
	const { id } = useParams<{ id: string }>();
	const [member, setMember] = React.useState<{ id: string } | null>(null);
	const [loading, setLoading] = React.useState(false);

	const buttonProps: ButtonProps = {
		variant: 'contained',
		size: 'small',
		className: classes.submit,
		color: 'secondary',
		disabled: loading,
	};

	const loadData = React.useCallback(async () => {
		if (!id) {
			return;
		}

		setLoading(true);

		try {
			const { data } = await memberHttp.get(id);
			setMember(data.data);
			reset(data.data);
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
		register({ name: 'type' });
	}, [register]);

	const onSubmit = async (formData, event) => {
		setLoading(true);

		try {
			const httpRequest = !id
				? memberHttp.create(formData)
				: memberHttp.update(member!.id, formData);

			const { data } = await httpRequest;
			snackbar.enqueueSnackbar('Membro salvo com sucesso!', {
				variant: 'success',
			});

			setTimeout(() => {
				if (event.type === 'submit') {
					if (id) {
						history.replace(`/members/${data.data.id}/edit`);
					} else {
						history.push(`/members/${data.data.id}/edit`);
					}
				} else {
					history.push('/members');
				}
			});
		} catch (error) {
			console.log(error);
			snackbar.enqueueSnackbar('Não foi possivel salvar o membro.', {
				variant: 'error',
			});
		} finally {
			setLoading(false);
		}
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
				error={!!errors.name}
				helperText={errors.name && errors.name.message}
				InputLabelProps={{ shrink: true }}
				disabled={loading}
			/>
			<FormControl
				component="fieldset"
				margin="dense"
				className={classes.formElement}
				error={!!errors.type}
				disabled={loading}
			>
				<FormLabel component="legend">Tipo</FormLabel>
				<RadioGroup
					name="type"
					onChange={(e) => {
						setValue('type', parseInt(e.target.value));
					}}
					row
					value={watch('type') + ''}
				>
					<FormControlLabel
						value="1"
						control={<Radio color="primary" />}
						label="Diretor"
					/>
					<FormControlLabel
						value="2"
						control={<Radio color="primary" />}
						label="Ator"
					/>
				</RadioGroup>
				{errors.type && (
					<FormHelperText id="type-helper-text">
						{errors.type.message}
					</FormHelperText>
				)}
			</FormControl>
			<Box dir="rtl">
				<Button {...buttonProps} onClick={handleSubmit(onSubmit)}>
					Salvar
				</Button>
				<Button {...buttonProps} type="submit">
					Salvar e continuar editando
				</Button>
			</Box>
		</form>
	);
};