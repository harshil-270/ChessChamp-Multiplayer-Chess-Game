const jwt = require('jsonwebtoken') ;

const userAuth = (req, res, next) => {
    const token = req.header('token');
    if(!token) {
        return res.status(401).json({error: 'No Auth token. Access denied'}) ;
    }
    const verified = jwt.verify(token, process.env.JWT_SECRET) ;
    if(!verified) {
        return res.status(401).json({error: 'Token is not valid. access denied'}) ;
    }
    req.user = verified.id;
    next();
}

module.exports = userAuth;