import { LocaleObject, setLocale } from 'yup';

const ptBR: LocaleObject = {
	mixed: {
		required: '${path} é requerido',
	},
	string: {
		max: '${path} precisa ter no máximo ${max} caracteres',
	},
	number: {
		min: '${path} precisa ser no mínimo ${min}',
	},
	array: {
		min: '${path} precisa ter no mínimo ${min} registro(s)',
	},
};

setLocale(ptBR);

export * from 'yup';
