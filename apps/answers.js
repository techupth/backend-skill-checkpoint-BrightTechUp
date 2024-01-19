import { Router } from "express";
import { ObjectId } from "mongodb";
import { db } from "../utils/db.js";

const answersRouter = Router();

answersRouter.get("/:questionId", async (req, res) => {
  try {
    const questionId = new ObjectId(req.params.questionId);
    const collection = db.collection("answers");
    const queryResult = await collection
      .find({ questionId: questionId })
      .toArray();

    return res.json({
      data: queryResult,
    });
  } catch (error) {
    console.log(error);
    if (
      error.message ===
      "Argument passed in must be a string of 12 bytes or a string of 24 hex characters or an integer"
    ) {
      return res.status(400).json({
        message: "Invaild question ID format",
      });
    } else {
      return res.status(500).json({
        message: "An error occurred while processing your request",
      });
    }
  }
});

answersRouter.post("/", async (req, res) => {
  try {
    const questionId = new ObjectId(req.body.questionId);
    const collectionQuestion = db.collection("questions");
    const fondquestionResult = await collectionQuestion.findOne({
      _id: questionId,
    });

    if (!fondquestionResult) {
      return res.status(400).json({
        message: "Invalid question ID: question not found",
      });
    }

    const answer = req.body.answer;
    if (!answer) {
      return res.status(400).json({
        message: "Invalid answer: empty answer",
      });
    } else if (answer.length > 300) {
      return res.status(400).json({
        message: "Invalid answer: answer exceeds 300 characters",
      });
    }

    const newAnswer = {
      questionId: questionId,
      answer: answer,
      agree: 0,
      created_at: new Date(),
    };

    const collectionAnswer = db.collection("answers");
    await collectionAnswer.insertOne(newAnswer);

    return res.json({
      message: "Answer has been create successfully",
    });
  } catch (error) {
    console.log(error);
    if (
      error.message ===
      "Argument passed in must be a string of 12 bytes or a string of 24 hex characters or an integer"
    ) {
      return res.status(400).json({
        message: "Invaild question ID format",
      });
    } else {
      return res.status(500).json({
        message: "An error occurred while processing your request",
      });
    }
  }
});

answersRouter.put("/:answerId/agree/:action", async (req, res) => {
  try {
    const answerId = new ObjectId(req.params.answerId);
    const action = req.params.action;

    if (action !== "increase" && action !== "decrease") {
      return res.status(400).json({
        message: "Invaild action : Vaild action are 'increase' or 'decrease'",
      });
    }

    const collectionAnswer = db.collection("answers");
    const updateQuery = { _id: answerId };
    const updateAction =
      action === "increase"
        ? { $inc: { agree: 1 }, $set: { updated_at: new Date() } }
        : { $inc: { agree: -1 }, $set: { updated_at: new Date() } };

    const updateResult = await collectionAnswer.updateOne(
      updateQuery,
      updateAction
    );

    if (updateResult.modifiedCount === 0) {
      return res.status(404).json({
        message: "Answer not found",
      });
    }

    return res.json({
      message: `Agree count of answer ${answerId} has been ${action}d successfully`,
    });
  } catch (error) {
    console.log(error);
    if (
      error.message ===
      "Argument passed in must be a string of 12 bytes or a string of 24 hex characters or an integer"
    ) {
      return res.status(400).json({
        message: "Invaild answer ID format",
      });
    } else {
      return res.status(500).json({
        message: "An error occurred while processing your request",
      });
    }
  }
});

export default answersRouter;