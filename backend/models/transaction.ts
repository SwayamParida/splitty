import { Schema, Document, Model, model } from "mongoose";
import { Money } from "ts-money";
import { Relationship } from "./relationship.ts";
import { User } from "./user.ts";

interface TransactionAttributes {
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
export interface Transaction extends TransactionAttributes, Document { }
interface TransactionStatics extends Model<Transaction> { }

export const transactionSchema = new Schema<Transaction>({
	relationship: { type: Schema.Types.ObjectId, ref: "Relationship", required: true },
	debtor: { type: Schema.Types.ObjectId, ref: "User", required: true },
	creditor: { type: Schema.Types.ObjectId, ref: "User", required: true },
	poster: { type: Schema.Types.ObjectId, ref: "User", required: true },
	// Emulating ts-money Money interface
	amount: { 
		type: Schema.Types.Mixed,
		required: true,
		get: (obj: Money) => new Money(obj.amount, obj.currency)
	},
	dateTransacted: { type: Schema.Types.Date, required: true },
	dateAdded: { type: Schema.Types.Date, required: true },
	dateLastEdited: { type: Schema.Types.Date, required: true },
	memo: String
});

const TransactionModel = model<Transaction, TransactionStatics>("Transaction", transactionSchema);
export default TransactionModel;