export * from './dbModel';
export * from './user';
export * from './recipe';
export * from './recipeTags';

import { Pool } from 'pg';
export const dbPool = new Pool();
