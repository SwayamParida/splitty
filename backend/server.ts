// Library imports
import express, { Express, Request, Response } from "express";
import { connect } from "mongoose";

// Application models
import UserModel, { User } from "./models/user.ts";
import RelationshipModel, { Relationship } from "./models/relationship.ts";

// DB connection details
const port: number = 9000;
const db_connection_string: string = "mongodb+srv://splitty.qqepqpo.mongodb.net/splitty?authSource=%24external&authMechanism=MONGODB-X509&retryWrites=true&w=majority";
const db_connection_credentials: string = "config/mongodb_user_cert.pem";

// Express configuration
const app: Express = express();
app.use(express.json());

app.get("/users", async (req: Request, res: Response) => {
	const users: User[] = await UserModel.find({});
	res.status(200).send(users);
});

app.post("/users", async (req: Request, res: Response) => {
	try {
		let newUser: User = new UserModel(req.body);
		newUser = await newUser.save();
		res.status(201).send({userId: newUser._id});
	} 
	catch (error) {
		console.error(error);
		res.status(400).send(error);
	}
});

app.post("/users/:userId/friends/:friendUserId", async (req: Request, res: Response) => {
	try {
		const { userId, friendUserId } = req.params;
		// Validate that both users exist
		const userA: User | null = await UserModel.findById(userId).exec();
		const userB: User | null = await UserModel.findById(friendUserId).exec();
		if (!userA || !userB)
			res.status(400).send("User IDs specified are invalid");

		// Record relationship in DB
		const newRelationship: Relationship = new RelationshipModel({
			friendA: userA?._id,
			friendB: userB?._id
		});
		await newRelationship.save();
		res.status(201).send();
	} catch (error) {
		console.error(error);
		res.status(400).send(error);
	}
});

// Initialize DB connection and Express server
connect(db_connection_string, {tlsCertificateKeyFile: db_connection_credentials})
	.then(
		() => {
			app.listen(port, () => {
				console.log(`Splitty REST API available on port ${port}`);
			});
		},
		(reason) => {
			console.error(reason);
		}
	);