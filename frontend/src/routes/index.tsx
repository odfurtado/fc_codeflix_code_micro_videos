import { RouteProps } from 'react-router-dom';
import Dashboard from '../pages/Dashboard';
import CategoryList from '../pages/category/PageList';
import GenreList from '../pages/genre/PageList';
import MemberList from '../pages/member/PageList';

export interface MyRouteProps extends RouteProps {
	name: string;
	label: string;
	icon?: string;
}

const routes: MyRouteProps[] = [
	{
		name: 'dashboard',
		label: 'Dashboard',
		path: '/',
		component: Dashboard,
		exact: true,
		icon: 'home',
	},
	{
		name: 'categories.list',
		label: 'Categorias',
		path: '/categories',
		component: CategoryList,
		exact: true,
		icon: 'category',
	},
	// {
	// 	name: 'categories.create',
	// 	label: 'Criar Categoria',
	// 	path: '/categories/create',
	// 	component: CategoryList,
	// 	exact: true,
	// },
	{
		name: 'genres.list',
		label: 'Gêneros',
		path: '/genres',
		component: GenreList,
		exact: true,
		icon: 'movie_filter',
	},
	{
		name: 'members.list',
		label: 'Membros',
		path: '/members',
		component: MemberList,
		exact: true,
		icon: 'people',
	},
];

export default routes;
