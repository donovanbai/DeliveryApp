import React, { Component } from 'react';
import {AppRegistry, StyleSheet, Text, View} from 'react-native';
import {StackNavigator} from 'react-navigation';

import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';

const DeliveryApp = StackNavigator({
  Login: {screen: LoginScreen},
  Register: {screen: RegisterScreen}
});

AppRegistry.registerComponent('DeliveryApp', () => DeliveryApp);