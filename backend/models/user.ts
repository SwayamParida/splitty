import { strict as assert } from "assert";
import { Schema, Document, model } from "mongoose";
import RelationshipModel from "./relationship.ts";

// TypeScript interfaces
interface UserAttributes {
	name: string,
	email: string
	phoneNumber?: string,
}
export interface User extends UserAttributes, Document {
	getFriends(): Promise<User[]>
}

// Schema properties
const userSchema = new Schema<User>({
	name: { type: String, required: true },
	email: { type: String, required: true },
	phoneNumber: String
});

// Schema methods
userSchema.methods.getFriends = async function(): Promise<User[]> {
	const aFriendships = await RelationshipModel
		.find({friendA: this._id})
		.select("-_id friendB")
		.populate("friendB", "-__v");
	const bFriendships = await RelationshipModel
		.find({friendB: this._id})
		.select("-_id friendA")
		.populate("friendA");
	const friendships = aFriendships.concat(bFriendships);
	return friendships.map((friendship): User => {
		assert(friendship.friendA || friendship.friendB);
		return friendship.friendA ? friendship.friendA : friendship.friendB;
	});
};

const UserModel = model<User>("User", userSchema);
export default UserModel;