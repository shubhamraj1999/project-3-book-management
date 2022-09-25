const bookModel = require("../models/bookModel");
const reviewModel = require("../models/reviewModel");
const userModel = require("../models/userModel");
const moment = require("moment");
const mongoose = require("mongoose");
const lodash = require("lodash");
const validator =require('../validator/validator')



//..............validation for number in String using Regex...............
const isNumberInString = function (data) {
    const isNumberInStringRegex = /^[a-zA-Z ]*$/;

    return isNumberInStringRegex.test(data);
}
//================================post api createBook===================================
const createbook = async function (req, res) {
    try {
        let data = req.body;

        if (Object.keys(data).length === 0) {
            return res.status(400).send({ status: false, msg: "request body is empty" })
        }

        data["releasedAt"] = moment(new Date()).format("YYYY-MM-DD");

        let { title, excerpt, userId, ISBN, category, subcategory } = data;

        let requiredFields = [
            "title",
            "excerpt",
            "userId",
            "ISBN",
            "category",
            "subcategory",
        ];
        for (field of requiredFields) {
            if (!req.body.hasOwnProperty(field)) {
                return res .status(400).send({ status: false, msg: `${field}==>is required` });
                }
        }

        if (!validator.isValid(title)) {
            return res.status(400).send({ status: false, msg: "title is invalid" });
        }

        let checktitle = await bookModel.findOne({ title: title });
        if (checktitle) {
            return res.status(400).send({ status: false, msg: `${title} => title is already reserved` });
            }

        if (!validator.isValid(excerpt)) {
            return res.status(400).send({ status: false, msg: "excerpt is invalid" });
        } else {
            excerpt = excerpt
                .trim()
                .split(" ")
                .filter((word) => word)
                .join(" ");
        }
        if (!validator.isValid(userId)) {
            return res.status(400).send({ status: false, msg: "userId is invalid" });
        }
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).send({status: false, msg: "UserId is not valid,please enter valid ID" });
                }

        let userbyid = await userModel.findById(userId);
        if (!userbyid) {
            return res .status(404).send({ status: false, msg: "this userId is not exists" });
            }

        //............................Authorisation.......................................  
        if (req.validToken.userId != userbyid._id.toString()) {
            return res .status(403).send({ status: false, message: "You are Not Authorised" });
            }

        if (!validator.isValid(ISBN)) {
            return res.status(400).send({ status: false, msg: "ISBN is invalid" });
        }
        let checkISBN = await bookModel.findOne({ ISBN: ISBN });
        if (checkISBN) {
            return res.status(400).send({ status: false,msg: `choose another ISBN number.${ISBN} is already exist` });
               }

        if (!validator.isValid(category)) {
            return res.status(400).send({ status: false, msg: "category is invalid" });
                }

        if (!validator.isValid(subcategory)) {
            return res.status(400).send({status: false, msg: "subcategory is invalid"});
                }


        //keys value validation can't use number in String
        let letters = ["title", "excerpt"];
        for (field of letters) {
            if (!isNumberInString(req.body[field])) {
                return res.status(400).send({ status: false, msg: `You can't use number in==>${field}`});
                   
                   
               
            }
        }



        let savedata = await bookModel.create(data);
        return res.status(201).send({ status: true, data: savedata });
    } catch (err) {
        res.status(500).send({ status: false, error: err.message });
    }
};


//=============================get api ByQuery=============================================
const getBookByQuery = async function (req, res) {
    try {
        let queryData = req.query;

        let bookDetails = await bookModel
            .find({ isDeleted: false, ...queryData })
            .select({
                _id: 1,
                title: 1,
                excerpt: 1,
                userId: 1,
                category: 1,
                releasedAt: 1,
                reviews: 1,
            });
        if (bookDetails.length == 0)
            return res.status(404).send({ status: true, message: "No book found with this details" });
                
                

        //validation for extra keys in  query params
        let extraKeys = ["userId", "category", "subcategory"];
        for (field in queryData) {
            if (!extraKeys.includes(field)) {
                return res.status(400).send({ status: false, msg: "this filter is not valid" });
                    
                    
            }
        }
        //sorting the title in alphabeical order with  the  help of lodash
        let sorted = lodash.sortBy(bookDetails, ["title"]);

        return res.status(200) .send({ status: true, message: "Books list", data: sorted });
            
           
    } catch (err) {
        return res.status(500).send({ status: false, msg: err.message });
    }
};



