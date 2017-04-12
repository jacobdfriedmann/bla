/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  Button,
  NativeAppEventEmitter,
  TextInput,
  KeyboardAvoidingView,
  ScrollView
} from 'react-native';
import BleManager from 'react-native-ble-manager';
import base64 from 'base64-js';

import LightButton from './src/components/LightButton';

const RED_LIGHT_OFF = [0];
const RED_LIGHT_ON = [1];
const BLUE_LIGHT_ON = [17];
const BLUE_LIGHT_OFF = [16];
const POLICE_LIGHTS = [2];
const MORSE_SOS = [3];

export default class bla extends Component {

  constructor(props) {
    super(props);

    this.state = {
      connected: false,
      red: false,
      blue: false,
      morseMessage: ''
    };

    this.handleDiscoverPeripheral = this.handleDiscoverPeripheral.bind(this);
    this.writeMessage = this.writeMessage.bind(this);
    this.writeMorseMessage = this.writeMorseMessage.bind(this);
  }

  componentDidMount() {
    BleManager.start({ showAlert: false });

    NativeAppEventEmitter
      .addListener('BleManagerDiscoverPeripheral', this.handleDiscoverPeripheral);

    this.scanInterval = setInterval(() => {
      BleManager.scan(['E2C56DB5-DFFB-48D2-B060-D0F5A71096E0'], 5, true)
        .then(() => { console.log('Scanning...'); });
    }, 3000);
  }

  handleDiscoverPeripheral(data) {
    console.log('Got ble data', data);
    const { id, name } = data;
    if (name === 'raspberrypi') {
      if (!this.state.connected) {
        this.state.connected = true;

        BleManager.connect(id)
          .then((peripheralInfo) => {
            this.setState({ connected: true });
            const serviceId = peripheralInfo.characteristics[0].service;
            clearInterval(this.scanInterval);
            BleManager.stopScan()
              .then(() => console.log('Stopped scanning...'));
            this.setState({
              deviceId: id,
              serviceId
            });
          });
      }
    }
  }

  writeMessage(message) {
    BleManager.write(
      this.state.deviceId,
      this.state.serviceId,
      this.state.serviceId,
      base64.fromByteArray(message))
      .then(() => {
        // Success code
        console.log('Write: ' + base64.fromByteArray(message));
      })
      .catch((error) => {
        // Failure code
        console.log(error);
      });
  }

  writeMorseMessage(word) {
    this.writeMessage(word.split('').map((char) => { return char.charCodeAt(0) }));
  }

  render() {
    const { connected, red, blue } = this.state;
    return (
      <View style={styles.container}>
        <Text style={styles.welcome}>
          Welcome to Bla!
        </Text>
        <Text style={[styles.status, connected && styles.status_connected]}>
          {connected ? 'CONNECTED' : 'NOT CONNECTED'}
        </Text>
        <View style={styles.row}>
          <TextInput
            style={styles.input}
            value={this.state.morseMessage}
            onChangeText={morseMessage => this.setState({ morseMessage })}
          />
        </View>
        <View style={styles.row}>
          <Button
            onPress={() => {
              this.writeMorseMessage(this.state.morseMessage);
              this.setState({ morseMessage: '' });
            }}
            title="Morse"
            disabled={!this.state.morseMessage}
          />
        </View>
        <View style={styles.row}>
          <LightButton
            color="red"
            onPress={() => {
              if (red) {
                this.writeMessage(RED_LIGHT_OFF)
                this.setState({ red: false });
              } else {
                this.writeMessage(RED_LIGHT_ON);
                this.setState({ red: true });
              }
            }}
            disabled={!connected}
          />
        </View>
        <View style={styles.row}>
          <LightButton
            color="blue"
            onPress={() => {
              if (blue) {
                this.writeMessage(BLUE_LIGHT_OFF)
                this.setState({ blue: false });
              } else {
                this.writeMessage(BLUE_LIGHT_ON);
                this.setState({ blue: true });
              }
            }}
            disabled={!connected}
          />
        </View>
        <View style={styles.row}>
          <Button
            onPress={() => this.writeMessage(POLICE_LIGHTS)}
            title="Police Lights"
            disabled={!connected}
          />
        </View>
        <View style={styles.row}>
          <Button
            onPress={() => this.writeMessage(MORSE_SOS)}
            title="SOS!"
            disabled={!connected}
          />
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5FCFF',
    justifyContent: 'center',
    alignItems: 'center'
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10
  },
  status: {
    textAlign: 'center',
    margin: 10,
    color: 'grey'
  },
  status_connected: {
    color: 'green'
  },
  row: {
    margin: 10,
    alignItems: 'center'
  },
  input: {
    height: 40,
    width: 200
  }
});

AppRegistry.registerComponent('bla', () => bla);
