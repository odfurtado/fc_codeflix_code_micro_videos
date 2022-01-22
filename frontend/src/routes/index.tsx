import { RouteProps } from 'react-router-dom';
import Dashboard from '../pages/Dashboard';
import CategoryList from '../pages/category/PageList';
import CategoryForm from '../pages/category/PageForm';
import GenreList from '../pages/genre/PageList';
import GenreForm from '../pages/genre/PageForm';
import MemberList from '../pages/member/PageList';
import MemberForm from '../pages/member/PageForm';

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
		component: CategoryForm,
		exact: true,
	},
	{
		name: 'categories.edit',
		label: 'Editar Categoria',
		path: '/categories/:id/edit',
		component: CategoryForm,
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
		component: GenreForm,
		exact: true,
	},
	{
		name: 'genres.edit',
		label: 'Editar Gênero',
		path: '/genres/:id/edit',
		component: GenreForm,
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
		component: MemberForm,
		exact: true,
	},
	{
		name: 'members.edit',
		label: 'Editar Membro',
		path: '/members/:id/edit',
		component: MemberForm,
		exact: true,
	},
];

export default routes;
