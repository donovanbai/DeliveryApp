import React, { Component } from 'react';
import {StyleSheet, Text, TextInput, TouchableHighlight, View} from 'react-native';

export default class LoginScreen extends Component {
  static navigationOptions = {
    header: null
  };

  state = {
    phone: '',
    pw: '',
    msg: ' ',
    msgStyle: {
      color: 'green',
      fontSize: 20
    }
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
          <TextInput
            style={styles.input}
            placeholder='phone number'
            onChangeText={phone => this.setState({phone})}
          />
          <TextInput
            style={styles.input}
            placeholder='password'
            secureTextEntry={true}
            onChangeText={pw => this.setState({pw})}
          />
          <TouchableHighlight onPress={() => this.login()} style={styles.button} underlayColor='#56CCF2'>
            <Text style={styles.btnText}>Sign in</Text>
          </TouchableHighlight>
          <TouchableHighlight onPress={() => navigate('Register')} style={styles.button} underlayColor='#56CCF2'>
            <Text style={styles.btnText}>Create an account</Text>
          </TouchableHighlight>
          <Text style={this.state.msgStyle}>{params ? params.status : this.state.msg}</Text>
        </View>
      </View>
    );
  }

  login() {
    if (this.verifyForm()) {
      fetch(server + '/login', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          phone: this.state.phone,
          pw: this.state.pw
        })
      }).then(res => res.json())
      .then(resJson => {
        if (resJson.msg === 'failure') {
          this.props.navigation.state.params = null;
          this.setState({msg: 'error', msgStyle: {color: 'red', fontSize: 20}});
        }
        else if (resJson.msg === 'invalid creds') {
          this.props.navigation.state.params = null;
          this.setState({msg: 'incorrect phone number or password', msgStyle: {color: 'red', fontSize: 20}});
        }
        else if (resJson.msg === 'login successful') {
          this.props.navigation.navigate('Home');
        }
        else {
          this.props.navigation.state.params = null;
          this.setState({msg: 'unknown server response', msgStyle: {color: 'red', fontSize: 20}});
          console.log(resJson.msg);
        }
      }).catch(error => {
        console.log(error);
      });
    }
  }
  

  verifyForm() {
    if (this.state.phone === '' || this.state.pw === '') {
      this.props.navigation.state.params = null;
      this.setState({msg: 'all fields must be filled', msgStyle: {color: 'red', fontSize: 20}});
      return false;
    }
    return true;
  }
}

const Dimensions = require('Dimensions');
let window = Dimensions.get('window');

const styles = StyleSheet.create({
  top: {
    flex: 1,
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
  },
  input: {
    width: window.width * 0.5,
    textAlign: 'center',
    fontSize: 20
  },
});

const server = 'https://flavourr.club';

