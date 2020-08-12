//Dependencies
import React, { Component } from 'react';
import { connect } from 'react-redux';

import httpsMiddleware from '../../middleware/httpsMiddleware';
import cookieManager from '../../Components/cookieManager';
import DashBoard from './dashboard';
import KanbanBoard from './kanbanBoard/kanbanBoard';
import Projects from './projects/projects';
import Highlight from './highlight';
import Scheduler from './calender/scheduler';
import Menu from '../../Menu/menu';
import Profile from './profile';
import clientSocket from 'socket.io-client';
import setMsgAction from '../../store/actions/msgActions';
import menuConstants from '../../Menu/menuConstants';
import {msgObject} from '../../../../lib/constants/storeConstants';
import LoadingComponent from '../generalContainers/loadingComponent';
import setUserAction from '../../store/actions/userActions';
import {urls} from "../../../../lib/constants/contants";
import listener from '../generalContainers/asyncListener';
import MessageBox from "../postlogin/messaging/messageBox";
import {userList,userObject} from "../../../../lib/constants/storeConstants";
import setSocketObject from "../../store/actions/socketActions";

class PostLoginRouter extends Component {

    constructor(props){
        super(props);
        this.getUserData = this.getUserData.bind(this);
        this.containerSelector = this.containerSelector.bind(this);
    }

    componentDidMount(){ 
        //setting up io instance in redux store
        let io = clientSocket('https://localhost:5000',{transports: ['websocket']});
        this.props.setSocketState(io); 
        listener.listenEvents(io);

        //connect to server socket
       io.on("connect",() => {console.log("socket connected to server");});
       let userID = cookieManager.getUserSessionDetails();
       io.emit('login',userID);

        let queryString = "";
        if(userID){
            let cookieDetails = {"CookieID" : userID};
            this.getUserData(cookieDetails,queryString);
            queryString+="&userID="+userID;
            this.getUserData(cookieDetails,queryString);
        }else{
            window.history.pushState({}, "",urls.LANDING);
        }
    }

    getUserData(headers,queryString){ 
        let globalThis = this;
        httpsMiddleware.httpsRequest(urls.USER,"GET", headers, queryString,function(error,responseObject) {
            if(error || (responseObject.STATUS != 200 && responseObject.STATUS != 201)){
                let errorObject = {...msgObject};
                if(error){
                    errorObject.msg = error;
                    errorObject.status = "ERROR";
                    globalThis.props.setMsgState(errorObject);
                }else{
                    errorObject.msg = responseObject.EMSG;
                    errorObject.status = "ERROR";
                    globalThis.props.setMsgState(errorObject);
                }
                cookieManager.clearUserSession(); 
                window.history.pushState({}, "",urls.LANDING);
            }else{
                queryString != "" && globalThis.props.setUserState({...responseObject.PAYLOAD});
            }
        });
    }

    //Router
    containerSelector() {
      if(JSON.stringify(this.props.user) != JSON.stringify(userObject) || JSON.stringify(this.props.userList) != JSON.stringify(userList) ){
        let boardRegex = new RegExp(/projects\/[a-z0-9]+$/g);
        let schedulerRegex = new RegExp(/scheduler\/[0-9]+$/g);
        let path = window.location.pathname.substring(1).toLowerCase();
        if(!/[a-z]+\/[a-z|0-9]+/g.test(path)){
            if (/[a-z]+\//g.test(path)) {
                window.history.replaceState({}, "", "/" + path.substring(0, path.length - 1));
            } else {
                switch (path) {
                    case "dashboard":
                        return <DashBoard/>;
                        break;
                    case "projects":
                        return <Projects/>;
                        break;
                    case "scheduler":
                        return <Scheduler/>;
                        break;
                    case "profile":
                        return <Profile/>;
                        break;                        
                    case "logout":
                        listener.unsubscribe();
                        this.props.io.emit("terminate",{cookieID : cookieManager.getUserSessionDetails(), username : this.props.user.username});
                        cookieManager.clearUserSession();
                        window.history.replaceState({}, "",urls.LANDING);
                        break;        
                    default:
                        window.history.replaceState({}, "",urls.DASHBOARD);
                        return <DashBoard/>;
                        break;
                }
            }
        } else{
            let nestedPath = window.location.pathname.substring(window.location.pathname.lastIndexOf('/')+1);
            if(boardRegex.test(path)){
                path != ("projects/"+nestedPath.toLowerCase()) && window.history.replaceState({}, "",urls.DASHBOARD);
                return <KanbanBoard projectID = {nestedPath}/>;
            }else if(schedulerRegex.test(path)){
                path != "scheduler/"+nestedPath.toLowerCase() && window.history.replaceState({}, "",urls.DASHBOARD);
                return <Scheduler/>;
            }else{
                window.history.replaceState({}, "",urls.DASHBOARD);
                return <DashBoard/>;
            }
        }  
      }else{
          return <LoadingComponent/>;
      }    
    }
   

    render(){                                  
        return ( <div>
                    <Menu menuArray = {menuConstants}/> 
                    {JSON.stringify(this.props.user) == JSON.stringify(userObject) || this.containerSelector() }
                    <Highlight/> 
                    {this.props.io != "" && JSON.stringify(this.props.user) != JSON.stringify(userObject) && <MessageBox/>}
                </div>);
    }
}

const mapStateToProps = state => {
    return {
        currentUrl : state.urlStateReducer.currentUrl,
        user : state.userStateReducer,
        userList : state.userListStateReducer,
        io : state.socketStateReducer.io
    }
}

const mapDispatchToProps = dispatch => {
    return { 
        setUserState: (userObject) => {
            dispatch(setUserAction(userObject));
        },
        setMsgState: (msgObject) => {
            dispatch(setMsgAction(msgObject));
        },
        setSocketState: (io) => {
            dispatch(setSocketObject(io));
        } 
    };
};

export default connect(mapStateToProps,mapDispatchToProps)(PostLoginRouter);
