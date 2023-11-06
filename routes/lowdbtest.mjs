import express from "express";
import lowdb from "../lowdb.mjs";

const router = express.Router();

router.get("/test", async (req, res, next) => {
  try {
    // await createDB(); // Invoke the createDB function
    lowdb.data.posts.push("yes");
    await lowdb.write();
    console.log("Database created and updated successfully");
    res.send("Database created and updated successfully");
  } catch (error) {
    console.error("Error creating/updating the database:", error);
    res.status(500).send("Error creating/updating the database");
  }
});

export default router;
