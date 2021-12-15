import { RouteProps } from 'react-router-dom';
import Dashboard from '../pages/Dashboard';
import CategoryList from '../pages/category/PageList';
import CategoryCreate from '../pages/category/PageForm';
import GenreList from '../pages/genre/PageList';
import GenreCreate from '../pages/genre/PageForm';
import MemberList from '../pages/member/PageList';
import MemberCreate from '../pages/member/PageForm';

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
	{
		name: 'categories.create',
		label: 'Criar Categoria',
		path: '/categories/create',
		component: CategoryCreate,
		exact: true,
	},
	{
		name: 'genres.list',
		label: 'Gêneros',
		path: '/genres',
		component: GenreList,
		exact: true,
		icon: 'movie_filter',
	},
	{
		name: 'genres.create',
		label: 'Criar Gênero',
		path: '/genres/create',
		component: GenreCreate,
		exact: true,
	},
	{
		name: 'members.list',
		label: 'Membros',
		path: '/members',
		component: MemberList,
		exact: true,
		icon: 'people',
	},
	{
		name: 'members.create',
		label: 'Criar Membro',
		path: '/members/create',
		component: MemberCreate,
		exact: true,
	},
];

export default routes;
