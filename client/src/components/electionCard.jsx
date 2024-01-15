import React from 'react';

import { tagType, thirdweb } from '../assets';
import { convertUnixToDateTime } from '../utils';
import { CandiadateCard } from '.';

const ElectionCard = ({ id, description, imageUrl, name, organizerAddress, startTime, endTime, timeLeft, totalVote, totalCandidate, candidates, handleClick }) => {
  // const remainingDays = timeLeft === 0 ? 0 : daysLeft(timeLeft);
  const canVote = timeLeft > 0 ? "Voting Open" : "Voting Closed";
  const startDateTime = convertUnixToDateTime(startTime);
  const startDateTimeFormat = `${startDateTime.month} ${startDateTime.date} ${startDateTime.year} ${startDateTime.hours}:${startDateTime.minutes}`
  const endDateTime = convertUnixToDateTime(endTime);
  const endDateTimeFormat = `${endDateTime.month} ${endDateTime.date} ${endDateTime.year} ${endDateTime.hours}:${endDateTime.minutes}`
  const timeLeftConvert = convertUnixToDateTime(timeLeft);
  // const testDateTime = new Date(0000000000).toString();
  // console.log("Test Start Date: ", testDateTime);
  console.log("The time left for election is: " ,timeLeftConvert);
  // console.log("Start Time and End Time: ", startDateTimeFormat, endDateTimeFormat);  

  return (
      <div className='sm:w-[288px] w-full rounded-[15px] bg-[#1c1c24] cursor-pointer p-4' onClick={handleClick}>
          <img src={imageUrl} alt="electionImage" className='w-full h-[158px] object-cover rounded-[15px]' />
          <div className='flex flex-col p-4'>
              <div className='flex flex-row items-center mb-[18px]'>
                  <img src={tagType} alt="tag" className='w-[17px] h-[17px] object-contain' />
                  <p className='ml-[12px] mt-[2px] font-epilouge font-medium text-[12px] text-[#808191]'>{canVote}</p>
              </div>
              <div className='block'>
                  <h3 className='font-epilouge font-semibold text-[16px] text-white text-left leading-[26px] truncate'>Election Name: {name}</h3>
                  <p className='mt-[5px] font-epilouge font-normal text-[#808191] text-left leading-[18px] truncate'>Description: {description}</p>
                  <p className='mt-[5px] font-epilouge font-normal text-[#808191] text-left leading-[18px] truncate'>Election ID: {id}</p>
              </div>
              <div className='flex justify-between flex-wrap mt-[15px]'>
                  <div className='flex flex-col'>
                      <h4 className='font-epilouge font-semibold text-[14px] text-[#b2b3bd] leading-[22px]'>Total Votes: {totalVote}</h4>
                      <p className='mt-[3px] font-epilouge font-normal text-[12px] leading-[18px] text-[#808191] sm:max-w-[120px] truncate'>{candidates.length} Candidate(s)</p>
                      <p className='mt-[3px] font-epilouge font-normal text-[12px] leading-[18px] text-[#808191] sm:max-w-[120px] truncate'>{totalCandidate} Total</p>
                  </div>
                  <div className='flex flex-col'>
                      <p className='font-epilouge font-semibold text-[14px] text-[#b2b3bd] leading-[22px] truncate'>{startDateTimeFormat}</p>
                      { /* <h4 className='mt-[3px] font-epilouge font-semibold text-[14px] leading-[18px] text-[#b2b3bd] sm:max-w-[120px] truncate'>{startDateTimeFormat.date} {startDateTimeFormat.time}</h4> */ }
                      <p className='mt-[3px] font-epilouge font-normal text-[12px] leading-[18px] text-[#808191] sm:max-w-[120px] truncate'>{endDateTimeFormat}</p>
                      <p className='mt-[3px] font-epilouge font-normal text-[12px] leading-[18px] text-[#808191] sm:max-w-[120px] truncate'>mm dd yyyy hh:mm</p>
                  </div>
              </div>
              <div className='flex items-center mt-[20px] gap-[12px]'>
                  <div className='w-[30px] h-[30px] rounded-full flex justify-center items-center bg-[#13131a]'>
                      <img src={thirdweb} alt="user" className='w-1/2 h-1/2 object-contain' />
                  </div>
                  <p className='flex-1 font-epilouge font-normal text-[12px] text-[#808191] truncate'>by <span className='text-[#b2b3bd]'>{organizerAddress}</span></p>
              </div>
          </div>
      </div>
  )
}

export default ElectionCard;
