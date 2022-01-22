// @flow
import * as React from 'react';
import { useParams } from 'react-router-dom';
import { Page } from '../../components/Page';
import { Form } from './Form';

const PageForm = () => {
	const { id } = useParams<{ id: string }>();

	return (
		<Page title={!id ? 'Criar Membro' : 'Editar Membro'}>
			<Form />
		</Page>
	);
};

export default PageForm;
