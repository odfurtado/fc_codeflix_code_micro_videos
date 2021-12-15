import { Chip } from '@material-ui/core';
import format from 'date-fns/format';
import parseISO from 'date-fns/parseISO';
import MUIDataTable, { MUIDataTableColumn } from 'mui-datatables';
import React, { useEffect, useState } from 'react';
import { BadgeNo, BadgeYes } from '../../components/Badge';
import genreHttp from '../../util/http/genre-http';

const columnsDefinition: MUIDataTableColumn[] = [
	{
		name: 'name',
		label: 'Nome',
	},
	{
		name: 'categories',
		label: 'Categorias',
		options: {
			customBodyRender(categories) {
				return categories.map((category) => category.name).join(', ');
			},
		},
	},
	{
		name: 'is_active',
		label: 'Ativo',
		options: {
			customBodyRender(value) {
				return value ? <BadgeYes /> : <BadgeNo />;
			},
		},
	},
	{
		name: 'created_at',
		label: 'Criado em',
		options: {
			customBodyRender(value, tableMeta, updateValue) {
				return <span>{format(parseISO(value), 'dd/MM/yyyy')}</span>;
			},
		},
	},
];

type Props = {};

export const Table = (props: Props) => {
	const [membersData, setMembersData] = useState([]);

	useEffect(() => {
		genreHttp.list().then((response) => setMembersData(response.data.data));
	}, []);

	return (
		<MUIDataTable
			title=""
			columns={columnsDefinition}
			data={membersData}
		></MUIDataTable>
	);
};
