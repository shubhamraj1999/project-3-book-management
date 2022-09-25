const jwt = require('jsonwebtoken')


const auth = async function (req, res, next) {
    try {
        const token = req.headers["x-auth-key"];
        if (!token)
            return res
                .status(401)
                .send({ status: false, msg: "Please provide token" });
        //........................verifying the token through Jwt..............................
        let validToken = jwt.verify(
            token,
            "GroupNo55",
            function (error, token) {
                if (error) {
                    return undefined;
                } else {
                    return token;
                }
            }
        );
        if (validToken == undefined) {
            return res
                .status(401)
                .send({ status: false, msg: "please provide valid token in headers" });
        }

        // Passing the decoded token inside req to acces it in controllers for authorisation.

        req.validToken = validToken;

        next();
    } catch (error) {
        return res.status(500).send({ status: false, msg: error.message });
    }
};

module.exports.auth = auth;