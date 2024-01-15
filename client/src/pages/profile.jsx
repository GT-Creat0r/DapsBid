import React, { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import { useStateContext } from '../context';

import { DisplayElection } from '../components';

const Profile = () => {
  const navigate = useNavigate();
  const { address, contract, getElectionOrganizedByUser, getActiveAndPastElectionNames, getTimeLeftForElection, getElectionDetails } = useStateContext();
  const [isLoading, setIsLoading] = useState(true);  
  const [activeElectionDetail, setactiveElectionDetail] = useState([])
  const [pastElectionDetail, setpastElectionDetail] = useState([])

  const fetchUserElection = async () => {
    setIsLoading(true);
    /* const electionOrganizedByUser = await getElectionOrganizedByUser(address);
    console.log("All the names of elections conducted by ", address, " and election names: ", electionOrganizedByUser);
    const activeAndPastElectionNames = await getActiveAndPastElectionNames();
    console.log("All the names of active and past elections are: ", activeAndPastElectionNames);
    const timeLeftForElectionTest = await getTimeLeftForElection("test");
    console.log("Time left for dummy election (does not work): ", Number(timeLeftForElectionTest));
    const candidatesForElectionTest = await getCandidatesForElection("test");
    console.log("Candidates for dummy election (does not work): ", candidatesForElectionTest); */
    if (address) {
      let electionOrganizedByUser = await getElectionOrganizedByUser(address);
      // console.log("All the names of elections conducted by ", address, " and election names: ", electionOrganizedByUser);
      let activeElectionDetailArray = [];
      let pastElectionDetailArray = [];
      for (let electionNameIndex in electionOrganizedByUser) {
        let electionDetail = await getElectionDetails(electionOrganizedByUser[electionNameIndex]);
        let electionTimeLeft = await getTimeLeftForElection(electionOrganizedByUser[electionNameIndex]);
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
        let election = {
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
        if (electionTimeLeft > 0) {
          activeElectionDetailArray.push(election);
        } else {
          pastElectionDetailArray.push(election);
        }
      }
      // console.log("Active Election Detail: ", activeElectionDetail);
      // console.log("Past Election Detail: ", pastElectionDetail);
      setactiveElectionDetail(activeElectionDetailArray);
      setpastElectionDetail(pastElectionDetailArray);
      setIsLoading(false);
    } else {
      setIsLoading(false);
      // console.log("No Account linked right now!");
    }
  }

  useEffect(() => {
    if (contract) {
      fetchUserElection();
    }
  }, [address, contract]);
  
  return (
    <DisplayElection 
      title="Your Election"
      isLoading={isLoading}
      activeElectionDetail={activeElectionDetail}
      pastElectionDetail={pastElectionDetail}
      activeElectionCount={activeElectionDetail.length}
      pastElectionCount={pastElectionDetail.length}
      isProfile
    />
  );

}

export default Profile;

