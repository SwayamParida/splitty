import { Schema, Document, model } from "mongoose";
import { Money } from "ts-money";
import { Relationship } from "./relationship";
import { User } from "./user";

export interface Transaction extends Document {
	relationship: Relationship,
	debtor: User,
	creditor: User,
	poster: User,
	amount: Money,
	dateTransacted: Date,
	dateAdded: Date,
	dateLastEdited: Date,
	memo?: string
}

export const transactionSchema = new Schema<Transaction>({
	relationship: { type: Schema.Types.ObjectId, ref: "Relationship", required: true },
	debtor: { type: Schema.Types.ObjectId, ref: "User", required: true },
	creditor: { type: Schema.Types.ObjectId, ref: "User", required: true },
	poster: { type: Schema.Types.ObjectId, ref: "User", required: true },
	amount: { type: Schema.Types.Mixed, required: true },
	dateTransacted: { type: Schema.Types.Date, required: true },
	dateAdded: { type: Schema.Types.Date, required: true },
	dateLastEdited: { type: Schema.Types.Date, required: true },
	memo: String
});

const TransactionModel = model<Transaction>("Transaction", transactionSchema);
export default TransactionModel;