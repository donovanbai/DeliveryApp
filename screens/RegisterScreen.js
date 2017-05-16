import React, { Component } from 'react';
import {Modal, StyleSheet, Text, TextInput, TouchableHighlight, View} from 'react-native';

export default class RegisterScreen extends Component {
  static navigationOptions = {
    header: null
  };

  state = {
    phone: '',
    email: '',
    pw: '',
    pw2: '',
    name: '',
    msg: ' ',
    code: '',
    modalVisible: false
  };

  render() {
    return(
      <View style={{flex: 1}}>
        <Modal
          animationType='fade'
          transparent={true}
          visible={this.state.modalVisible}
          onRequestClose={() => this._setModalVisible(false)}
        >
          <View style={styles.popup}>
            <Text style={{fontSize: 20}}>Enter the verification code sent to</Text>
            <Text style={{fontSize: 20}}>{this.state.phone}:</Text>
            <TextInput
              style={styles.popupInput}
              onChangeText={code => this.setState({code})}
            />
            <TouchableHighlight style={styles.popupBtn} onPress={this.sendCode.bind(this)} underlayColor='white'>
              <Text style={styles.btnText}>OK</Text>
            </TouchableHighlight>
          </View>
        </Modal>
        <View style={styles.screen}>
          <View style={styles.top}>
            <View style={{flexDirection: 'row'}}>
              <Text style={styles.text}>Phone number:</Text>
              <TextInput 
                style={[styles.input]}
                onChangeText={(phone) => this.setState({phone})}
              />
            </View>
            <View style={{flexDirection: 'row'}}>
              <Text style={styles.text}>Email:</Text>
              <TextInput 
                style={[styles.input]}
                onChangeText={(email) => this.setState({email})}
              />
            </View>
            <View style={{flexDirection: 'row'}}>
              <Text style={styles.text}>Display name:</Text>
              <TextInput 
                style={[styles.input]}
                onChangeText={(name) => this.setState({name})}
              />
            </View>
            <View style={{flexDirection: 'row'}}>
              <Text style={styles.text}>Password:</Text>
              <TextInput 
                style={[styles.input]}
                secureTextEntry={true}
                onChangeText={(pw) => this.setState({pw})}
              />
            </View>
            <View style={{flexDirection: 'row'}}>
              <Text style={styles.text}>Confirm password:</Text>
              <TextInput 
                style={[styles.input]}
                secureTextEntry={true}
                onChangeText={(pw2) => this.setState({pw2})}
              />
            </View>
          </View>
          <View style={styles.bottom}>
            <TouchableHighlight style={styles.btn} onPress={this.register.bind(this)} underlayColor='#56CCF2'>
              <Text style={styles.btnText}>Register</Text>
            </TouchableHighlight>
            <Text style={styles.msg}>{this.state.msg}</Text>
          </View>
        </View>
      </View>
    );
  }

  _setModalVisible(visible) {
    this.setState({modalVisible: visible});
  }

  register() {
    console.log(this.state);
    if(this.verifyForm()) {
      fetch(server + '/register', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          phone: this.state.phone,
          email: this.state.email,
          pw: this.state.pw,
          name: this.state.name
        })
        }).then(res => res.json())
        .then(resJson => {
          if (resJson.msg === 'enter code') {
            this._setModalVisible(true);
          }
          else if (resJson.msg === 'duplicate user') {
            this.setState({msg: 'phone number or email already in use'});
          }
          else if (resJson.msg === 'invalid phone number') {
            this.setState({msg: 'only 604 and 778 area numbers are currently supported'});
          }
          else {
            this.setState({msg: 'unknown server response'});
            console.log(resJson.msg);
          }
        }).catch(error => {
          console.log(error);
      });
    }
  }

  sendCode() {
    if (this.state.code === '') {
      return;
    }
    fetch(server + '/register/' + this.state.phone, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        code: this.state.code,
        email: this.state.email,
        pw: this.state.pw,
        name: this.state.name
      })
      }).then(res => res.json())
      .then(resJson => {
        if (resJson.msg === 'wrong code') {
          this.setState({msg: 'wrong verification code'});
        }
        else if (resJson.msg === 'failure') {
          this.setState({msg: 'error'});
        }
        else if (resJson.msg === 'success') {
          this._setModalVisible(false);
          this.props.navigation.navigate('Login', {status: 'Account registration successful!'});
        }
        else {
          this.setState({msg: 'unknown server response'});
          console.log(resJson.msg);
        }
      }).catch(error => {
        console.log(error);
    });
  }

  test() {
    this.props.navigation.navigate('Login', {status: 'Account registration successful!'})
  }

  verifyForm() {
    if (this.state.phone === '' || this.state.email === '' || this.state.name === '' || this.state.pw === '' || this.state.pw2 === '') {
      this.setState({msg: 'all fields must be filled'});
      return false;
    }
    if (this.state.phone.length !== 10 || Number(this.state.phone) === NaN) {
      this.setState({msg: 'invalid phone number'});
      return false;
    }
    if (this.state.pw !== this.state.pw2) {
      this.setState({msg: 'passwords don\'t match'});
      return false;
    }
    let pw = this.state.pw;
    if (pw.length < 8) {
      this.setState({msg: 'password needs to be at least 8 characters long'});
      return false;
    }
    if (pw.search('[0-9]') === -1 || pw.search('[a-z]') === -1 || pw.search('[A-Z]') === -1) {
      this.setState({msg: 'password needs to contain a number, a lowercase letter, and an uppercase letter'});
      return false;
    }
    return true;
  }
}

const Dimensions = require('Dimensions');
let window = Dimensions.get('window');

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    padding: 10
  },
  input: {
    fontSize: 16,
    textAlign: 'center',
    width: 200
  },
  text: {
    fontSize: 16,
    marginTop: 15
  },
  btn: {
    marginTop: 30,
    width: 190,
    height: 50,
    backgroundColor: '#56CCF2',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnText: {
    fontSize: 20
  },
  msg: {
    color: 'red',
    marginTop: 15,
    fontSize: 20
  },
  top: {
    flex: 2,
    justifyContent: 'center',
    alignItems: 'flex-end'
  },
  bottom: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  popup: {
    width: window.width * 0.8,
    height: window.width * 0.6,
    marginLeft: window.width * 0.1,
    marginTop: (window.height - window.width * 0.6) / 2,
    backgroundColor: '#bbbbbb',
    borderRadius: 20,
    alignItems: 'center',
    padding: 10
  },
  popupInput: {
    fontSize: 20,
    textAlign: 'center',
    width: window.width * 0.4
  },
  popupBtn: {
    width: window.width * 0.2,
    height: window.width * 0.1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 15
  }
});

const server = 'https://flavourr.club';