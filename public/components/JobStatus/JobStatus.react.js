import React from 'react';
import moment from 'moment';
import tagManagerApi from '../../util/tagManagerApi.js';

export default class JobStatus extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      jobs: []
    };

  }

  componentDidMount() {
    this.fetchJobs();

    setInterval(this.fetchJobs.bind(this), 5000);
  }

  fetchJobs() {

    if(this.props.tagId) {
      tagManagerApi.getJobsByTag(this.props.tagId).then(res =>
        this.setState({jobs: res})
      )
    } else {
      tagManagerApi.getAllJobs().then(res => {
        this.setState({jobs: res});
      });
    }
  }

  describeCommand(job) {
    const commandType = job.command.type;

    if(commandType === 'BatchTagCommand') {
      const op = job.command.operation;
      if(op === 'remove') {
        return 'Removing tag from content';
      } else if (op === 'addToTop') {
        return 'Adding tag to the top of content';
      } else if (op === 'addToBottom') {
        return 'Adding tag to the bottom of content';
      } else {
        return 'Unexpected batch tag operation';
      }
    } else {
      return 'Unexpected job type';
    }
  }

  describeCurrentStep(job) {
    const step = job.steps[0];
    const stepType = step.type;

    if(stepType === 'BatchTagRemoveCompleteCheck' || stepType === 'BatchTagAddCompleteCheck') {
      return 'completed ' + step.completed + ' of ' + step.contentIds.length;
    } else {
      return 'unexpected step type ' + stepType;
    }
  }

  describeJob(job) {
    return (
      <div className="job-status__job" key={job.id} >
        {this.describeCommand(job)}<br />
        <span className="job-status__job__progress">{this.describeCurrentStep(job)}</span>
      </div>
    );
  }

  render () {
    const self = this;
    return (
      <div className="job-status">
        <div className="job-status__header">Currently running jobs</div>
        {this.state.jobs.map( function(job) {
          return self.describeJob(job);
        })}
      </div>
    );
  }
}
