import React, {Component} from 'react';
import LocationList from './components/LocationList';
import { MAP_API_KEY } from './data/auth';
import { FS_CLIENT_ID } from './data/auth';
import { FS_CLIENT_SECRET } from './data/auth';
import { importedLocations } from './data/locations';

class App extends Component {

    constructor(props) {
        super(props);
        this.state = {
            'locations': importedLocations,
            'map': '',
            'infowindow': '',
            'marker': ''
        };

        this.initMap = this.initMap.bind(this);
        this.openInfoWindow = this.openInfoWindow.bind(this);
        this.closeInfoWindow = this.closeInfoWindow.bind(this);
    }

    componentDidMount() {
        window.initMap = this.initMap;
        asyncLoadMap('https://maps.googleapis.com/maps/api/js?key=' + MAP_API_KEY + '&callback=initMap')
    }

    /** Initialise the map **/

    initMap() {
        var self = this;

        var mapview = document.getElementById('map');
        mapview.style.height = window.innerHeight + "px";
        var map = new window.google.maps.Map(mapview, {
            center: {lat: 47.497294, lng: 19.055558},
            zoom: 14
        });

        var InfoWindow = new window.google.maps.InfoWindow({});

        window.google.maps.event.addListener(InfoWindow, 'closeclick', function () {
            self.closeInfoWindow();
        });

        this.setState({
            'map': map,
            'infowindow': InfoWindow
        });

        window.google.maps.event.addDomListener(window, "resize", function () {
            var center = map.getCenter();
            window.google.maps.event.trigger(map, "resize");
            self.state.map.setCenter(center);
        });

        window.google.maps.event.addListener(map, 'click', function () {
            self.closeInfoWindow();
        });

        var locations = [];
        this.state.locations.forEach(function (location) {
            var name = location.name;
            var marker = new window.google.maps.Marker({
                position: new window.google.maps.LatLng(location.latitude, location.longitude),
                animation: window.google.maps.Animation.DROP,
                map: map
            });

            marker.addListener('click', function () {
                self.openInfoWindow(marker);
            });

            location.name = name;
            location.marker = marker;
            location.display = true;
            locations.push(location);
        });
        this.setState({
            'locations': locations
        });
    }

    openInfoWindow(marker) {
        this.closeInfoWindow();
        this.state.infowindow.open(this.state.map, marker);
        marker.setAnimation(window.google.maps.Animation.BOUNCE);
        this.setState({
            'marker': marker
        });
        this.state.infowindow.setContent('Loading Data...');
        this.state.map.setCenter(marker.getPosition());
        this.state.map.panBy(0, -200);
        this.getMarkerInfo(marker);
    }

    /** get data from foursquare to InfoWindow  **/

    getMarkerInfo(marker) {
        var self = this;
        var clientId = FS_CLIENT_ID;
        var clientSecret = FS_CLIENT_SECRET;
        var url = "https://api.foursquare.com/v2/venues/search?client_id=" +
            clientId + "&client_secret=" +
            clientSecret + "&v=20130815&ll=" +
            marker.getPosition().lat() + "," +
            marker.getPosition().lng() + "&limit=1";
        fetch(url)
            .then(
                function (response) {
                    if (response.status !== 200) {
                        self.state.infowindow.setContent("Sorry data can't be loaded");
                        return;
                    }

                    response.json().then(function (data) {
                        var location_data = data.response.venues[0];
                        var name = 'Name: ' + location_data.name + '<br>';
                        var categorie = 'Categorie: ' + location_data.categories[0].name + '<br>';
                        var verified = 'Verified Location: ' + (location_data.verified ? 'Yes' : 'No') + '<br>';
                        var readMore = '<a href="https://foursquare.com/v/'+ location_data.id +'" target="_blank">Go to Foursquare to check out</a>'
                        self.state.infowindow.setContent(name + categorie + verified + readMore);
                    });
                }
            )
            .catch(function (err) {
                self.state.infowindow.setContent("Sorry data can't be loaded");
            });
    }

    closeInfoWindow() {
        if (this.state.marker) {
            this.state.marker.setAnimation(null);
        }
        this.setState({
            'marker': ''
        });
        this.state.infowindow.close();
    }

    render() {
        return (
            <div>
                <LocationList
                locations={this.state.locations}
                openInfoWindow={this.openInfoWindow}
                closeInfoWindow={this.closeInfoWindow}/>
                <div id="map"></div>
            </div>
        );
    }
}

export default App;

/** Load the google maps Asynchronously */

function asyncLoadMap(src) {
    var target = window.document.getElementsByTagName("script")[0];
    var script = window.document.createElement("script");
    script.src = src;
    script.async = true;
    script.onerror = function () {
        document.write("Google Maps can't be loaded");
    };
    target.parentNode.insertBefore(script, target);
};
