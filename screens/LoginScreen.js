import React, { Component } from 'react';
import {StyleSheet, Text, TouchableHighlight, View} from 'react-native';

export default class LoginScreen extends Component {
  static navigationOptions = {
    header: null
  };

  render() {
    const {navigate} = this.props.navigation;
    const {params} = this.props.navigation.state;
    // I don't want a highlight when pressing TouchableHighlight but setting activeOpacity doesn't work
    // so underlayColor is set to match backgroundColor
    return (
      <View style={{flex:1}}>
        <View style={styles.top}>
          <Text style={styles.name}>Foodelivery</Text>
        </View>
        <View style={styles.bottom}>
          <Text style={{fontSize: 20, color: 'green'}}>{params ? params.status : ''}</Text>
          <TouchableHighlight onPress={() => console.log()} style={styles.button} underlayColor='#56CCF2'>
            <Text style={styles.btnText}>Sign in</Text>
          </TouchableHighlight>
          <TouchableHighlight onPress={() => navigate('Register')} style={styles.button} underlayColor='#56CCF2'>
            <Text style={styles.btnText}>Create an account</Text>
          </TouchableHighlight>
        </View>
      </View>
    );
  }

  login() {
    fetch(server, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: 'john',
        password: 'test'
      })
    }).then(res => res.json())
    .then(resJson => {
      
    }).catch(error => {
      console.log(error);
    });
  }
}

const styles = StyleSheet.create({
  top: {
    flex: 2,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1BF2EC',
  },
  bottom: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  name: {
    fontSize: 60
  },
  button: {
    backgroundColor: '#56CCF2',
    width: 190,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 10,
    borderRadius: 30
  },
  btnText: {
    fontSize: 20
  }
});

const server = 'https://flavourr.club';

