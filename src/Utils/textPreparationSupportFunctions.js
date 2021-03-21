/* This function takes the conciliated text, split it into different text parts according to the user's position
in order to place the user cursor properly in the TextInput.
*/
export const sliceTextBasedOnUserPosition = (fullMessage, userAndPosition) => {
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
/*
This function is used in order to sort the array of positions based on the position.
*/
export const comparePositionToOrder = (a, b) => {
  return a.position > b.position ? 1 : -1;
};
