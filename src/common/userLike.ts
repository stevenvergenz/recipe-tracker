export interface UserLike {
	id: string;
	email: string;
	password: Buffer;
	salt: string;
	name: string;
	lastLogin: Date;
};
