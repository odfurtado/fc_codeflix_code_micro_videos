import { createActions, createReducer } from 'reduxsauce';
import * as Typings from './types';

export const { Types, Creators } = createActions<
	{
		SET_SEARCH: string;
		SET_PAGE: string;
		SET_PER_PAGE: string;
		SET_ORDER: string;
		SET_RESET: string;
	},
	{
		setSearch(
			payload: Typings.SetSearchAction['payload']
		): Typings.SetSearchAction;
		setPage(payload: Typings.SetPageAction['payload']): Typings.SetPageAction;
		setPerPage(
			payload: Typings.SetPerPageAction['payload']
		): Typings.SetPerPageAction;
		setOrder(
			payload: Typings.SetOrderAction['payload']
		): Typings.SetOrderAction;
		setReset(): Typings.SetResetAction;
	}
>({
	setSearch: ['payload'],
	setPage: ['payload'],
	setPerPage: ['payload'],
	setOrder: ['payload'],
	setReset: [],
});

export const INITIAL_STATE: Typings.State = {
	search: null,
	pagination: {
		page: 1,
		per_page: 10,
	},
	order: {
		sort: null,
		dir: null,
	},
};

const setSearch = (
	state = INITIAL_STATE,
	action: Typings.SetSearchAction
): Typings.State => {
	return {
		...state,
		search: action.payload.search,
		pagination: {
			...state.pagination,
			page: 1,
		},
	};
};

const setPage = (
	state = INITIAL_STATE,
	action: Typings.SetPageAction
): Typings.State => {
	return {
		...state,
		pagination: {
			...state.pagination,
			page: action.payload.page,
		},
	};
};

const setPerPage = (
	state = INITIAL_STATE,
	action: Typings.SetPerPageAction
): Typings.State => {
	return {
		...state,
		pagination: {
			...state.pagination,
			per_page: action.payload.per_page,
		},
	};
};

const setOrder = (
	state = INITIAL_STATE,
	action: Typings.SetOrderAction
): Typings.State => {
	return {
		...state,
		pagination: {
			...state.pagination,
			page: 1,
		},
		order: {
			sort: action.payload.sort,
			dir: action.payload.dir,
		},
	};
};

function setReset(state = INITIAL_STATE, action: Typings.SetResetAction) {
	return {
		...INITIAL_STATE,
		search: {
			value: null,
			updated: true,
		},
	};
}

const reducer = createReducer<Typings.State, Typings.Actions>(INITIAL_STATE, {
	[Types.SET_SEARCH]: setSearch as any,
	[Types.SET_PAGE]: setPage as any,
	[Types.SET_PER_PAGE]: setPerPage as any,
	[Types.SET_ORDER]: setOrder as any,
	[Types.SET_RESET]: setReset as any,
});

export default reducer;
