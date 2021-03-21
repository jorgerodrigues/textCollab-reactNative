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

const CollabText = () => {
  const socket = io(BACKEND_PROD);

  const [fullText, setFullText] = useState();
  const [localText, setLocalText] = useState();
  const [cursorPosition, setCursorPosition] = useState(0);
  const [userName, setUserName] = useState();
  const [userList, setUserList] = useState();
  const id = useRef(`${Date.now()}`);

  useEffect(() => {
    receiveUpdatedTextInfo();
  }, []);

  const handleTextChange = (text) => {
    setLocalText(text);
    console.log('TEXT FIELD: ', localText);
    if (localText !== fullText) {
      setFullText(localText);
      // console.log('Sending message: ', fullText);
      socket.emit('messageUpdated', {
        user: userName,
        msg: text,
        idRemote: id.current,
        cursorPosition: cursorPosition.selection.end,
      });
    }
  };

  const receiveUpdatedTextInfo = () => {
    socket.on('textUpdated', (msg, userAndPosition) => {
      getUserList(userAndPosition);
      sliceTextBasedOnUserPosition(msg.msg, userAndPosition);
      if (id.current !== msg.idRemote) {
        setLocalText(msg.msg);
      } else {
        console.log('Same editor');
      }
    });
  };

  const getUserList = (userAndPosition) => {
    const userListLocal = userAndPosition.map((item) => {
      return item.name;
    });
    setUserList(userListLocal);
  };

  const comparePositionToOrder = (a, b) => {
    return a.position > b.position ? 1 : -1;
  };

  const sliceTextBasedOnUserPosition = (fullMessage, userAndPosition) => {
    /* This function takes the conciliated text, split it into different text parts according to the user's position
    in order to place the user cursor properly in the TextInput.
    */
    const newSortedArray = userAndPosition.sort(comparePositionToOrder);
    var slicedText = [];
    if (fullMessage != undefined) {
      newSortedArray.forEach((item, index) => {
        if (index == 0) {
          slicedText.push(fullMessage.slice(0, newSortedArray[index].position));
        } else {
          slicedText.push(
            fullMessage.slice(newSortedArray[index - 1].position),
            newSortedArray[index - 1].position
          );
        }
      });
    }
    return slicedText;
  };

  return (
    <ScrollView>
      <KeyboardAvoidingView style={styles.view} behavior={'position'}>
        <View
          onPress={() => {
            Keyboard.dismiss();
          }}>
          <Text style={styles.label}>Your name:</Text>
          <TextInput
            style={styles.input}
            onChangeText={(name) => {
              setUserName(name);
            }}></TextInput>
          <Text style={styles.label}>Users online:</Text>
          <View>
            {userList != undefined ? (
              userList.map((userName) => {
                return <Text>{userName}</Text>;
              })
            ) : (
              <Text></Text>
            )}
          </View>
        </View>
        <TextInput
          style={styles.inputBox}
          multiline={true}
          onChangeText={(text) => {
            handleTextChange(text);
          }}
          onSelectionChange={({ nativeEvent: { selection } }) => {
            setCursorPosition({ selection });
          }}
          onEndEditing={() => {
            Keyboard.dismiss();
          }}
          value={localText}></TextInput>
      </KeyboardAvoidingView>
    </ScrollView>
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
