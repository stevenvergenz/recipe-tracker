export interface UserLike
{
	id: number;
	email: string;
	name: string;
	created_on: Date;
	last_login: Date;
}

export interface PrivateUserLike extends UserLike
{
	password: Buffer;
	salt: string;
}
