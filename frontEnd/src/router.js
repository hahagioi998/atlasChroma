//Central Router File

//Dependencies
import React, { Component } from 'react';
import { hot } from "react-hot-loader";
import localSession from './Components/sessionComponent';
import PreLoginRouter from './Components/prelogin/preLoginRouter';
import PostLoginRouter from './Containers/postlogin/postLoginRouter';

export default class Router extends Component {

    constructor(props){
        super(props);
    }

   checkSession() {
        let sessionObject = localSession.getSessionObject();

        let sessionExists = sessionObject != undefined && sessionObject.sessionID != undefined && sessionObject.creationTime != undefined ? true : false;
        if (sessionExists) {
            sessionExists = this.checkSessionTime(sessionObject);
        }
        return sessionExists;
    }

    rerenderRoot (){
        this.forceUpdate();
    }

    checkSessionTime(sessionObject) {
        let sessionBool = false;
        sessionBool = Date.now() - sessionObject.creationTime < 1800000 ? true : false;
        if (!sessionBool)
            window.localStorage.clear();
        return sessionBool;
    }

    render(){
        let router = this.checkSession() ? <PostLoginRouter rerenderRouter = {this.rerenderRoot}/> 
                                            : 
                                           < PreLoginRouter rerenderRouter = {this.rerenderRoot}/> ;
        return ( <div> { router } </div>);
    }
}
