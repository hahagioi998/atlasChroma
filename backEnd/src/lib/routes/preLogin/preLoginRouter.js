//Dependencies
const loginHandler = require("./Handlers/loginHandler");
const signupHandler = require("./Handlers/signupHandler");
const googleAuthHandler = require("./Handlers/googleAuthHandler");
const responseObject = require("../../classObjects/responseClass");


//defining the module
const preLoginRouter = {};

//params --> route -- string, requestObject -- object
//returns --> promise(object)
preLoginRouter.router = (route,requestObject) = new Promise((resolve,reject) => {

    let chosenHandler = preLoginRouter.routes.hasOwnProperty(route) ? preLoginRouter.routes.handlers[route] : preLoginRouter.routes.handlers.notFound;
    chosenHandler(requestObject).then(resolvedResult => {
        let response = new responseObject(resolvedResult.STATUS,resolvedResult.SMSG,resolvedResult.PAYLOAD,MSG.EMSG.NOERROR);
        resolve(response.getResponseObject());
    }).catch(rejectedResult => {
        let response = new responseObject(rejectedResult.STATUS,MSG.SMSG.NOSUCCESS,{},rejectedResult.EMSG);
        reject(response.getResponseObject());
    });

});

//prelogin routes
preLoginRouter.routes = {
    "/login": loginHandler.login,
    "/signup": signupHandler.signup,
    "/signup/userAvaliablity": signupHandler.userAvaliability,
    "/signup/postSignupDetails": signupHandler.postSignupDetails,
    "/googleAuth": googleAuthHandler.googleAuth, 
    "/googleAuth/postAuth": googleAuthHandler.postAuth,
    "/googleAuth/postAuthDetails": googleAuthHandler.postAuthDetails,
    "notFound": centralHandler.notFound
};

//export the module
module.exports = preLoginRouter;
