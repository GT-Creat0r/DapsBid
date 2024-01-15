import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { useStateContext } from '../context';

import { DisplayElection } from '../components';

const Home = () => {
  const navigate = useNavigate();
  const { address, contract, getElectionDetails, getActiveAndPastElectionNames, getTimeLeftForElection } = useStateContext();
  const [isLoading, setIsLoading] = useState(true);  
  const [activeElectionDetail, setActiveElectionDetail] = useState([]);
  const [pastElectionDetail, setPastElectionDetail] = useState([]);

  const fetchElection = async () => {
    setIsLoading(true);
    /* let startTime = new Date();
    const allElectionNames = await getAllElectionNames();
    console.log("All the names of elections conducted are: ", allElectionNames);
    setIsLoading(false);
    const electionOrganizedByUser = await getElectionOrganizedByUser(address);
    console.log("All the names of elections conducted by ", address, " and election names: ", electionOrganizedByUser);
    const activeAndPastElectionNames = await getActiveAndPastElectionNames();
    console.log("All the names of active and past elections are: ", activeAndPastElectionNames);
    const electionDetailTest = await getElectionDetails("test");
    console.log("Election detail for dummy election (does not work): ", electionDetailTest);
    const timeLeftForElectionTest = await getTimeLeftForElection("test");
    console.log("Time left for dummy election (does not work): ", Number(timeLeftForElectionTest));
    const candidatesForElectionTest = await getCandidatesForElection("test");
    console.log("Candidates for dummy election (does not work): ", candidatesForElectionTest);
    let time = new Date() - startTime;
    console.log("Time taken is (in milliseconds): ", time); */
    let activeAndPastElectionNames = await getActiveAndPastElectionNames();
    let activeElections = activeAndPastElectionNames[0];
    let pastElections = activeAndPastElectionNames[1];
    // console.log("Active Election Names conducted are: ", activeElections);
    // console.log("Past Election Names conducted are: ", pastElections);
    let activeElectionDetailArray = [];
    let pastElectionDetailArray = [];
    if (activeElections.length > 0) {
      for (let activeElectionIndex in activeElections) {
        // console.log("Name of the election is: ", electionNames[electionNameIndex]);
        let electionDetail = await getElectionDetails(activeElections[activeElectionIndex]);
        let electionCandidateArray = electionDetail.electionCandidates;
        let uniqueParty = {
          electionPartyCount: 0,
          electionParty: [],
        }
        for (let candidate in electionCandidateArray) {
          if (!uniqueParty.electionParty.includes(electionCandidateArray[candidate].candidateParty)) {
            uniqueParty.electionPartyCount += 1;
            uniqueParty.electionParty.push(electionCandidateArray[candidate].candidateParty);
          }
        }
        // let electionTimeLeft = await getTimeLeftForElection(activeElections[activeElectionIndex]);
        // let candidates = await getCandidatesForElection(electionName);
        // let organizer = await getElectionOrganizedByUser(electionName);
        let activeElection = {
          name: electionDetail.electionName,
          description: electionDetail.electionDescription,
          id: electionDetail.electionId,
          imageUrl: electionDetail.electionImage,
          organizerAddress: electionDetail.electionOrganizerAddress,
          totalCandidate: electionDetail.electionTotalCandidate,
          totalVote: electionDetail.electionTotalVote,
          startTime: electionDetail.electionStartTime,
          endTime: electionDetail.electionEndTime,
          timeLeft: electionDetail.electionTimeLeft,
          passPhrase: electionDetail.electionPassPhrase,
          candidates: electionDetail.electionCandidates,
          partyInfo: uniqueParty,
        }
        // console.log("Election Details are: ", election);
        activeElectionDetailArray.push(activeElection);
        // console.log("Election Detail: ", electionDetail);
      }
      setActiveElectionDetail(activeElectionDetailArray);
    } else {
      setActiveElectionDetail([]);
    }
    if (pastElections.length > 0) {
      for (let pastElectionIndex in pastElections) {
        // console.log("Name of the election is: ", electionNames[electionNameIndex]);
        let electionDetail = await getElectionDetails(pastElections[pastElectionIndex]);
        let electionCandidateArray = electionDetail.electionCandidates;
        let uniqueParty = {
          electionPartyCount: 0,
          electionParty: [],
        }
        for (let candidate in electionCandidateArray) {
          if (!uniqueParty.electionParty.includes(electionCandidateArray[candidate].candidateParty)) {
            uniqueParty.electionPartyCount += 1;
            uniqueParty.electionParty.push(electionCandidateArray[candidate].candidateParty);
          }
        }
        // let candidates = await getCandidatesForElection(electionName);
        // let organizer = await getElectionOrganizedByUser(electionName);
        let pastElection = {
          name: electionDetail.electionName,
          description: electionDetail.electionDescription,
          id: electionDetail.electionId,
          imageUrl: electionDetail.electionImage,
          organizerAddress: electionDetail.electionOrganizerAddress,
          totalCandidate: electionDetail.electionTotalCandidate,
          totalVote: electionDetail.electionTotalVote,
          startTime: electionDetail.electionStartTime,
          endTime: electionDetail.electionEndTime,
          timeLeft: electionDetail.electionTimeLeft,
          passPhrase: electionDetail.electionPassPhrase,
          candidates: electionDetail.electionCandidates,
          partyInfo: uniqueParty,
        }
        // console.log("Election Details are: ", election);
        pastElectionDetailArray.push(pastElection);
        // console.log("Election Detail: ", electionDetail);
      }
      setPastElectionDetail(pastElectionDetailArray);
    } else {
      setPastElectionDetail([]);
    }
    console.log("Active Election Details are: ", activeElectionDetailArray);
    console.log("Past Election Details are: ", pastElectionDetailArray);
    setIsLoading(false);
  }
  
  useEffect(() => {
    if (contract) {
      fetchElection();
      // console.log("Active Election Detail: ", activeElectionDetail);
      // console.log("Past Election Detail: ", pastElectionDetail);
    }
  }, [address, contract]);

  return (
    <DisplayElection 
      isLoading={isLoading}
      activeElectionDetail={activeElectionDetail}
      pastElectionDetail={pastElectionDetail}
      activeElectionCount={activeElectionDetail.length}
      pastElectionCount={pastElectionDetail.length}
    />
  );
}

export default Home;