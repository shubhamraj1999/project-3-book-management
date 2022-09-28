const jwt = require('jsonwebtoken')



const auth = async function (req, res, next) {
    try {
        const token = req.headers["x-api-key"];
        if (!token)
            return res.status(401).send({ status: false, msg: "Please provide token" });
                
                
        //........................verifying the token through Jwt..............................
        let validToken = jwt.verify(token,"GroupNo51",(err,decode)=>
        {
            if(err){
                return res.status(400).send({status:false,message:'token is not correct'})
            }
            req.decode=decode
            next()
        });
        
    } catch (error) {
        return res.status(500).send({ status: false, msg: error.message });
    }
};

module.exports.auth = auth;