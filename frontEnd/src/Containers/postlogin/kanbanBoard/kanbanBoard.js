//Dependencies
import React, { Component } from 'react';
import { hot } from "react-hot-loader";
import { connect } from 'react-redux';

import SetupProject from './setupProject';
import StoryForm from './storyForm';
import BoardColumn from './boardColumn';
import {urls} from '../../../../../lib/constants/contants';

class KanbanBoard extends Component {

    constructor(props){
        super(props);
        this.state={
            showStoryForm:false,
            componentWidth : screen.width
        };
        this.addStory = this.addStory.bind(this);
        this.buildBoard = this.buildBoard.bind(this);
        this.selectProject = this.selectProject.bind(this);
        this.groupTemplate = this.groupTemplate.bind(this);
    }
    
    componentDidMount(){
        JSON.stringify(this.selectProject()) == JSON.stringify({}) && window.history.replaceState({}, "",urls.DASHBOARD);
    }

    groupTemplate(template){
        let groupedTemplate = [];
        template.map(element => {
            element.CHILDREN.length == 0 && element.EXTENDS == "" && groupedTemplate.push(element);
            if(element.CHILDREN.length != 0 && element.EXTENDS == ""){
                template.map(childElement => {
                    if(element.CHILDREN.includes(childElement.NAME)){
                        element.CHILDREN.splice(element.CHILDREN.indexOf(childElement.NAME),1,childElement);
                    }
                });
                groupedTemplate.push(element);
            }
        });
        return groupedTemplate;
    }

    selectProject(){
        let projectID = window.location.pathname.substring(window.location.pathname.lastIndexOf('/')+1);
        let projectObject = {};
        this.props.user.projects.map(project => {
            if(project._id == projectID)
                    projectObject = project;      
        });
        return projectObject;
    }
    
    buildBoard(template = this.selectProject().templatedetails){
        let board = "";
        let groupedTemplate = this.groupTemplate(template);
        let width = this.state.componentWidth/groupedTemplate.length;
        board = groupedTemplate.map(template => {
            return(<BoardColumn columnDetails = {template} width = {width}/>);    
        });
        return (<div>{board}</div>);
    }

    addStory(){
        let showOrHide = !this.state.showStoryForm;
        this.setState({showStoryForm : showOrHide});
    }

    render(){
        let boardStyle = {
            width : this.state.componentWidth
        };
        let currentProject = this.selectProject();
        let boardJSX = JSON.stringify(currentProject) == JSON.stringify({}) ? "" : 
                            JSON.stringify(currentProject.templatedetails) != JSON.stringify({}) ? this.buildBoard() :
                                 <SetupProject/>;
        return (<div>
                    {this.state.showStoryForm && <StoryForm closeForm={this.addStory} currentMode = "ADD" projectDetails = {currentProject} />}
                    <div className ="boardContainer" id="boardContainer" style = {boardStyle}>
                        {boardJSX}
                    </div>
                    {JSON.stringify(currentProject) != JSON.stringify({}) && 
                        JSON.stringify(currentProject.templatedetails) != JSON.stringify({}) && 
                            <button onClick={this.addStory} id="addStoryButton">+</button>}
                </div>);
    }
}

const mapStateToProps = (state) => {
    return {
        user: state.userStateReducer
    }
};

export default connect(mapStateToProps)(KanbanBoard); 