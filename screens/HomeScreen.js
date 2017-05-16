import React, { Component } from 'react';
import {StyleSheet, Text, View} from 'react-native';
import MapView from 'react-native-maps';

export default class HomeScreen extends Component {
  static navigationOptions = {
    header: null
  };

  render() {
    return(
      <View style ={{flex: 1}}>
        <MapView
          style={styles.map}
          region={{
            latitude: 49.206870277252776,
            longitude: -123.14234521239996,
            latitudeDelta: 0.25992602390359565,
            longitudeDelta: 0.24894554167985916,
          }}
          onRegionChange={this.onRegionChange}
        >
        </MapView>
      </View>
    );
  }

  onRegionChange(region) {
    console.log(region);
  }
}

const styles = StyleSheet.create({
  map: {
    ...StyleSheet.absoluteFillObject,
  },
});