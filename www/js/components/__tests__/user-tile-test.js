/** @jsx: React.DOM */

jest.dontMock('../user-tile.js');

describe('UserTile', function() {

    it('renders user-tile', function() {
        var React = require('react/addons');
        var TestUtils = React.addons.TestUtils;
        var UserTile = require('../user-tile.js');

        var userTile = new Usertile({uuid: '12b2e590-e0ea-11e3-8b68-0800200c9a66'});
        TestUtils.renderIntoDocument(userTile);
        var tile = TestUtils.findRenderedDOMComponentWithTag(userTile, 'div');
        expect(tile.getDOMNode().class).toEqual('user-tile');
    });
});