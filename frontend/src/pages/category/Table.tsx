import { Chip } from '@material-ui/core';
import format from 'date-fns/format';
import parseISO from 'date-fns/parseISO';
import MUIDataTable, { MUIDataTableColumn } from 'mui-datatables';
import React, { useEffect, useState } from 'react';
import categoryHttp from '../../util/http/category-http';

const columnsDefinition: MUIDataTableColumn[] = [
	{
		name: 'name',
		label: 'Nome',
	},
	{
		name: 'is_active',
		label: 'Ativo',
		options: {
			customBodyRender(value, tableMeta, updateValue) {
				return (
					<Chip
						label={value ? 'Sim' : 'Não'}
						color={value ? 'primary' : 'secondary'}
					/>
				);
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
	const [categoriesData, setCategoriesData] = useState([]);

	useEffect(() => {
		categoryHttp
			.list()
			.then(({ data: responseData }) =>
				setCategoriesData(responseData.data)
			);
	}, []);

	return (
		<MUIDataTable
			title=""
			columns={columnsDefinition}
			data={categoriesData}
		></MUIDataTable>
	);
};
