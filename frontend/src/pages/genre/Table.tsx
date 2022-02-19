import { IconButton } from '@material-ui/core';
import EditIcon from '@material-ui/icons/Edit';
import format from 'date-fns/format';
import parseISO from 'date-fns/parseISO';
import { useSnackbar } from 'notistack';
import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { BadgeNo, BadgeYes } from '../../components/Badge';
import DefaultTable, {
	MuiDataTableRefComponent,
	TableColumn,
} from '../../components/Table';
import { FilterResetButton } from '../../components/Table/FilterResetButton';
import useFilter from '../../hooks/useFilter';
import categoryHttp from '../../util/http/category-http';
import genreHttp from '../../util/http/genre-http';
import { Category, Genre, ListResponse } from '../../util/models';
import * as yup from '../../util/vendor/yup';

const columnsDefinition: TableColumn[] = [
	{
		name: 'id',
		label: 'ID',
		options: {
			sort: false,
			filter: false,
		},
		width: '30%',
	},
	{
		name: 'name',
		label: 'Nome',
		options: {
			filter: false,
		},
	},
	{
		name: 'categories',
		label: 'Categorias',
		options: {
			customBodyRender(categories) {
				return categories.map((category) => category.name).join(', ');
			},
			filterType: 'multiselect',
			filterOptions: {
				names: [],
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
			filter: false,
		},
	},
	{
		name: 'created_at',
		label: 'Criado em',
		options: {
			customBodyRender(value, tableMeta, updateValue) {
				return <span>{format(parseISO(value), 'dd/MM/yyyy')}</span>;
			},
			filter: false,
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
						to={`/genres/${tableMeta.rowData[0]}/edit`}
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
	const [membersData, setMembersData] = useState<Genre[]>([]);

	const tableRef =
		useRef() as React.MutableRefObject<MuiDataTableRefComponent>;
	const {
		filterState,
		debouncedFilterState,
		totalRecords,
		setTotalRecords,
		filterManager,
		columns,
	} = useFilter({
		columns: columnsDefinition,
		rowsPerPage,
		rowsPerPageOptions,
		debounceTime: DEBOUCE_TIME,
		tableRef,
		extraFilter: {
			createValidationSchema: () => {
				return yup.object().shape({
					categories: yup
						.mixed()
						.nullable()
						.transform((value) =>
							!value || value === '' ? undefined : value.split(',')
						)
						.default(null),
				});
			},
			formatSearchParams: (debouncedState) => {
				return debouncedState.extraFilter
					? {
							...(debouncedState.extraFilter.categories && {
								categories:
									debouncedState.extraFilter.categories.join(','),
							}),
					  }
					: undefined;
			},
			getStateFromURL: (queryParams) => {
				return {
					categories: queryParams.get('categories'),
				};
			},
		},
	});

	const columnCategoriesIndex = columns.findIndex(
		(c) => c.name === 'categories'
	);
	const columnCategories = columns[columnCategoriesIndex];
	const categoriesFilterValue =
		filterState.extraFilter && filterState.extraFilter.categories;
	(columnCategories.options as any).filterList = categoriesFilterValue
		? categoriesFilterValue
		: [];

	const serverSideFilterList = columns.map((column) => []);
	if (categoriesFilterValue) {
		serverSideFilterList[columnCategoriesIndex] = categoriesFilterValue;
	}

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
		debouncedFilterState.extraFilter,
	]);

	const getData = async () => {
		try {
			const { data: responseData } = await genreHttp.list<
				ListResponse<Genre>
			>({
				queryParams: {
					search: filterManager.cleanSearchText(filterState.search),
					page: filterState.pagination.page,
					per_page: filterState.pagination.per_page,
					sort: filterState.order.sort,
					dir: filterState.order.dir,
					...(filterState.extraFilter &&
						filterState.extraFilter.categories && {
							categories: filterState.extraFilter.categories.join(','),
						}),
				},
			});
			if (subscribed.current) {
				setMembersData(responseData.data);
				setTotalRecords(responseData.meta.total);
			}
		} catch (error) {
			console.log(error);
			snackbar.enqueueSnackbar('Não foi possivel carregar as informações.', {
				variant: 'error',
			});
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		let isSubscribed = true;

		(async () => {
			try {
				const { data: responseData } = await categoryHttp.list<
					ListResponse<Category>
				>({
					queryParams: {
						all: '',
					},
				});

				if (isSubscribed) {
					(columnCategories.options as any).filterOptions.names =
						responseData.data.map((category) => category.name);
				}
			} catch (error) {
				console.error(error);
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
			columns={columns}
			data={membersData}
			loading={loading}
			debouncedSearchTime={DEBOUCE_TIME}
			ref={tableRef}
			options={{
				serverSideFilterList,
				serverSide: true,
				searchText: filterState.search as any,
				page: filterState.pagination.page - 1,
				rowsPerPage: filterState.pagination.per_page,
				rowsPerPageOptions,
				count: totalRecords,
				customToolbar: () => (
					<FilterResetButton handleClick={filterManager.resetFilter} />
				),
				onSearchChange: filterManager.changeSearch,
				onChangePage: filterManager.changePage,
				onChangeRowsPerPage: filterManager.changeRowsPerPage,
				onColumnSortChange: filterManager.changeColumnSort,
				onFilterChange: (column, filterList, type) => {
					const columnIndex = columns.findIndex((c) => c.name === column);
					filterManager.changeExtraFilter({
						[column]: filterList[columnIndex],
					});
				},
			}}
		></DefaultTable>
	);
};
