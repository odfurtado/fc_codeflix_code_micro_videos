import format from 'date-fns/format';
import parseISO from 'date-fns/parseISO';
import MUIDataTable, { MUIDataTableColumn } from 'mui-datatables';
import React, { useEffect, useState } from 'react';
import memberHttp from '../../util/http/member-http';

enum CastMemberType {
	Diretor = 1,
	Ator = 2,
}

const columnsDefinition: MUIDataTableColumn[] = [
	{
		name: 'name',
		label: 'Nome',
	},
	{
		name: 'type',
		label: 'Tipo',
		options: {
			customBodyRender(type) {
				return CastMemberType[type];
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
		memberHttp.list().then((response) => setMembersData(response.data.data));
	}, []);

	return (
		<MUIDataTable
			title=""
			columns={columnsDefinition}
			data={membersData}
		></MUIDataTable>
	);
};
