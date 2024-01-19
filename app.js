import express from "express";
import { client } from "./utils/db.js";
import questionsRouter from "./apps/questions.js";
import answersRouter from "./apps/answers.js";

async function init() {
  await client.connect();
  const app = express();
  const port = 4000;

  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  app.use("/questions", questionsRouter);
  app.use("/answers", answersRouter);

  app.get("/", (req, res) => {
    return res.json("Hello Skill Checkpoint #2");
  });

  app.get("*", (req, res) => {
    return res.status(404).json("Not found");
  });

  app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
  });
}

init();