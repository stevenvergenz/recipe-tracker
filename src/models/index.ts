export * from './dbModel';
export * from './userModel';
export * from './recipeModel';
export * from './recipeTagsModel';

import { Pool } from 'pg';
export const dbPool = new Pool();
