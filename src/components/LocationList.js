import React, {Component} from 'react';
import Location from './Location';

class LocationList extends Component {

    constructor(props) {
        super(props);
        this.state = {
            'locations': '',
            'query': '',
            'list': true,
        };

        this.filterLocations = this.filterLocations.bind(this);
        this.toggleList = this.toggleList.bind(this);
    }

    /* Filter the list   */

    filterLocations(event) {
        this.props.closeInfoWindow();
        const {value} = event.target;
        var locations = [];
        this.props.locations.forEach(function (location) {
            if (location.longname.toLowerCase().indexOf(value.toLowerCase()) >= 0) {
                location.marker.setVisible(true);
                locations.push(location);
            } else {
                location.marker.setVisible(false);
            }
        });

        this.setState({
            'locations': locations,
            'query': value
        });
    }

    componentWillMount() {
        this.setState({
            'locations': this.props.locations
        });
    }

    /** Show and hide list */

    toggleList() {
        this.setState({
            'list': !this.state.list
        });
    }

    render() {
        var locationlist = this.state.locations.map(function (listItem, index) {
            return (
                <Location key={index} openInfoWindow={this.props.openInfoWindow.bind(this)} data={listItem}/>
            );
        }, this);

        return (
            <div className="search-box">
                <input role="search" aria-label="filter" id="search-field" className="search-field" type="text" placeholder="Filter"
                       value={this.state.query} onChange={this.filterLocations}/>
                <ul>
                    {this.state.list && locationlist}
                </ul>
                <button className="toggle" onClick={this.toggleList}>Show/Hide list</button>
            </div>
        );
    }
}

export default LocationList;
