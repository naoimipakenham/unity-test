import React from 'react';
import {mount} from 'enzyme';
import Users from './Users';
import sortBy from 'lodash/sortBy';

//Users table headings
const cols = [
    {header: 'Date', name: 'date'},
    {header: 'User ID', name: 'id'},
    {header: 'Old value', name: 'oldValue'},
    {header: 'New value', name: 'newValue'}
];

//Sample API data
let data = [
    {
        id: 'bf008d15-3d34-422e-9041-039c59d9ed3d',
        timestamp: new Date('2020/2/17').getTime(),
        diff: [
            {field: 'name', oldValue: 'Michel', newValue: 'Michael'},
        ],
    },
    {
        id: '2a83c13c-c040-4672-9b7b-c004ce614264',
        timestamp: new Date('2020/2/18').getTime(),
        diff: [
            {field: 'name', oldValue: 'Michael', newValue: 'Constantine Prescott Nathaniel Jr.'},
        ],
    },
    {
        id: 'bb177085-7340-4cf7-a892-f436f20951e2',
        timestamp: new Date('2020/2/19').getTime(),
        diff: [
            {
                field: 'name',
                oldValue: 'Constantine Prescott Nathaniel Jr.',
                newValue: 'Constantine Prescott Nathaniel Sr.'
            },
        ],
    }
];


beforeAll(() => {
    global.fetch = jest.fn();
    window.fetch = jest.fn();
});

let wrapper;
beforeEach(() => {
    wrapper = mount(<Users/>, {disableLifecycleMethods: true});
});

afterEach(() => {
    wrapper.unmount();
});

it("must render a loading spinner before api call success", () => {
    expect(wrapper.find({'data-testid': 'loading-spinner'}).exists()).toBeTruthy();
});

it("must show the users list and hide the loading span after api call success",
    (done) => {
// Spy on fetchUsers API request to confirm it was called
        const spyDidFetchUsers = jest.spyOn(Users.prototype, "fetchUsers");

        fetch.mockImplementation(() => {
            return Promise.resolve({
                status: 200,
                json: () => {
                    return data;
                }
            });
        });

        const didFetch = wrapper.instance().fetchUsers();

// expecting fetchUsers have been called
        expect(spyDidFetchUsers).toHaveBeenCalled();

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
            spyDidFetchUsers.mockRestore();
            fetch.mockClear();
            done();
        });
    });

