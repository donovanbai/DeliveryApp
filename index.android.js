import React, { Component } from 'react';
import {AppRegistry, StyleSheet, Text, View} from 'react-native';
import {StackNavigator} from 'react-navigation';

import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import HomeScreen from './screens/HomeScreen';

const DeliveryApp = StackNavigator({
  Login: {screen: LoginScreen},
  Register: {screen: RegisterScreen},
  Home: {screen: HomeScreen}
});

AppRegistry.registerComponent('DeliveryApp', () => DeliveryApp);