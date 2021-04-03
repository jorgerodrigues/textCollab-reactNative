import { Text } from 'react-native';
import React from 'react';
import * as Network from 'expo-network';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const receiveUpdatedMessageAndUpdateState = async (
  msg,
  userAndPosition
) => {
  try {
    await AsyncStorage.setItem('msg', msg);
    await AsyncStorage.setItem(
      'userAndPosition',
      JSON.stringify(userAndPosition)
    );
    console.log('Data saved locally');
  } catch (e) {
    console.log('Error saving the data locally');
    console.log(e);
  }
};

export const retrieveLocallySavedUpdate = async () => {
  try {
    const msg = await AsyncStorage.getItem('msg');
    const userAndPosition = await AsyncStorage.getItem('userAndPosition');
    if (value !== null) {
      return msg, userAndPosition;
    }
  } catch (e) {
    console.log('Error reading value', e);
    // error reading value
  }
};

/*
The function below takes the full message and position and returns it into JSX with the
user tag on to show the position
*/
export const modifyStringAndAddCursors = (fullMessage, userAndPosition) => {
  let newMessage = '';
  newMessage = fullMessage;
  let newJSX;
  userAndPosition.forEach((item) => {
    newJSX = (
      <Text>
        <Text>{newMessage.slice(0, item.position)}</Text>
        <Text style={{ fontWeight: 'bold' }}>{` | ${item.name} | `}</Text>
        <Text>{newMessage.slice(item.position)}</Text>
      </Text>
    );
  });

  return newJSX;
};

/*
The function below cleans up the previous user tags before submiting
*/
export const cleanUpStringBeforeSubmitting = (string) => {
  const re = /\|(.*?)\|/gi;
  const newString = string.replaceAll(re, '');
  return newString;
};

export const checkPhoneConnectivity = async () => {
  const networkStatus = await Network.getNetworkStateAsync();
  return networkStatus;
};
