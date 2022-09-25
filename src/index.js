const express = require('express')
const bodyParser = require('body-parser')
const router = require('./router/route')
const mongoose = require('mongoose')
const app = express();
app.use(bodyParser.json())


mongoose.connect("mongodb+srv://shubham7568:OtxVqtbXl5mQZXTu@cluster0.nwhblol.mongodb.net/group-55db",{

  useNewUrlParser : true
})

.then(()=> console.log("mongoDb is connected"))
.catch(err=> console.log(err))

app.use('/',router)

app.listen(process.env.PORT || 3000,function(){

    console.log("express app running on port" + (process.env.PORT||3000))
})