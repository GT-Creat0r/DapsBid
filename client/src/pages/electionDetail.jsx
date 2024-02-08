import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";

import { useStateContext } from "../context";
import { CustomButton, Loader, CountBox } from "../components";
import { calculateBarPercentage, convertDateTimeFormat, errorCodes } from "../utils";
import { thirdweb } from "../assets";

const ElectionDetail = () => {
  const { state } = useLocation();
  const { contract, address, getVotersAddedInElection, registerVote, getElectionsOrganizedByUser } = useStateContext();

  const [isLoading, setIsLoading] = useState(false);
  const [voteCount, setVoteCount] = useState(state.totalVote);
  const [candidateIndex, setCandidateIndex] = useState(0);
  const [passPhrase, setPassPhrase] = useState('');
  const [electionOrganizedByUser, setElectionOrganizedByUser] = useState(0);
  const [voters, setVoters] = useState([]);

  
  console.log("State of electionDetail: ", state);
  const endTimeFormatted = convertDateTimeFormat(state.endTime.toString());
  const candidates = state.candidates;

  const fetchElectionData = async () => {
    let voterList = await getVotersAddedInElection(state.name);
    let electionOranized = await getElectionsOrganizedByUser(state.organizerAddress);
    // console.log("The Elections Organized by ", state.organizerAddress, " is: ", electionOranized);
    // console.log("The list of voters for ", state.name, " are: ", voterList);
    setElectionOrganizedByUser(electionOranized.length);
    setVoters(voterList);
  }

  useEffect(() => {
    if (contract) {
      fetchElectionData();
      // console.log("Active Election Detail: ", activeElectionDetail);
      // console.log("Past Election Detail: ", pastElectionDetail);
    }
  }, [address, contract]);

  const handleVote = async () => {
    setIsLoading(true);
    try {
      await registerVote(state.name, passPhrase, candidateIndex);
      console.log("Call to Register Vote was successful");
      setIsLoading(false);
    } catch (error) {
        if (error in errorCodes) {
          alert(`Error Code: ${error}. ${errorCodes[error]}`);
          setIsLoading(false);
        }
        console.log("Call to addCandidate failed", error);
    }
  }

  return (
    <div>
      { isLoading && <Loader /> }
      <div className="w-full flex md:flex-row flex-col mt-10 gap-[30px]">
        <div className="flex-1 flex-col">
          <img src={state.imageUrl} alt="electionImage" className="w-full h-[410px] object-cover rounded-xl" />
          <div className="relative w-full h-[5px] bg-[#3a3a43] mt-2">
            <div className="absolute h-full bg-[#4acd8d] rounded-xl" style={{ width: `${calculateBarPercentage(state.totalCandidate, state.candidates.length)}%`, maxWidth: '100%' }}>
            </div>
          </div>
        </div>
        <div className="flex md:w-[150px] w-full flex-wrap justify-between gap-[30px]">
          <CountBox title="End Time" value={endTimeFormatted.time} />
          <CountBox title="Total Vote" value={voteCount} />
          <CountBox title="Unique Parties" value={state.partyInfo.electionPartyCount} />
        </div>
      </div>
      <div className="mt-[60px] flex lg:flex-row flex-col gap-5">
        <div className="flex-[2] flex flex-col gap-[40px]">
          <div>
            <h4 className="font-epilouge font-semibold text-[20px] text-white uppercase">Organized By</h4>
            <div className="mt-[20px] flex flex-row items-center flex-wrap gap-[14px]">
              <div className="w-[52px] h-[52px] flex items-center justify-center rounded-full bg-[#2c2f32] cursor-pointer">
                <img src={thirdweb} alt="user" className="w-[60%] h-[60%] object-contain" />
              </div>
              <div>
                <h4 className="font-epilouge font-semibold text-[14px] text-white break-all">{state.organizerAddress}</h4>
                <p className="mt-[4px] font-epilouge font-normal text-[12px] text-[#808191]">{electionOrganizedByUser} Election(s)</p>
              </div>
            </div>
          </div>
          <div>
            <h4 className="font-epilouge font-semibold text-[20px] text-white uppercase">Motivation</h4>
            <div>
              <p className="font-epilouge font-normal text-[16px] text-[#808191] leading-[26px] text-justify">{state.description}</p>
            </div>
          </div>
          <div>
            <h4 className="font-epilouge font-semibold text-[20px] text-white uppercase">Candidates</h4>
            <div className="mt-[20px] flex flex-col gap-4">
              { candidates.length > 0 ? candidates.map((candidate, index) => (
                <div key={index} className="flex flex-col md:flex-row border rounded-[15px] bg-[#1c1c24]">
                  { /** console.log("Candidate", index, " info: ", candidate) **/ }
                  <div className="md:w-1/2 p-4">
                    <img src={candidate.candidateImage} alt="electionImage" className='w-full h-auto md:h-auto md:w-full rounded-[15px]' />
                  </div>
                  <div className="md:w-1/2 p-4">
                    <div className="flex flex-col h-full">
                      <div className="flex-1 p-2">
                        <h2 className="font-epilouge font-semibold text-[20px] text-white uppercase">Candidate ID</h2>
                        <p className="font-epilouge font-normal text-[16px] text-[#808191] leading-[26px] text-justify">{index}</p>
                      </div>
                      <div className="flex-1 p-2">
                        <h2 className="font-epilouge font-semibold text-[20px] text-white uppercase">Name</h2>
                        <p className="font-epilouge font-normal text-[16px] text-[#808191] leading-[26px] text-justify">{candidate.candidateName}</p>
                      </div>
                      <div className="flex-1 p-2">
                        <h2 className="font-epilouge font-semibold text-[20px] text-white uppercase">Description</h2>
                        <p className="font-epilouge font-normal text-[16px] text-[#808191] leading-[26px] text-justify">{candidate.candidateDescription}</p>
                      </div>
                      <div className="flex-1 p-2">
                        <h2 className="font-epilouge font-semibold text-[20px] text-white uppercase">Age</h2>
                        <p className="font-epilouge font-normal text-[16px] text-[#808191] leading-[26px] text-justify">{candidate.candidateAge < 1 ? 'Not Available' : candidate.candidateAge}</p>
                      </div>
                      <div className="flex-1 p-2">
                        <h2 className="font-epilouge font-semibold text-[20px] text-white uppercase">Vote Count</h2>
                        <p className="font-epilouge font-normal text-[16px] text-[#808191] leading-[26px] text-justify">{candidate.candidateVoteCount}</p>
                      </div>
                      <div className="flex-1 p-2">
                        <h2 className="font-epilouge font-semibold text-[20px] text-white uppercase">Party</h2>
                        <p className="font-epilouge font-normal text-[16px] text-[#808191] leading-[26px] text-justify">{candidate.candidateParty}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )) : (
                <p className="font-epilouge font-normal text-[20px] p-4 text-[#808191] bg-[#1c1c24] rounded-[10px] leading-[26px] text-center">No Candidates Added</p>
              ) }
            </div>
          </div>
          <div className="flex-1">
            <h4 className="font-epilouge font-semibold text-[20px] text-white uppercase">Vote</h4>
            { state.timeLeft != '0' ? (
              <div className="mt-[20px] flex flex-col p-4 bg-[#1c1c24] rounded-[10px]">
                <p className="font-epilouge font-medium text-[20px] leading-[30px] text-center text-[#808191]">Cast A Vote</p>
                <div className="mt-[30px]">
                  <input
                    type="number"
                    placeholder="Candidate ID"
                    step="1"
                    className="w-full py-[10px] mt-[10px] sm:px-[20xpx] px-[15px] outline-none border-[1px] border-[#3a3a43] bg-transparent font-epilouge text-white text-[20px] leading-[30px] placeholder:text-[#4b5264] rounded-[10px]"
                    value={candidateIndex}
                    onChange={(e) => setCandidateIndex(e.target.value)}
                  />
                  <input
                    type="password"
                    placeholder="Eletction Pass Phrase"
                    className="w-full py-[10px] mt-[10px] sm:px-[20xpx] px-[15px] outline-none border-[1px] border-[#3a3a43] bg-transparent font-epilouge text-white text-[20px] leading-[30px] placeholder:text-[#4b5264] rounded-[10px]"
                    value={passPhrase}
                    onChange={(e) => setPassPhrase(e.target.value)}
                  />
                  <div className="my-[20px] p-4 bg-[#13131a] rounded-[10px]">
                    <h4 className="font-epilouge font-semibold text-[18px] leading-[22px] text-white">Cast a vote to support the deserving candidate</h4>
                    <p className="mt-[20px] font-epilouge font-normal leading-[22px] text-[#808191]">Voter(s)</p>
                    { voters.length > 0 ? voters.map((voter, index) => (
                      <div key={index}>
                        <p className="mt-[10px] font-epilouge font-normal leading-[22px] text-[#808191] truncate">{index+1}. {voter}</p>
                      </div>
                    )) : (
                      <div>
                        <p className="mt-[20px] font-epilouge font-normal leading-[22px] text-[#808191]">Be the first one to vote!</p>
                      </div>
                    ) }
                  </div>
                  <CustomButton 
                    btnType="button"
                    title="Cast Vote"
                    styles="w-full bg-[#8c6dfd]"
                    handleClick={handleVote}
                  />
                </div>
              </div>
            ) : (
              <div className="my-[20px] p-4 bg-[#13131a] rounded-[10px]">
                <p className="mt-[20px] font-epilouge font-normal leading-[22px] text-[#808191]">Voter(s)</p>
                  { voters.length > 0 ? voters.map((voter, index) => (
                    <div key={index}>
                      <p className="mt-[10px] font-epilouge font-normal leading-[22px] text-[#808191] truncate">{index+1}. {voter}</p>
                    </div>
                  )) : (
                    <div>
                      <p className="mt-[10px] font-epilouge font-normal leading-[22px] text-[#808191] truncate">No votes submitted to the Election</p>
                    </div>
                  ) }
                  <p className="font-epilouge font-normal mt-[20px] p-4 text-[20px] text-[#808191] bg-[#1c1c24] rounded-[10px] leading-[26px] text-center">Voting Window Has Closed</p>
              </div>
            ) }
          </div>
        </div>
      </div>
    </div>
  );
}

export default ElectionDetail;

