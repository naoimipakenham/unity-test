import React from 'react';
import api from '../lib/api';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TableSortLabel from '@material-ui/core/TableSortLabel';
import Paper from '@material-ui/core/Paper';
import sortBy from "lodash/sortBy";
import Button from "@material-ui/core/Button";
import Box from '@material-ui/core/Box';
import CircularProgress from '@material-ui/core/CircularProgress';
import Alert from '@material-ui/lab/Alert';


class Projects extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            projects: [],
            isLoading: true,
            buttonMessage: ["Load more", "Try again"],
            isError: false,
            errorMessage: '',
            sorted: true,
            sortDirection: 'desc',
        }
    };

    async fetchProjects() {
        this.setState({'projects': []});
        this.setState({'isLoading': true});
        let response;
        try {
            response = await api.getProjectsDiff();
            this.setState({'isError': false});
            let projectsData = response.data;
            if (this.state.sorted) {
                projectsData = sortBy(projectsData, "timestamp").reverse();
                this.setState({sortDirection: 'desc'});
                this.setState({'sorted': true});
            }
            this.setState({'projects': projectsData});
        } catch (err) {
            this.setState({'errorMessage': err.error});
            this.setState({'isError': true});
        }
        this.setState({'isLoading': false});
    };

    formatTimestamp(timestamp) {
        const unixTime = timestamp;
        let date = new Date(unixTime);
        date = date.toLocaleDateString("ko-KR");
        date = date.replace(/\./g, '-');
        date = date.substring(0, date.length - 1);
        date = date.replace(/\s/g, '');
        return date;
    };


    sortDate() {

        let list;

        if (this.state.sorted) {
            list = sortBy(this.state.projects, "timestamp");
            this.setState({sortDirection: 'asc'});
        } else {
            list = sortBy(this.state.projects, "timestamp").reverse();
            this.setState({sortDirection: 'desc'});
        }
        this.setState({'sorted': !this.state.sorted});
        this.setState({'projects': list});
    };


    componentDidMount() {
        this.fetchProjects();
    };

    render() {
        return (
            <TableContainer component={Paper}>
                <Table data-testid='projects-table'>
                    <TableHead>
                        <TableRow>
                            <TableCell>
                                <TableSortLabel active={true} direction={this.state.sortDirection}
                                                onClick={this.sortDate.bind(this)}
                                                style={{fontWeight: '600'}}>Date</TableSortLabel>
                            </TableCell>
                            <TableCell style={{fontWeight: '600'}}>Project ID</TableCell>
                            <TableCell style={{fontWeight: '600'}}>Old value</TableCell>
                            <TableCell style={{fontWeight: '600'}}>New value</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {this.state.projects.map((project, index) =>
                            <TableRow key={index}>
                                <TableCell key={project.timestamp}>{this.formatTimestamp(project.timestamp)}</TableCell>
                                <TableCell key={project.id}>{project.id}</TableCell>
                                <TableCell key={project.diff[0].oldValue}>{project.diff[0].oldValue}</TableCell>
                                <TableCell key={project.diff[0].newValue}>{project.diff[0].newValue}</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
                <Box m={2} textAlign='center'>
                    {this.state.isError ?
                        <Box mb={1.5}><Alert severity="error">We had problems fetching your data. Please try
                            again.</Alert></Box> : null}
                    {this.state.isLoading ? <CircularProgress data-testid={'loading-spinner'}/> : null}
                    {this.state.isLoading ? null :
                        <Button variant="contained" color="primary" onClick={this.fetchProjects.bind(this)}>
                            {this.state.isError ? this.state.buttonMessage[1] : this.state.buttonMessage[0]}
                        </Button>}
                </Box>
            </TableContainer>
        );
    };
};

export default Projects;



