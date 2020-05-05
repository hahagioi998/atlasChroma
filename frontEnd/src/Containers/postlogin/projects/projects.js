//Dependencies
import React, { Component } from 'react';
import { connect } from 'react-redux';

import FilterForm from '../../../Forms/filterForm';
import AddProject from './addProject';
import filterFormConstants from '../../../Forms/filterFormConstants';
import ProjectContainer from './projectContainer';

class Projects extends Component {

        constructor(props){
                super(props);
                this.state = {
                    search:"",
                    orderBy:"Recently Created",
                    addProject:false
                };
                this.searchProject = this.searchProject.bind(this);
                this.addProject = this.addProject.bind(this);
                this.changeOrderBy = this.changeOrderBy.bind(this);
        }

        searchProject(projectName){
            console.log(projectName);
        }

        addProject(){
            let nextBoolVal = !this.state.addProject
            this.setState({addProject:nextBoolVal});
        }
        
        changeOrderBy(event){
            this.setState({orderBy:event.target.value});
        }

        render(){
                let addProject = this.state.addProject ? <AddProject cancel = {this.addProject}/> :"";
                return (<div> 
                           <FilterForm 
                           orderBy={this.state.orderBy} 
                           searchFunction={this.searchProject}
                           changeOrderBy={this.changeOrderBy}
                           options = {filterFormConstants.projectFilter}/> 
                           <button onClick={this.addProject}>Add Project</button>
                           {addProject} 
                             <ProjectContainer orderBy = {this.state.orderBy}/> 
                        </div>);    
        }
        
}

const mapStateToProps = (state) => {
        return {
            user: state.userStateReducer
        }
};
    
const mapDispatchToProps = dispatch => {
        return {
            setUserState: (userObject) => {
                dispatch(setUserAction(userObject));
            }
        };
};
    
export default connect(mapStateToProps,mapDispatchToProps)(Projects);