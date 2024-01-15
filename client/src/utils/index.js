export const daysLeft = (minutes) => {
  const days = Math.floor(minutes / (24 * 60));
    
  // Calculate remaining minutes after calculating days
  let remainingMinutes = minutes % (24 * 60);
  
  // Calculate hours
  const hours = Math.floor(remainingMinutes / 60);
  
  // Calculate remaining minutes after calculating hours
  const finalMinutes = remainingMinutes % 60;
  return `${days} days ${hours.toString().padStart(2, '0')} hours ${finalMinutes.toString().padStart(2, '0')} minutes`;
};

export const convertDateTimeFormat = (unixToString) => {
  const dateArray = unixToString.split(" ");
  const timeArray = dateArray[4].split(":");
  const time = `${timeArray[0]}:${timeArray[1]}`;
  const date = `${dateArray[1]} ${dateArray[2]} ${dateArray[3]}`;
  return {
    date,
    time,
  };
}

export const convertUnixToDateTime = (unixTimeStamp) => {
  const unixValue = new Date(unixTimeStamp * 1000);
  var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const year = unixValue.getFullYear();
  const month = months[unixValue.getMonth()];
  const date = unixValue.getDate();
  const hours = unixValue.getHours();
  const minutes = "0" + unixValue.getMinutes();
  const seconds = "0" + unixValue.getSeconds();
  return {
    year,
    month,
    date,
    hours,
    minutes,
    seconds
  }
}

export const calculateBarPercentage = (goal, raisedAmount) => {
  const percentage = Math.round((raisedAmount * 100) / goal);

  return percentage;
};

export const checkIfImage = (url, callback) => {
  const img = new Image();
  img.src = url;

  if (img.complete) callback(true);

  img.onload = () => callback(true);
  img.onerror = () => callback(false);
};

// Need to update the error codes and add edge cases for insufficient values and such
export const errorCodes = {
  "0": "User Rejected Transaction. Looks like you have rejected the transaction, please try again.",
  "1": "Invalid Organizer. The organizer address is not valid",
  "2": "Insufficient Value for organizing election. The Election duration is less than the lower bound of 10 minutes",
  "3": "Insufficient Value for organizing election. The Election Candidate Count is less than the lower bound of 2",
  "4": "Invalid PassPhrase. Incorrect Pass Phrase Entered.",
  "5": "Candidate Index Out of Bound. The candidate index you are trying to vote does not exist.",
  "6": "Duplicate Name. The Election Name you are trying to add already exists.",
  "7": "Zero Candidate. The Election has no candidates.",
  "8": "Candidate Overflow. The Election has reached the maximum number of candidates.",
  "9": "Unexpected Error. Please try again.",
  "10": "Already Voted. You have already voted in this election.",
  "11": "Election Ended. The Election has ended.",
  "12": "Empty PassPhrase. The PassPhrase cannot be empty.",
};
