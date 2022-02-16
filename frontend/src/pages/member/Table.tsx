import { IconButton } from '@material-ui/core';
import EditIcon from '@material-ui/icons/Edit';
import format from 'date-fns/format';
import parseISO from 'date-fns/parseISO';
import { useSnackbar } from 'notistack';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import DefaultTable, { TableColumn } from '../../components/Table';
import memberHttp from '../../util/http/member-http';
import { CastMember, ListResponse } from '../../util/models';

enum CastMemberType {
	Diretor = 1,
	Ator = 2,
}

const columnsDefinition: TableColumn[] = [
	{
		name: 'id',
		label: 'ID',
		options: {
			sort: false,
		},
		width: '30%',
	},
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
	{
		name: 'actions',
		label: 'Ações',
		width: '13%',
		options: {
			sort: false,
			filter: false,
			customBodyRender: (value, tableMeta) => {
				return (
					<IconButton
						color={'secondary'}
						component={Link}
						to={`/members/${tableMeta.rowData[0]}/edit`}
					>
						<EditIcon />
					</IconButton>
				);
			},
		},
	},
];

type Props = {};

export const Table = (props: Props) => {
	const snackbar = useSnackbar();
	const [loading, setLoading] = useState<boolean>(false);
	const [membersData, setMembersData] = useState<CastMember[]>([]);

	useEffect(() => {
		let isSubscribed = true;

		(async () => {
			setLoading(true);

			try {
				const { data: responseData } = await memberHttp.list<
					ListResponse<CastMember>
				>();

				if (isSubscribed) {
					setMembersData(responseData.data);
				}
			} catch (error) {
				console.log(error);
				snackbar.enqueueSnackbar(
					'Não foi possivel carregar as informações.',
					{
						variant: 'error',
					}
				);
			} finally {
				setLoading(false);
			}
		})();

		return () => {
			isSubscribed = false;
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<DefaultTable
			title=""
			columns={columnsDefinition}
			data={membersData}
			loading={loading}
		></DefaultTable>
	);
};
