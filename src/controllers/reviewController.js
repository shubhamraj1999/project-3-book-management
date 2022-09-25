const reviewModel = require("../models/reviewModel");
const bookModel = require("../models/bookModel");
const mongoose = require("mongoose");
const validator = require('../validator/validator')



//==============================post api createReview====================================
const createreview = async function (req, res) {
    try {
        let bookId = req.params.bookId;
        let data = req.body;

        data["reviewedAt"] = new Date();

        let requiredFields = ["review", "rating", "reviewedBy"];
        for (field of requiredFields) {
            if (!req.body.hasOwnProperty(field))
                // checking if the given key is present or not
                return res.status(400).send({ status: false, msg: `Please provide ${field}` });
        }

        for (field of requiredFields) {
            if (!validator.isValid(req.body[field])) {
                return res.status(400).send({ status: false, msg: `this ${field} key is invalid` });
            }
        }

        let ratingpattern = /^[1-5]$/;
        if (!validator.isValid(data)) {
            return res.status(400).send({ status: false, msg: "You have not provided any data" });
        }

        if (!mongoose.Types.ObjectId.isValid(bookId)) {
            return res.status(400).send({ status: false, msg: "bookId is not valid,please enter valid ID" });
        }

        let book = await bookModel.findOne({ _id: bookId, isDeleted: false });
        if (!book) {
            return res.status(404).send({ status: false, msg: "Book is not available for this ID" });
        }
        else {
            data.bookId = bookId;
        }

        if (!ratingpattern.test(data.rating)) {
            return res.status(400).send({ status: false, msg: "Enter rating only between 1 to 5" });
        }

        let savedData = await reviewModel.create(data);
        let updateBook = await bookModel.findOneAndUpdate(
            { _id: bookId },
            { $inc: { reviews: +1 } },
            { new: true }
        );

        let bookDetails = updateBook.toObject();
        bookDetails["review"] = savedData;

        return res.status(201).send({ status: true, data: bookDetails });
    } catch (error) {
        return res.status(500).send({ status: false, error: error.message });
    }
};


//===============================put api update Review========================================
const updateReview = async function (req, res) {
    try {
        let bookId = req.params.bookId;
        let reviewId = req.params.reviewId;
        let updatetheReview = req.body;

        if (Object.keys(req.body).length === 0) {
            return res.status(400).send({ status: false, msg: "request body is empty" });
        }


        if (req.body.reviewedBy) {
            if (!/^[a-zA-Z\s]+$/.test(req.body.reviewedBy))
                return res.status(400).send({ status: false, message: "Please provide name in alphabets :)" });
        }

        if (req.body.rating) {
            if (!/^[12345]$/.test(req.body.rating))
                return res.status(400).send({ status: false, message: "Please give ratings between 1-5 " });
        }

        if (req.body.review) {
            if (typeof req.body.review !== "string")
                return res.status(400).send({ status: false, message: "Please give review in correct format " });
        }

        let verifyBookId = await bookModel
            .findOne({ _id: bookId, isDeleted: false })
            .select({ createdAt: 0, updatedAt: 0, __v: 0 });
        if (!verifyBookId) {
            return res.status(404).send({ status: false, msg: "book does not exits" });
        }

        let verifyReviewId = await reviewModel.findOne({
            _id: reviewId,
            isDeleted: false,
        });
        if (!verifyReviewId) {
            return res.status(404).send({ status: false, msg: "review does not exits" });
        }

        if (verifyReviewId.bookId != bookId) {
            return res.status(404).send({ status: false, message: "Review not found for this book" });
        }

        if (verifyBookId.isDeleted == false) {
            let updateReviewDetails = await reviewModel.findOneAndUpdate(
                { _id: verifyReviewId._id },
                {
                    $set: {
                        review: updatetheReview.review,
                        rating: updatetheReview.rating,
                        reviewedBy: updatetheReview.reviewedBy,
                    },
                },
                { new: true }
            );

            let newData = verifyBookId.toObject();
            newData["reviewsData"] = updateReviewDetails;
            return res.status(200).send({ status: true, message: "Successfully updated the review of the book.", data: newData });
        }


    } catch (error) {
        return res.status(500).send({ status: false, msg: error.message });
    }
};
//==============================deleteapi delete Review=======================================
const deleteReviewsById = async function (req, res) {
    try {
        let bookId = req.params.bookId;
        let reviewId = req.params.reviewId;
        if (!mongoose.Types.ObjectId.isValid(bookId)) {
            return res.status(400).send({ status: false, msg: "BookId is not valid,please enter valid ID" });
        }

        let book = await bookModel.findOne({ _id: bookId, isDeleted: false });
        if (!book) {
            return res.status(404).send({ status: false, msg: "Book is not found for this ID" });
        }

        if (!mongoose.Types.ObjectId.isValid(reviewId)) {
            return res.status(400).send({ status: false, msg: "reviewId is not valid,please enter valid ID" });
        }

        let review = await reviewModel.findOne({ _id: reviewId, isDeleted: false });
        if (!review) {
            return res.status(404).send({ status: false, msg: "review is not found for this ID" });
        }

        if (review.bookId.toString() !== bookId) {
            return res.status(404).send({ status: false, message: "Review not found for this book" });
        }

        if (review.isDeleted === true) {
            return res.status(400).send({ status: false, msg: "this review Document is already deleted" });
        }

        await reviewModel.findOneAndUpdate(
            { _id: reviewId },
            { $set: { isDeleted: true } }
        );
        await bookModel.findOneAndUpdate(
            { _id: bookId },
            { $inc: { reviews: -1 } }
        );

        return res
            .status(200)
            .send({ status: true, message: "Review document is deleted successfully" });
    } catch (err) {
        return res.status(500).send({ status: false, message: err.message });
    }
};


module.exports = { createreview, updateReview, deleteReviewsById };