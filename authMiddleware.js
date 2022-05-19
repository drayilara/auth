const { sendStatus } = require("express/lib/response");

const isAuth = (req,res,next) => {
    if(req.isAuthenticated()){
        return next();
    }

    res.sendStatus(401);
}

module.exports = isAuth;