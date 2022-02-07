import { UserLike } from ".";

export interface RecipePreview
{
	id: number;
	name: string;
	tags: string[];
}

export interface RecipeLike extends RecipePreview
{
	owner_id: number;
	owner?: UserLike;
	body: string;
	thumbnail_id: string;
	created_on: Date;
	updated_on: Date;
}
