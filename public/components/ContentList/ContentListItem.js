import React from 'react';
import moment from 'moment';

const TAG_LIMIT = 4;

export default class ContentListItem extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
          showAllTags: false
        };
    }

    renderTags(content) {

      const tags = this.state.showAllTags ? content.tags : content.tags.slice(0, TAG_LIMIT);

      return tags.map((tag) => {
        return (<div key={tag.id} className="taglist__results-item__tag">
          {tag.webTitle},
        </div>);
      });
    }

    onShowMoreClick(e) {
      e.preventDefault();
      e.stopPropagation();

      this.setState({
        showAllTags: true
      });

    }

    renderShowMoreTags() {
      return (<div key="show_more" className="taglist__results-item__tag--showall" onClick={this.onShowMoreClick.bind(this)}>
        Show all tags
      </div>);
    }

    renderCheckBox(content) {
      if (content.fields.internalComposerCode) {
        return (<input type="checkbox" checked={this.props.isChecked} readOnly={true}/>);
      } else {
        return (
          <div>
            Content not managed by composer
          </div>
        );
      }
    }

    rowClicked() {
      if (this.props.content.fields.internalComposerCode) {
        this.props.contentClicked();
      }
    }

    render() {
      const rowClass = this.props.content.fields.internalComposerCode ? "taglist__results-item" : "taglist__result-item--disabled";

      return (
        <tr key={this.props.content.id} className={rowClass} onClick={this.rowClicked.bind(this)}>
            <td>
              {this.renderCheckBox(this.props.content)}
            </td>
            <td>{this.props.content.type}</td>
            <td>{this.props.content.webTitle}</td>
            <td>
              {this.props.content.fields && this.props.content.fields.isLive === "false" ? "Not Published" : moment(this.props.content.webPublicationDate).format('DD/MM/YYYY')}
            </td>
            <td>{this.props.content.id}</td>
            <td>
              {this.renderTags(this.props.content)}
              {!this.state.showAllTags && this.props.content.tags.length > TAG_LIMIT ? this.renderShowMoreTags() : false}
            </td>
            <td>
              <a href={this.props.content.webUrl} target="_blank">
                <i className="i-info-grey"></i>
              </a>
            </td>
          </tr>
      );
    }
}
