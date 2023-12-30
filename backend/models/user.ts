import { Schema, Document, model } from "mongoose";

export interface User extends Document {
	name: string,
	email: string
	phone_number?: string,
}

export const userSchema = new Schema<User>({
	name: { type: String, required: true },
	email: { type: String, required: true },
	phone_number: String
});

const UserModel = model<User>("User", userSchema);
export default UserModel;