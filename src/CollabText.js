import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  TextInput,
  ScrollView,
  Text,
  KeyboardAvoidingView,
  View,
  Keyboard,
} from 'react-native';
import io from 'socket.io-client';
import { BACKEND_PROD, DEV } from './config/env';
import {
  cleanUpStringBeforeSubmitting,
  modifyStringAndAddCursors,
  checkPhoneConnectivity,
  receiveUpdatedMessageAndUpdateState,
} from './Utils/textPreparationSupportFunctions';

const CollabText = () => {
  const socket = io(BACKEND_PROD);
  const [fullText, setFullText] = useState();
  const [localText, setLocalText] = useState('');
  const [cursorPosition, setCursorPosition] = useState(0);
  const [userName, setUserName] = useState();
  const [userList, setUserList] = useState();
  const [simplified, setSimplified] = useState(false);
  const [newText, setNewText] = useState('');
  const [connectionStatus, setConnectionStatus] = useState({
    isConnected: true,
    isInternetReachable: true,
    type: 'WIFI',
  });
  const id = useRef(`${Date.now()}`);

  // This useEffect triggers the process of listening for an update from the server
  useEffect(() => {
    try {
      receiveUpdatedTextInfo();
    } catch {
      receiveUpdatedMessageAndUpdateState(localText, {
        name: userName,
        position: cursorPosition.selection.end,
      });
    }
  }, []);

  // This useEffect is responsible for emitting an update after the text is cleaned up
  useEffect(() => {
    handleTextChange();
  }, [simplified]);

  // This useEffect is responsible for checking the connection status
  useEffect(() => {
    (async function checkNetwork() {
      const phoneStatus = await checkPhoneConnectivity();
      console.log(phoneStatus);
      setConnectionStatus(phoneStatus);
    })();
  }, []);

  const handleTextChange = () => {
    if (localText !== fullText && cursorPosition.selection !== undefined) {
      try {
        socket.emit('messageUpdated', {
          user: userName,
          msg: localText,
          idRemote: id.current,
          cursorPosition: cursorPosition.selection.end,
        });
        setFullText(localText);
      } catch (e) {
        receiveUpdatedMessageAndUpdateState(localText, {
          name: userName,
          position: cursorPosition.selection.end,
        });
      }
    }
  };

  const receiveUpdatedTextInfo = () => {
    socket.on('textUpdated', (msg, userAndPosition) => {
      getUserList(userAndPosition);
      if (id.current !== msg.idRemote) {
        setNewText('');
        const conciliatedText = modifyStringAndAddCursors(
          msg.msg,
          userAndPosition
        );
        setLocalText(msg.msg);
        setFullText(msg.msg);
        setNewText(conciliatedText);
      } else {
        console.log('Same device');
      }
    });
  };

  const getUserList = (userAndPosition) => {
    // setUserAndPositionState(userAndPosition);
    const userListLocal = userAndPosition.map((item) => {
      return item.name;
    });
    setUserList(userListLocal);
  };

  return (
    <KeyboardAvoidingView style={styles.view} behavior={'position'}>
      <ScrollView>
        <View
          onPress={() => {
            Keyboard.dismiss();
          }}>
          <Text style={styles.label}>
            {connectionStatus.isConnected == false ? 'OFFLINE' : 'Connected'}
          </Text>
          <Text style={styles.label}>Your name:</Text>
          <TextInput
            onBlur={Keyboard.dismiss()}
            style={styles.input}
            onChangeText={(name) => {
              setUserName(name);
            }}></TextInput>
          <Text style={styles.label}>Users online:</Text>
          <View>
            {userList != undefined ? (
              userList.map((userName, index) => {
                return <Text key={index}>{userName}</Text>;
              })
            ) : (
              <Text></Text>
            )}
          </View>
        </View>
        <TextInput
          style={styles.inputBox}
          multiline={true}
          returnKeyType={'done'}
          onBlur={(e) => {
            console.log('RAW TEXT', e.nativeEvent.text);
            Keyboard.dismiss();
            const cleanedUpText = cleanUpStringBeforeSubmitting(
              e.nativeEvent.text
            );
            setLocalText(cleanedUpText);
            setSimplified(!simplified);
            console.log('LOCAL CLEANDUP', localText);
            // handleTextChange();
          }}
          onSelectionChange={({ nativeEvent: { selection } }) => {
            setCursorPosition({ selection });
          }}
          onChangeText={(text) => {
            setLocalText(text);
          }}>
          <Text>{newText}</Text>
        </TextInput>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  view: {
    flex: 1,
    marginTop: 100,
  },
  inputBox: {
    marginTop: 40,
    backgroundColor: '#E9F1F7',
    borderRadius: 10,
    width: 300,
    height: 250,
    fontSize: 16,
    paddingHorizontal: 10,
  },
  userCursor: {
    fontWeight: 'bold',
    color: 'purple',
    backgroundColor: '#dddddd',
  },
  label: {
    marginTop: 20,
    fontSize: 16,
  },
  input: {
    backgroundColor: '#E9F1F7',
    borderRadius: 10,
    width: 300,
    height: 30,
    paddingHorizontal: 10,
  },
});

export default CollabText;
