import React, {useState} from 'react';
import Container from '@material-ui/core/Container';
import Box from '@material-ui/core/Box';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Users from './Users';
import Projects from './Projects';


export const App = () => {
    let [tab, setTab] = useState(0);

    return (
        <Container className="app" fixed>
            <Box data-testid="app-box" m={2}>
                <Tabs value={tab}>
                    <Tab value={0} label="Users" onClick={() => {
                        setTab(0)
                    }}>
                    </Tab>
                    <Tab value={1} label="Projects" onClick={() => {
                        setTab(1)
                    }}>
                    </Tab>
                </Tabs>
                <Box style={{ display: ((tab === 0) ? 'block' : 'none')}}>
                <Users/>
                </Box>
                <Box style={{ display: ((tab === 1) ? 'block' : 'none')}}>
                <Projects/>
                </Box>
            </Box>
        </Container>
    );
};

export default App;
