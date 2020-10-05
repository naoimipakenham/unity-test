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


export default class Users extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            users: [],
            isLoading: true,
            buttonMessage: ["Load more", "Try again"],
            isError: false,
            errorMessage: '',
            sorted: true,
            sortDirection: 'desc',
        }
    };

    async fetchUsers() {
        this.setState({'users': []});
        this.setState({'isLoading': true});
        let response;
        try {
            response = await api.getUsersDiff();
            this.setState({'isError': false});
            let usersData = response.data;
            if (this.state.sorted) {
                usersData = sortBy(usersData, "timestamp").reverse();
                this.setState({sortDirection: 'desc'});
                this.setState({'sorted': true});
            }
            this.setState({'users': usersData});
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
            list = sortBy(this.state.users, "timestamp");
            this.setState({sortDirection: 'asc'});
        } else {
            list = sortBy(this.state.users, "timestamp").reverse();
            this.setState({sortDirection: 'desc'});
        }
        this.setState({'sorted': !this.state.sorted});
        this.setState({'users': list});
    };


    componentDidMount() {
        this.fetchUsers();
    };

    render() {
        return (
            <TableContainer component={Paper}>
                <Table data-testid='users-table'>
                    <TableHead>
                        <TableRow>
                            <TableCell>
                                <TableSortLabel active={true} direction={this.state.sortDirection}
                                                onClick={this.sortDate.bind(this)}
                                                style={{fontWeight: '600'}}>Date</TableSortLabel>
                            </TableCell>
                            <TableCell style={{fontWeight: '600'}}>User ID</TableCell>
                            <TableCell style={{fontWeight: '600'}}>Old value</TableCell>
                            <TableCell style={{fontWeight: '600'}}>New value</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {this.state.users.map((user, index) =>
                            <TableRow key={index} className={'testclass'}>
                                <TableCell key={user.timestamp}>{this.formatTimestamp(user.timestamp)}</TableCell>
                                <TableCell key={user.id}>{user.id}</TableCell>
                                <TableCell key={user.diff[0].oldValue}>{user.diff[0].oldValue}</TableCell>
                                <TableCell key={user.diff[0].newValue}>{user.diff[0].newValue}</TableCell>
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
                        <Button variant="contained" color="primary" onClick={this.fetchUsers.bind(this)}>
                            {this.state.isError ? this.state.buttonMessage[1] : this.state.buttonMessage[0]}
                        </Button>}
                </Box>
            </TableContainer>
        );
    };
};



