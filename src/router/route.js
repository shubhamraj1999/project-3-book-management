const express = require('express')
const router = express.Router()
const registerUser = require("../controllers/userController")
const authentication = require('../middleware/auth')
const book =require('../controllers/bookcontroller')
const  review =require('../controllers/reviewController')

/////////////FOR CREATING USER////////////////
router.post('/register',registerUser.createUserDocument)

///////////FOR LOGIN USER///////////////////
router.post('/login',registerUser.loginUser)

//////////FOR CREATING BOOK//////////////
router.post('/books',authentication.auth,book.createbook)

/////////for getting book details by query///////////
router.get('/books' ,book.getBookByQuery)

///////////for getting details by param////////
router.get('/books/:bookId',book.getBooksDetails)

///////////for updating books////////
router.put('/books/:bookId',book.updatebook)

/////////// for deleting books//////////
router.delete('/books/:booksId',book.deleteBook)

/////////////////for create review////////////
router.post('/books/:bookId/review',review.createreview)

/////////for update review//////////////
router.put('/books/:bookId/review/:reviewId', review.updateReview)

////////////for delete review////////////
router.delete('/books/:bookId/review/:reviewId',review.deleteReviewsById)



module.exports = router;