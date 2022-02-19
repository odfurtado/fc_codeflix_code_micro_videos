import { IconButton } from '@material-ui/core';
import EditIcon from '@material-ui/icons/Edit';
import format from 'date-fns/format';
import parseISO from 'date-fns/parseISO';
import { invert } from 'lodash';
import { useSnackbar } from 'notistack';
import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import DefaultTable, {
	MuiDataTableRefComponent,
	TableColumn,
} from '../../components/Table';
import { FilterResetButton } from '../../components/Table/FilterResetButton';
import useFilter from '../../hooks/useFilter';
import memberHttp from '../../util/http/member-http';
import { CastMember, CastMemberTypeMap, ListResponse } from '../../util/models';
import * as yup from '../../util/vendor/yup';

const castMembersName = Object.values(CastMemberTypeMap);

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
		name: 'type',
		label: 'Tipo',
		options: {
			customBodyRender(type) {
				return CastMemberTypeMap[type];
			},
			filterOptions: {
				names: castMembersName,
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
						to={`/members/${tableMeta.rowData[0]}/edit`}
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
	const [membersData, setMembersData] = useState<CastMember[]>([]);

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
					type: yup
						.string()
						.nullable()
						.transform((value) =>
							!value || !castMembersName.includes(value)
								? undefined
								: value
						)
						.default(null),
				});
			},
			formatSearchParams: (debouncedState) => {
				return debouncedState.extraFilter
					? {
							...(debouncedState.extraFilter.type && {
								type: debouncedState.extraFilter.type,
							}),
					  }
					: undefined;
			},
			getStateFromURL: (queryParams) => {
				return {
					type: queryParams.get('type'),
				};
			},
		},
	});

	const columnTypeIndex = columns.findIndex((c) => c.name === 'type');
	const columnType = columns[columnTypeIndex];
	const typeFilterValue =
		filterState.extraFilter && (filterState.extraFilter.type as never);
	(columnType.options as any).filterList = typeFilterValue
		? [typeFilterValue]
		: [];

	const serverSideFilterList = columns.map((column) => []);
	if (typeFilterValue) {
		serverSideFilterList[columnTypeIndex] = [typeFilterValue];
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
		filterState.extraFilter,
		debouncedFilterState.pagination.page,
		debouncedFilterState.pagination.per_page,
		debouncedFilterState.order,
	]);

	const getData = async () => {
		setLoading(true);

		try {
			const { data: responseData } = await memberHttp.list<
				ListResponse<CastMember>
			>({
				queryParams: {
					search: filterManager.cleanSearchText(filterState.search),
					page: filterState.pagination.page,
					per_page: filterState.pagination.per_page,
					sort: filterState.order.sort,
					dir: filterState.order.dir,
					...(filterState.extraFilter &&
						filterState.extraFilter.type && {
							type: invert(CastMemberTypeMap)[
								filterState.extraFilter.type
							],
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
						[column]: filterList[columnIndex][0],
					});
				},
			}}
		></DefaultTable>
	);
};
