import { Router } from "express";
import { ObjectId } from "mongodb";
import { db } from "../utils/db.js";

const questionsRouter = Router();

questionsRouter.get("/", async (req, res) => {
  try {
    const categories = req.query.categories;
    const keywords = req.query.keywords;
    const queryObject = {};
    if (categories) {
      queryObject.categories = new RegExp(categories, "i");
    }
    if (keywords) {
      queryObject.title = new RegExp(keywords, "i");
    }
    const collection = db.collection("questions");
    const questinons = await collection
    .find(queryObject)
    .toArray();
    return res.json({ data: questinons });
  } catch (error) {
    return res.status(500).json({
      message: "An error occurred while processing your request",
    });
  }
});

questionsRouter.get("/:questionId", async (req, res) => {
    try {
      const collection = db.collection("questions");
      const questionId = new ObjectId(req.params.questionId);
  
      const question = await collection.findOne({ _id: questionId });
  
      if (!question) {
        return res.status(404).json({
          message: "Question not found",
        });
      }
  
      return res.json({
        data: question,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        message: error,
      });
    }
  });

questionsRouter.post("/", async (req, res) => {
  try {
    const newQuestion = { ...req.body, created_at: new Date() };
    const collection = db.collection("questions");
    await collection.insertOne(newQuestion);
    return res.json({
      message: "Question has been created successfully",
      data: newQuestion,
    });
  } catch (error) {
    return res.status(500).json({
      message: "An error occurred while processing your request",
    });
  }
});

questionsRouter.put("/:questionId", async (req, res) => {
  try {
    const questionId = new ObjectId(req.params.questionId);
    const updateQuestion = { ...req.body, update_at: new Date() };
    const collection = db.collection("questions");
    const updateResult = await collection.updateOne(
      { _id: questionId },
      { $set: updateQuestion }
    );
    console.log(updateResult);
    if (updateResult.modifiedCount === 1) {
      return res.json({
        message: "Question has been updated successfully",
      });
    } else {
      return res.status(404).json({ message: "Question not found" });
    }
  } catch (error) {
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

questionsRouter.delete("/:questionId", async (req, res) => {
  try {
    const questionId = new ObjectId(req.params.questionId);
    const collectionQuestion = db.collection("questions");
    const deleteQuestionResult = await collectionQuestion.deleteOne({
      _id: questionId,
    });

    const collectionAnswer = db.collection("answers");
    const deleteAnswersResult = await collectionAnswer.deleteMany({
      questionId: questionId,
    });
    if (deleteQuestionResult.deletedCount === 1) {
      return res.json({ message: "Question has been deleted successfully" });
    } else {
      return res.status(404).json({ message: "Question not found" });
    }
  } catch (error) {
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

export default questionsRouter;