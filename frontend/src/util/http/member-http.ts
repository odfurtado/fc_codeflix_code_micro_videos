import { httpVideo } from '.';
import HttpResource from './http-resource';

const memberHttp = new HttpResource(httpVideo, 'cast_members');

export default memberHttp;
