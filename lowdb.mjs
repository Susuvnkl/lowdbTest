import { JSONPreset } from "lowdb/node";

// Define the default data structure
const defaultData = { users: [] };
const lowdb = await JSONPreset("lowdb.json", defaultData);

await lowdb.write();

export default lowdb;
