import { History } from 'history';
import { isEqual } from 'lodash';
import { MUIDataTableColumn } from 'mui-datatables';
import { Dispatch, useEffect, useReducer, useState } from 'react';
import { useHistory } from 'react-router';
import { useDebounce } from 'use-debounce';
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
	};
};

export default useFilter;

export class FilterManager {
	schema;
	state: FilterState = null as any;
	dispatch: Dispatch<FilterActions> = null as any;
	columns: MUIDataTableColumn[];
	rowsPerPage: number;
	rowsPerPageOptions: number[];
	history: History;

	constructor(options: FilterManagerOptions) {
		this.columns = options.columns;
		this.rowsPerPage = options.rowsPerPage;
		this.rowsPerPageOptions = options.rowsPerPageOptions;
		this.history = options.history;
		this.createValidationSchema();
	}

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
	};

	resetSearch = () => {
		this.dispatch(Creators.setReset());
	};

	cleanSearchText = (text: any) => {
		let newText = text;
		if (text && text.value !== undefined) {
			newText = text.value;
		}

		return newText;
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
			state: this.state,
		});
	};

	pushHistory = () => {
		const newLocation = {
			pathname: this.history.location.pathname,
			search: '?' + new URLSearchParams(this.formatSearchParams()),
			state: {
				...this.state,
				search: this.cleanSearchText(this.state.search),
			},
		};

		const currentState = this.history.location.state;
		const nextState = newLocation.state;

		if (isEqual(currentState, nextState)) {
			return;
		}

		this.history.push(newLocation);
	};

	formatSearchParams = () => {
		const search = this.cleanSearchText(this.state.search);

		return {
			...(search && search !== '' && { search: search }),
			...(this.state.pagination.page !== 1 && {
				page: this.state.pagination.page,
			}),
			...(this.state.pagination.per_page !== 10 && {
				per_page: this.state.pagination.per_page,
			}),
			...(this.state.order.sort && {
				sort: this.state.order.sort,
				dir: this.state.order.dir,
			}),
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
					.oneOf(this.rowsPerPageOptions)
					.transform((value) => (isNaN(value) ? undefined : value))
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
		});
	};
}
