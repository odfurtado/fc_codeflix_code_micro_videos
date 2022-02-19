import { History } from 'history';
import { isEqual } from 'lodash';
import { MUIDataTableColumn } from 'mui-datatables';
import React, { Dispatch, useEffect, useReducer, useState } from 'react';
import { useHistory } from 'react-router';
import { useDebounce } from 'use-debounce';
import { MuiDataTableRefComponent } from '../components/Table';
import reducer, { Creators } from '../store/filter';
import {
	Actions as FilterActions,
	State as FilterState,
} from '../store/filter/types';
import * as yup from '../util/vendor/yup';

interface FilterManagerOptions {
	columns: MUIDataTableColumn[];
	rowsPerPage: number;
	rowsPerPageOptions: number[];
	debounceTime: number;
	history: History;
	tableRef: React.MutableRefObject<MuiDataTableRefComponent>;
	extraFilter?: ExtraFilter;
}

interface ExtraFilter {
	getStateFromURL: (queryParams: URLSearchParams) => any;
	formatSearchParams: (debouncedState: FilterState) => any;
	createValidationSchema: () => any;
}

interface UseFilterOptions extends Omit<FilterManagerOptions, 'history'> {}

const useFilter = (options: UseFilterOptions) => {
	const history = useHistory();
	const filterManager = new FilterManager({ ...options, history });
	const [totalRecords, setTotalRecords] = useState<number>(0);
	const [filterState, dispatch] = useReducer(
		reducer,
		filterManager.getStateFromUrl()
	);
	const [debouncedFilterState] = useDebounce(
		filterState,
		options.debounceTime
	);

	filterManager.state = filterState;
	filterManager.debouncedState = debouncedFilterState;
	filterManager.dispatch = dispatch;
	filterManager.applyOrderInColumns();

	useEffect(() => {
		filterManager.replaceHistory();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return {
		filterManager,
		filterState,
		debouncedFilterState,
		dispatch,
		totalRecords,
		setTotalRecords,
		columns: filterManager.columns,
	};
};

export default useFilter;

export class FilterManager {
	schema;
	state: FilterState = null as any;
	debouncedState: FilterState = null as any;
	dispatch: Dispatch<FilterActions> = null as any;
	columns: MUIDataTableColumn[];
	rowsPerPage: number;
	rowsPerPageOptions: number[];
	history: History;
	tableRef: React.MutableRefObject<MuiDataTableRefComponent>;
	extraFilter?: ExtraFilter;

	constructor(options: FilterManagerOptions) {
		this.columns = options.columns;
		this.rowsPerPage = options.rowsPerPage;
		this.rowsPerPageOptions = options.rowsPerPageOptions;
		this.history = options.history;
		this.tableRef = options.tableRef;
		this.extraFilter = options.extraFilter;
		this.createValidationSchema();
	}

	resetTablePagination = () => {
		this.tableRef.current.changeRowsPerPage(this.rowsPerPage);
		this.tableRef.current.changePage(0);
	};

	changeSearch = (
		value: string | { value: string; [key: string]: any } | null
	) => {
		this.dispatch(Creators.setSearch({ search: value }));
	};

	changePage = (page: number) => {
		this.dispatch(Creators.setPage({ page: page + 1 }));
	};

	changeRowsPerPage = (per_page: number) => {
		this.dispatch(Creators.setPerPage({ per_page }));
	};

	changeColumnSort = (changeColumn: string, direction: string) => {
		this.dispatch(
			Creators.setOrder({
				sort: changeColumn,
				dir: direction.includes('desc') ? 'desc' : 'asc',
			})
		);
		this.resetTablePagination();
	};

	changeExtraFilter = (data) => {
		this.dispatch(Creators.updateExtraFilter(data));
	};

	cleanSearchText = (text: any) => {
		let newText = text;
		if (text && text.value !== undefined) {
			newText = text.value;
		}

		return newText;
	};

	resetFilter = () => {
		const INITIAL_STATE = {
			...this.schema.cast({}),
			search: {
				value: null,
				update: true,
			},
		};

		this.dispatch(
			Creators.setReset({
				state: INITIAL_STATE,
			})
		);

		this.resetTablePagination();
	};

	applyOrderInColumns() {
		this.columns = this.columns.map((column) => {
			return column.name === this.state.order.sort
				? {
						...column,
						options: {
							...column.options,
							sortDirection: this.state.order.dir as any,
						},
				  }
				: column;
		});
	}

	replaceHistory = () => {
		this.history.replace({
			pathname: this.history.location.pathname,
			search: '?' + new URLSearchParams(this.formatSearchParams()),
			state: this.debouncedState,
		});
	};

	pushHistory = () => {
		const newLocation = {
			pathname: this.history.location.pathname,
			search: '?' + new URLSearchParams(this.formatSearchParams()),
			state: {
				...this.debouncedState,
				search: this.cleanSearchText(this.debouncedState.search),
			},
		};

		const currentState = this.history.location.state;
		const nextState = this.debouncedState;

		if (isEqual(currentState, nextState)) {
			return;
		}

		this.history.push(newLocation);
	};

	formatSearchParams = () => {
		const search = this.cleanSearchText(this.debouncedState.search);

		return {
			...(search && search !== '' && { search: search }),
			...(this.debouncedState.pagination.page !== 1 && {
				page: this.debouncedState.pagination.page,
			}),
			...(this.debouncedState.pagination.per_page !== 10 && {
				per_page: this.debouncedState.pagination.per_page,
			}),
			...(this.debouncedState.order.sort && {
				sort: this.debouncedState.order.sort,
				dir: this.debouncedState.order.dir,
			}),
			...(this.extraFilter &&
				this.extraFilter.formatSearchParams(this.debouncedState)),
		};
	};

	getStateFromUrl = () => {
		const queryParams = new URLSearchParams(
			this.history.location.search.substr(1)
		);
		return this.schema.cast({
			search: queryParams.get('search'),
			pagination: {
				page: queryParams.get('page'),
				per_page: queryParams.get('per_page'),
			},
			order: {
				sort: queryParams.get('sort'),
				dir: queryParams.get('dir'),
			},
			...(this.extraFilter && {
				extraFilter: this.extraFilter.getStateFromURL(queryParams),
			}),
		});
	};

	private createValidationSchema = () => {
		this.schema = yup.object().shape({
			search: yup
				.string()
				.transform((value) => (!value ? undefined : value))
				.default(''),
			pagination: yup.object().shape({
				page: yup
					.number()
					.transform((value) =>
						isNaN(value) || parseInt(value) < 1 ? undefined : value
					)
					.default(1),
				per_page: yup
					.number()
					.transform((value) =>
						isNaN(value) ||
						!this.rowsPerPageOptions.includes(parseInt(value))
							? undefined
							: value
					)
					.default(this.rowsPerPage),
			}),
			order: yup.object().shape({
				sort: yup
					.string()
					.nullable()
					.transform((value) => {
						const columnsName = this.columns
							.filter(
								(column) =>
									!column.options || column.options.sort !== false
							)
							.map((column) => column.name);
						return columnsName.includes(value) ? value : undefined;
					})
					.default(null),
				per_page: yup
					.string()
					.nullable()
					.transform((value) =>
						!value || !['asc', 'desc'].includes(value.toLowerCase())
							? undefined
							: value
					)
					.default(null),
			}),
			...(this.extraFilter && {
				extraFilter: this.extraFilter.createValidationSchema(),
			}),
		});
	};
}
