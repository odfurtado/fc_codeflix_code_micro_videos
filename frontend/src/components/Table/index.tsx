// @flow
import MUIDataTable, {
	MUIDataTableColumn,
	MUIDataTableOptions,
	MUIDataTableProps,
} from 'mui-datatables';
import * as React from 'react';
import { merge, omit, cloneDeep } from 'lodash';
import { useTheme } from '@material-ui/styles';
import { MuiThemeProvider, Theme, useMediaQuery } from '@material-ui/core';
import DebouncedTableSearch from './DebouncedTableSearch';

export interface TableColumn extends MUIDataTableColumn {
	width?: string;
}

export interface MuiDataTableRefComponent {
	changePage: (page: number) => void;
	changeRowsPerPage: (rowsPerPage: number) => void;
}

interface TableProps
	extends MUIDataTableProps,
		React.RefAttributes<MuiDataTableRefComponent> {
	columns: TableColumn[];
	loading?: boolean;
	debouncedSearchTime?: number;
}

const makeDefaultOptions = (
	debouncedSearchTime?: number
): MUIDataTableOptions => ({
	print: false,
	download: false,

	textLabels: {
		body: {
			noMatch: 'Nenhum registro encontrado',
			toolTip: 'Classificar',
		},
		pagination: {
			next: 'Próxima página',
			previous: 'Página anterior',
			rowsPerPage: 'Por página:',
			displayRows: 'de',
		},
		toolbar: {
			search: 'Busca',
			downloadCsv: 'Download CSV',
			print: 'Imprimir',
			viewColumns: 'Ver Colunas',
			filterTable: 'Filtrar Tabelas',
		},
		filter: {
			all: 'Todos',
			title: 'FILTROS',
			reset: 'LIMPAR',
		},
		viewColumns: {
			title: 'Ver Colunas',
			titleAria: 'Ver/Esconder Colunas da Tabela',
		},
		selectedRows: {
			text: 'registros(s) selecionados',
			delete: 'Excluir',
			deleteAria: 'Excluir registros selecionados',
		},
	},
	customSearchRender: (
		searchText: string,
		handleSearch: any,
		hideSearch: any,
		options: any
	) => {
		return (
			<DebouncedTableSearch
				searchText={searchText}
				onSearch={handleSearch}
				onHide={hideSearch}
				options={options}
				debounceTime={debouncedSearchTime}
			/>
		);
	},
});

const Table = React.forwardRef<MuiDataTableRefComponent, TableProps>(
	(props, ref) => {
		const extractMuiDataTableColumns = (
			columns: TableColumn[]
		): MUIDataTableColumn[] => {
			setColumnsWidth(columns);
			return columns.map((column) => omit(column, 'width'));
		};

		const setColumnsWidth = (columns: TableColumn[]) => {
			columns.forEach((column, key) => {
				if (column.width) {
					const overrides = theme.overrides as any;

					overrides.MUIDataTableHeadCell.fixedHeaderCommon[
						`&:nth-child(${key + 2})`
					] = {
						width: column.width,
					};
				}
			});
		};

		const removeActionPadding = () => {
			const selector = `&[data-testid^="MuiDataTableBodyCell-${
				props.columns.length - 1
			}"]`;
			(theme.overrides as any).MUIDataTableBodyCell.root[selector] = {
				paddingTop: '0px',
				paddingBottom: '0px',
			};
		};

		const applyLoading = () => {
			const textLabels = (newProps.options as any).textLabels;
			textLabels.body.noMatch =
				props.loading === true
					? 'Carregando registros...'
					: textLabels.body.noMatch;
		};
		const applyResponsive = () => {
			newProps.options.responsive = isSmOrDown
				? 'scrollMaxHeight'
				: 'stacked';
		};

		const getOriginalMuiDataTablesProps = () => {
			return {
				...omit(newProps, 'loading'),
				ref,
			};
		};

		const theme = cloneDeep<Theme>(useTheme());
		removeActionPadding();
		const isSmOrDown = useMediaQuery(theme.breakpoints.down('sm'));

		const newProps = merge(
			{ options: cloneDeep(makeDefaultOptions(props.debouncedSearchTime)) },
			props,
			{
				columns: extractMuiDataTableColumns(props.columns),
			}
		);

		applyLoading();
		applyResponsive();
		const originalProps = getOriginalMuiDataTablesProps();

		return (
			<MuiThemeProvider theme={theme}>
				<MUIDataTable {...originalProps}></MUIDataTable>
			</MuiThemeProvider>
		);
	}
);

export default Table;