//========================get api  by path params=============================
const getBooksDetails = async function (req, res) {
    try {
        let bookId = req.params.bookId;
        let verifyBookId = await bookModel.findById(bookId);
        if (!verifyBookId) {
            return res.status(404) .send({ status: false, msg: "Books not found with this details" });
                
               
        }

        const reviews = await reviewModel
            .find({ bookId: verifyBookId._id, isDeleted: false })
            .select({
                _id: 1,
                bookId: 1,
                reviewedBy: 1,
                reviewedAt: 1,
                rating: 1,
                review: 1,
            });

        const data = verifyBookId.toObject();
        data["reviewsData"] = reviews;

        return res.status(200) .send({ status: true, message: "Books List", data: data });
            
           
    } catch (error) {
        return res.status(500).send({ status: false, msg: error.message });
    }
};


//=============================put api updateBook============================================
const updatebook = async function (req, res) {
    try {
        let bookId = req.params.bookId;
        if (!mongoose.Types.ObjectId.isValid(bookId)) {
            return res.status(400).send({status: false, msg: "BookId is not valid,please enter valid ID"});
                
               
            
        }

        let book = await bookModel.findOne({ _id: bookId, isDeleted: false });
        if (!book) {
            return res.status(404) .send({ status: false, msg: "Book is not found for this ID" });
                
               
        }
        //...................Authorisation.........................................
        if (req.validToken.userId !== book.userId.toString()) {
            return res.status(403).send({status: false, msg: "you are not authorised for this operation"});
                
               
            
        }

        let data = req.body;
        if (data.title) {
            let uniquetitle = await bookModel.findOne({ title: data.title });
            if (uniquetitle) {
                return res.status(404) .send({ status: false, msg: "this title is already reserved" });
                    
                   
            }
        }
        if (data.ISBN) {
            let uniqueISBN = await bookModel.findOne({ ISBN: data.ISBN });
            if (uniqueISBN) {
                return res.status(404).send({ status: false, msg: "this ISBN Number is already reserved" });
                    
                    
            }
        }
        //.................checking if the value is empty string or not...........................
        if (!validator.isValid.data.title ) {
            return res .status(400).send({ status: false, msg: "book title value is empty" });
               
                
        }
        if (!validator.isValid.data.excerpt) {
            return res.status(400).send({ status: false, msg: "book excerpt value is empty" });
                
                
        }

        if (!validator.isValid.data.ISBN) {
            return res  .status(400).send({ status: false, msg: "book ISBN Number field is empty" });
              
                
        }
        //..........................updating the bookdocument....................................
        let updatedbook = await bookModel.findByIdAndUpdate(
            { _id: bookId },
            {
                $set: {
                    title: data.title,
                    ISBN: data.ISBN,
                    excerpt: data.excerpt,
                    releasedAt: moment(new Date()).format("YYYY-MM-DD"),
                },
            },
            { new: true }
        );
        return res.status(200).send({ status: true, message: "Success", data: updatedbook });
            
            
    } catch (error) {
        return res.status(500).send({ status: false, msg: error.message });
    }
};


//==========================delete api ==========================================

const deleteBook = async function (req, res) {
    let data = req.params.bookId;

    if (!mongoose.Types.ObjectId.isValid(data)) {
        return res.status(400).send({ status: false, msg: "BookId is incorrect" });
    }

    let verifyId = await bookModel.findById(data);

    if (!verifyId) {
        return res.status(404).send({ status: false, msg: "books not found " });
    }

    if (verifyId.isDeleted === true) {
        return res.status(400).send({ status: false, msg: "this book is already deleted" });
            
            
    }
    //.............................Authorisation....................................
    if (req.validToken.userId != verifyId.userId) {
        return res .status(403).send({ status: false, message: "You are Not Authorised" });
           
            
    }

    let deleteDocument = await bookModel.findOneAndUpdate(
        { _id: data },
        {
            $set: {
                isDeleted: true,
                deletedAt: new Date(),
            },
        }
    );
    return res.status(200) .send({ status: true, msg: "book is successfully deleted" });
        
       
};


module.exports = {
    createbook,
    getBooksDetails,
    getBookByQuery,
    updatebook,
    deleteBook,
};