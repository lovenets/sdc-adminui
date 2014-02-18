/** @jsx React.DOM */

var Backbone = require('backbone');
var moment = require('moment');
var React = require('react');
var _ = require('underscore');
var adminui = require('../adminui');

var JobProgressHeader = React.createClass({

    getInitialState: function() {
        return this.props.job;
    },

    render: function() {
        var job = this.state;

        return (
            <div>
                <h2>Job {job.name}</h2>
                <small>{job.uuid}</small>
                <a className="job-details pull-right">Job Details <i className="icon-fullscreen"></i></a>
            </div>
        );
    }
});

var JobProgressSummary = React.createClass({

    getInitialState: function() {
        return this.props.job;
    },

    render: function() {
        var job = this.state;

        return (
            <div className="summary">
                <div className="chain-results">
                    <ol>
                    {_.map(job.chain_results, function(c, i) {
                        return (
                            <li key={c.name} className={c.error}>
                            <div className="task">
                                <div className="name">{c.name}</div>
                                <div className="result">{c.result}</div>
                            </div>
                            <div className="time">
                                <div className="started-at"><i className="icon-play"></i> {c.started_at}</div>
                                <div className="finished-at"><i className="icon-stop"></i> {c.finished_at}</div>
                            </div>
                            <div className="duration">
                                <i className="icon-time"></i><div className="value">{c.duration}</div>
                            </div>
                            {(function() {
                                if (c.error) {
                                    return (
                                        <div className="error">
                                        (c.error && c.error.message) ? c.error.message : c.error
                                        </div>
                                    )
                                }
                            })()}
                        </li>)
                    })}
                    </ol>
                </div>
            </div>
        );
    }
});

var JobProgressFooter = React.createClass({

    getInitialState: function() {
        return this.props.job;
    },

    render: function() {
        var job = this.state;

        return (
            <div>
            <div className="pull-left">
            <div className="execution"> <div className={job.execution}> {job.execution}</div> </div>
            { (! job.finished) ? <span className="wait">Working... <img src="/img/job-progress-loading.gif" /></span> : '' }
            </div>
            <button className="btn" data-dismiss="modal">Close</button>
            </div>
        );
    }
});





var JobProgressView = Backbone.Marionette.ItemView.extend({
    attributes: {
        'class': 'modal',
        'id': 'job-progress'
    },
    template: require('../tpl/job-progress.hbs'),

    events: {
        'click .job-details': 'navigateToJob'
    },

    initialize: function() { },

    navigateToJob: function() {
        adminui.vent.trigger('showview', 'job', {model: this.model});
        this.close();
    },

    serializeData: function() {
        var data = Backbone.Marionette.ItemView.prototype.serializeData.call(this, arguments);
        data.chain_results = _.map(data.chain_results, function(task) {
            var t = _.clone(task);
            t.started_at = moment(task.started_at).utc().format('YYYY-MM-DD HH:mm:ss');
            t.finished_at = moment(task.finished_at).utc().format('YYYY-MM-DD HH:mm:ss');
            t.duration = moment(task.finished_at).diff(moment(task.started_at), 'seconds', true) + 's';
            return t;
        });
        data.finished = data.execution === 'succeeded' || data.execution === 'failed';
        return data;
    },

    show: function() {
        this.render();
        this.update();

        if (! this._timer) {
            this._timer = setInterval(this.update.bind(this), 2000);
        }
        var modal = this.$el.modal();
        var timer = this._timer;
        modal.on('hidden', function() {
            clearInterval(timer);
        });
    },

    update: function() {
        this.model.fetch({success: this.onUpdate.bind(this)});
    },

    onRender: function() {
        var job = this.serializeData();

        this.header = <JobProgressHeader job={job} />;
        this.body = <JobProgressSummary job={job} />;
        this.footer = <JobProgressFooter job={job} />;

        this.component = React.renderComponent(
            <div>
                <div className="modal-header">{this.header}</div>
                <div className="modal-body">{this.body}</div>
                <div className="modal-footer">{this.footer}</div>
            </div>
        , this.$el.get(0));
    },

    onClose: function() {
        this.$el.modal('hide');
        clearInterval(this._timer);
    },

    onUpdate: function() {
        var job = this.serializeData();
        this.header.setState(job);
        this.body.setState(job);
        this.footer.setState(job);

        this.$('.modal-body').scrollTop(this.$('.modal-body').get(0).scrollHeight);

        var execution = this.model.get('execution');

        if (execution === 'cancelled' ||
            execution === 'succeeded' || execution === 'failed') {
            this.trigger(execution);
            clearInterval(this._timer);
        }

        this.trigger('execution', this.model.get('execution'));
    }
});

module.exports = JobProgressView;
