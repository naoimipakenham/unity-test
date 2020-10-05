import React from 'react';
import {mount} from 'enzyme';
import Projects from './Projects';
import sortBy from 'lodash/sortBy';


const cols = [
    {header: 'Date', name: 'date'},
    {header: 'Project ID', name: 'id'},
    {header: 'Old value', name: 'oldValue'},
    {header: 'New value', name: 'newValue'}
];

let data = [
    {
        id: '90b9e1ad-7556-44f8-8278-c723824de782',
        timestamp: new Date('2020/2/17').getTime(),
        diff: [
            {field: 'name', oldValue: 'Angry Birds 2: The sequel', newValue: 'Angry Birds 2: The return of the birds'},
        ],
    },
    {
        id: 'fcd064f9-687e-4bd4-9c8f-93361610cc58',
        timestamp: new Date('2020/2/18').getTime(),
        diff: [
            {field: 'name', oldValue: 'Angry Birds 2: The return of the birds', newValue: 'Angry Birds 2'},
        ],
    },
];


beforeAll(() => {
    global.fetch = jest.fn();
    window.fetch = jest.fn();
});

let wrapper;
beforeEach(() => {
    wrapper = mount(<Projects/>, {disableLifecycleMethods: true});
});

afterEach(() => {
    wrapper.unmount();
});

it("must render a loading spinner before api call success", () => {
    expect(wrapper.find({'data-testid': 'loading-spinner'}).exists()).toBeTruthy();
});

it("must show the projects list and hide the loading span after api call success",
    (done) => {
// Spy on fetchProjects API request to confirm it was called
        const spyDidFetchProjects = jest.spyOn(Projects.prototype, "fetchProjects");

        fetch.mockImplementation(() => {
            return Promise.resolve({
                status: 200,
                json: () => {
                    return data;
                }
            });
        });

        const didFetch = wrapper.instance().fetchProjects();

// expecting fetchProjects have been called
        expect(spyDidFetchProjects).toHaveBeenCalled();

        didFetch.then(() => {
            // updating the wrapper
            wrapper.update();

            // There should be ONLY 1 table element
            const table = wrapper.find('table');
            expect(table).toHaveLength(1);

            // The table should have ONLY 1 thead element
            const thead = table.find('thead');
            expect(thead).toHaveLength(1);

            // The number of th tags should be equal to the number of columns
            const headers = thead.find('th');
            expect(headers).toHaveLength(cols.length);

            // Each th tag text should equal to column header
            headers.forEach((th, idx) => {
                expect(th.text()).toEqual(cols[idx].header);
            });

            // The table should have ONLY 1 tbody tag
            const tbody = table.find('tbody');
            expect(tbody).toHaveLength(1);


            // tbody tag should have the same number of tr tags as data rows
            const rows = tbody.find('tr');
            expect(rows).toHaveLength(data.length);

            //reverse data order to match the order rendered in the table component
            data = sortBy(data, "timestamp").reverse();

            // Loop through each row and check the content
            rows.forEach((tr, rowIndex) => {
                const cells = tr.find('td');
                expect(cells).toHaveLength(cols.length);
                expect(cells.at(0).text()).toEqual(wrapper.instance().formatTimestamp(data[rowIndex].timestamp));
                expect(cells.at(1).text()).toEqual(data[rowIndex].id);
                expect(cells.at(2).text()).toEqual(data[rowIndex].diff[0].oldValue);
                expect(cells.at(3).text()).toEqual(data[rowIndex].diff[0].newValue);
            });

            expect(wrapper.find({'data-testid': 'loading-spinner'}).length).toBe(0);
            spyDidFetchProjects.mockRestore();
            fetch.mockClear();
            done();
        });
    });
