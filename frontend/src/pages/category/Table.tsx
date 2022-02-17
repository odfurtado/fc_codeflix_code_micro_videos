import { IconButton } from '@material-ui/core';
import EditIcon from '@material-ui/icons/Edit';
import format from 'date-fns/format';
import parseISO from 'date-fns/parseISO';
import { useSnackbar } from 'notistack';
import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { BadgeNo, BadgeYes } from '../../components/Badge';
import DefaultTable, { TableColumn } from '../../components/Table';
import { FilterResetButton } from '../../components/Table/FilterResetButton';
import useFilter from '../../hooks/useFilter';
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

const DEBOUCE_TIME = 500;
const rowsPerPage = 10;
const rowsPerPageOptions = [5, 10, 15, 20];

export const Table = (props: TableProps) => {
	const snackbar = useSnackbar();
	const subscribed = useRef(true);
	const [loading, setLoading] = useState<boolean>(false);
	const [categoriesData, setCategoriesData] = useState<Category[]>([]);
	const {
		filterState,
		debouncedFilterState,
		totalRecords,
		setTotalRecords,
		filterManager,
	} = useFilter({
		columns: columnsDefinition,
		rowsPerPage,
		rowsPerPageOptions,
		debounceTime: DEBOUCE_TIME,
	});

	useEffect(() => {
		subscribed.current = true;
		filterManager.pushHistory();

		getData();

		return () => {
			subscribed.current = false;
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [
		// eslint-disable-next-line react-hooks/exhaustive-deps
		filterManager.cleanSearchText(debouncedFilterState.search),
		debouncedFilterState.pagination.page,
		debouncedFilterState.pagination.per_page,
		debouncedFilterState.order,
	]);

	const getData = async () => {
		setLoading(true);
		try {
			const { data: responseData } = await categoryHttp.list<
				ListResponse<Category>
			>({
				queryParams: {
					search: filterManager.cleanSearchText(filterState.search),
					page: filterState.pagination.page,
					per_page: filterState.pagination.per_page,
					sort: filterState.order.sort,
					dir: filterState.order.dir,
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

	return (
		<DefaultTable
			title=""
			columns={columnsDefinition}
			data={categoriesData}
			loading={loading}
			debouncedSearchTime={DEBOUCE_TIME}
			options={{
				serverSide: true,
				searchText: filterState.search as any,
				page: filterState.pagination.page - 1,
				rowsPerPage: filterState.pagination.per_page,
				rowsPerPageOptions,
				count: totalRecords,
				customToolbar: () => (
					<FilterResetButton handleClick={filterManager.resetSearch} />
				),
				onSearchChange: filterManager.changeSearch,
				onChangePage: filterManager.changePage,
				onChangeRowsPerPage: filterManager.changeRowsPerPage,
				onColumnSortChange: filterManager.changeColumnSort,
			}}
		></DefaultTable>
	);
};
