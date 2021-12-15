import { Box, CssBaseline, MuiThemeProvider } from '@material-ui/core';
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import Breadcrumbs from './components/Breadcrumbs';
import { NavBar } from './components/NavBar';
import { AppRouter } from './routes/AppRouter';
import theme from './theme';

function App() {
	return (
		<MuiThemeProvider theme={theme}>
			<CssBaseline />
			<BrowserRouter>
				<NavBar />
				<Box paddingTop="70px">
					<Breadcrumbs />
					<AppRouter />
				</Box>
			</BrowserRouter>
		</MuiThemeProvider>
	);
}

export default App;
