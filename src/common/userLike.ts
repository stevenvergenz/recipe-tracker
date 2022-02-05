export interface UserLike
{
	id: number;
	email: string;
	name: string;
	createdOn: Date;
	lastLogin: Date;
}

export interface PrivateUserLike extends UserLike
{
	password: Buffer;
	salt: string;
}
