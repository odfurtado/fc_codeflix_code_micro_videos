import { IconButton } from '@material-ui/core';
import EditIcon from '@material-ui/icons/Edit';
import format from 'date-fns/format';
import parseISO from 'date-fns/parseISO';
import { useSnackbar } from 'notistack';
import React, { useEffect, useRef, useState, useReducer } from 'react';
import { Link } from 'react-router-dom';
import { BadgeNo, BadgeYes } from '../../components/Badge';
import DefaultTable, { TableColumn } from '../../components/Table';
import { FilterResetButton } from '../../components/Table/FilterResetButton';
import reducer, { INITIAL_STATE, Creators } from '../../store/search';
import categoryHttp from '../../util/http/category-http';
import { Category, ListResponse } from '../../util/models';

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
		width: '43%',
	},
	{
		name: 'is_active',
		label: 'Ativo',
		options: {
			customBodyRender(value, tableMeta, updateValue) {
				return value ? <BadgeYes /> : <BadgeNo />;
			},
		},
		width: '4%',
	},
	{
		name: 'created_at',
		label: 'Criado em',
		options: {
			customBodyRender(value, tableMeta, updateValue) {
				return <span>{format(parseISO(value), 'dd/MM/yyyy')}</span>;
			},
		},
		width: '10%',
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
						to={`/categories/${tableMeta.rowData[0]}/edit`}
					>
						<EditIcon />
					</IconButton>
				);
			},
		},
	},
];

type TableProps = {};

export const Table = (props: TableProps) => {
	const snackbar = useSnackbar();
	const subscribed = useRef(true);
	const [loading, setLoading] = useState<boolean>(false);
	const [categoriesData, setCategoriesData] = useState<Category[]>([]);
	const [totalRecords, setTotalRecords] = useState<number>(0);
	const [searchState, dispatch] = useReducer(reducer, INITIAL_STATE);

	useEffect(() => {
		subscribed.current = true;

		getData();

		return () => {
			subscribed.current = false;
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [
		searchState.search,
		searchState.pagination.page,
		searchState.pagination.per_page,
		searchState.order,
	]);

	const getData = async () => {
		setLoading(true);
		try {
			const { data: responseData } = await categoryHttp.list<
				ListResponse<Category>
			>({
				queryParams: {
					search: cleanSearchText(searchState.search),
					page: searchState.pagination.page,
					per_page: searchState.pagination.per_page,
					sort: searchState.order.sort,
					dir: searchState.order.dir,
				},
			});
			if (subscribed.current) {
				setCategoriesData(responseData.data);
				setTotalRecords(responseData.meta.total);
			}
		} catch (error) {
			console.log(error);
			if (categoryHttp.isCancelledRequest(error)) {
				return;
			}
			snackbar.enqueueSnackbar('Não foi possivel carregar as informações.', {
				variant: 'error',
			});
		} finally {
			setLoading(false);
		}
	};

	const cleanSearchText = (text: any) => {
		let newText = text;
		if (text && text.value !== undefined) {
			newText = text.value;
		}

		return newText;
	};

	return (
		<DefaultTable
			title=""
			columns={columnsDefinition}
			data={categoriesData}
			loading={loading}
			debouncedSearchTime={300}
			options={{
				serverSide: true,
				searchText: searchState.search as any,
				page: searchState.pagination.page - 1,
				rowsPerPage: searchState.pagination.per_page,
				count: totalRecords,
				customToolbar: () => (
					<FilterResetButton
						handleClick={() => {
							dispatch(Creators.setReset());
						}}
					/>
				),
				onSearchChange: (value) =>
					dispatch(Creators.setSearch({ search: value })),
				onChangePage: (page) =>
					dispatch(Creators.setPage({ page: page + 1 })),
				onChangeRowsPerPage: (per_page) =>
					dispatch(Creators.setPerPage({ per_page })),
				onColumnSortChange: (changeColumn, direction) =>
					dispatch(
						Creators.setOrder({
							sort: changeColumn,
							dir: direction.includes('desc') ? 'desc' : 'asc',
						})
					),
			}}
		></DefaultTable>
	);
};
