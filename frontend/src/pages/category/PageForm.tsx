// @flow
import * as React from 'react';
import { useParams } from 'react-router-dom';
import { Page } from '../../components/Page';
import { Form } from './Form';
type Props = {};

const PageForm = (props: Props) => {
	const { id } = useParams<{ id: string }>();

	return (
		<Page title={!id ? 'Criar Categoria' : 'Editar Categoria'}>
			<Form />
		</Page>
	);
};

export default PageForm;
