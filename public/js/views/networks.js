var Backbone = require('backbone');
var _ = require('underscore');


var Networks = require('../models/networks');
var NetworkPools = require('../models/network-pools');


var NetworksListView = require('./networks-list');
var NetworkPoolsListView = require('./network-pools-list');

var NetworkPoolCreateView = require('./network-pools-create');
var NetworksCreateView = require('./networks-create');
var NetworksDetailView = require('./networks-detail');

var adminui = require('../adminui');

var NetworksTemplate = require('../tpl/networks.hbs');

var NetworksView = Backbone.Marionette.ItemView.extend({
    template: NetworksTemplate,
    name: "networks",
    url: 'networks',
    events: {
        'click button[name=create-network]': 'showCreateNetworkForm',
        'click button[name=create-network-pool]': 'showCreateNetworkPoolForm'
    },

    attributes: {
        "id":"page-networks"
    },
    ui: {
        'networksList': '.networks-list',
        'networkPoolsList': '.network-pools-list'
    },

    /**
     * optiosn.networks             NetworksCollection
     * options.networkPools         NetworkPoolsCollection
     */
    initialize: function(options) {
        options = options || {};

        this.networks = options.networks || new Networks();
        var networkPools = this.networkPools = options.networkPools || new NetworkPools();

        this.networksList = new NetworksListView({ collection: this.networks });
        this.networkPoolsList = new NetworkPoolsListView({
            networks: this.networks,
            collection: this.networkPools
        });

        this.listenTo(this.networks, 'sync', this.renderNetworkPoolsList, this);
        this.listenTo(this.networksList, 'select', this.showNetwork, this);
        this.listenTo(this.networkPoolsList, 'select', this.showNetwork, this);

        this.networks.fetch().done(function() {
            networkPools.fetch();
        }, this);
    },

    showCreateNetworkPoolForm: function() {
        var view = new NetworkPoolCreateView({networks: this.networks});
        this.listenTo(view, 'saved', function(networkPool) {
            this.networkPools.add(networkPool);
            view.$el.modal('hide').remove();
            adminui.vent.trigger('notification', {
                level: 'success',
                message: _.str.sprintf('Network Pool <strong>%s</strong> created successfully.',
                    networkPool.get('name'))
            });
        }, this);
        view.show();
    },

    showCreateNetworkForm: function() {
        var view = new NetworksCreateView();
        this.listenTo(view, 'saved', function(network) {
            this.networks.add(network);
            view.$el.modal('hide').remove();
            adminui.vent.trigger('notification', {
                level: 'success',
                message: _.str.sprintf('Network <strong>%s</strong> created successfully.', network.get('name'))
            });
        }, this);
        view.show();
    },

    showNetwork: function(network) {
        var view = new NetworksDetailView({model: network});
        view.render().$el.modal();
    },

    renderNetworkPoolsList: function() {
        this.ui.networkPoolsList.html(this.networkPoolsList.render().el);
    },

    onRender: function() {
        this.ui.networksList.html(this.networksList.render().el);
    }
});

module.exports = NetworksView;
