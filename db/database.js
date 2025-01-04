
const mongoose = require("mongoose");
require("dotenv").config();

const { MONGODB_URL } = process.env;

console.log("MongoDB URL:", MONGODB_URL);

exports.connect = () => {
	mongoose.connect(MONGODB_URL)
		.then(() => console.log(`✅ DB Connection Success`))
		.catch((err) => {
			console.error(`❌ DB Connection Failed`);
			console.error(err);
			process.exit(1);
		});
};
