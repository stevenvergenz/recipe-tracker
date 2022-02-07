import { ClientBase } from 'pg';

/**
 * Base class for all database models
 */
export interface DatabaseModel {
	create(client: ClientBase): Promise<void>;
	read(client: ClientBase): Promise<void>;
	update(client: ClientBase): Promise<void>;
	delete(client: ClientBase): Promise<void>;
}
