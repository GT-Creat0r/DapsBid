import React, { useContext, createContext } from 'react';

import { useAddress, useContract, useMetamask, useContractWrite } from '@thirdweb-dev/react';

// import { ethers } from 'ethers';

const StateContext = createContext();

export const StateContextProvider = ({ children }) => {
    const USER_REJECTION_MESSAGE = "user rejected transaction";
    let ERROR_CODE = -1;
    const { contract } = useContract('0x41AA1F0AFc23A5fb3109c086f8A15CEc80E2E1C8');
    const { mutateAsync: setOrganizer } = useContractWrite(contract, 'setOrganizer');
    const { mutateAsync: organizeElection } = useContractWrite(contract, 'organizeElection');
    const { mutateAsync: addCandidate } = useContractWrite(contract, "addCandidate");
    const { mutateAsync: castVote } = useContractWrite(contract, "castVote");

    // TODO: The input field for functions 'organizeElection' and 'addCandidate' has been changed
    // TODO: Make sure the input field for those functions are adjusted as per the need
    // TODO: Make sure to throw errors based on the error message from the contract and
    // TODO: display the error message in the component and have a library that beautifies the error message.
    // TODO: Implement a function that gets the details of the election and the candidates for the election
    // TODO: Implement a function that gets the addresses of the voters that has voted in the election
    // TODO: Implement a function that gets the names of the election that has been organized by the calling user.
    // TODO: Icons (in svg format) required: 1. Add Candidate, 2. Add Election, 3. Cast Vote, 4. View Election, 5. View Profile, 6. View All Election, 7. View User Election

    const address = useAddress();
    const connect = useMetamask();

    const addOrganizer = async (form) => {
        // proable errors: none
        try {
            const data = await setOrganizer({
                args: [form.address]
            })
            console.info("Call to setOrganizer successful", data);
        } catch (error) {
            if (error.message.includes(USER_REJECTION_MESSAGE)) {
                ERROR_CODE = 0;
                throw(ERROR_CODE);
            } else {
                console.log("Unexpected Error while calling addOrganizer function from ./context directory. Error: ", error);
                throw(error);
            }
            // console.error("Call to setOrganizer failed. Called from ./context directory", error);
        }
    }

    const addElection = async (form) => {
        // proable errors: emptyPassPhrase, insufficientValues (duration and number of candidates), invalidOrganizer, unexpectedError 
        // params: _electionName, _totalCandidate, _electionDurationInMinutes, _electionPassPhrase, _electionDescription, _electionImage
        try {
            const addElection = await organizeElection({
                args: [form.electionName, form.totalCandidate, form.electionDurationInMinutes, form.electionPassPhrase, form.electionDescription, form.electionImage]
            });
            console.info("Call to organizeElection successful", addElection);
        } catch (error) {
            console.log(error);
            if (error.message.includes(USER_REJECTION_MESSAGE)) {
                ERROR_CODE = 0;
                throw(ERROR_CODE);
            } else if (error.message.includes("ElectionV2__InvalidOrganizer")) {
                ERROR_CODE = 1;
                throw(ERROR_CODE);
            } else if (error.message.includes("ElectionV2__EmptyPassPhrase")) {
                ERROR_CODE = 12;
                throw(ERROR_CODE);
            } else if (error.message.includes("ElectionV2__InsufficientValue") && error.message.includes("Election Duration")) {
                ERROR_CODE = 2;
                throw(ERROR_CODE);
            } else if (error.message.includes("ElectionV2__InsufficientValue") && error.message.includes("Total Candidate")) {
                ERROR_CODE = 3;
                throw(ERROR_CODE);
            } else if (error.message.includes("ElectionV2__DuplicateName")) {
                ERROR_CODE = 6;
                throw(ERROR_CODE);
            } else if (error.message.includes("ElectionV2__UnexpectedError")) {
                console.log("UnexpectedError error message: ", error.message);
                ERROR_CODE = 9;
                throw(ERROR_CODE);
            }
            else {
                console.log("Unexpected Error while calling addElection function from ./context directory. Error: ", error);
                throw(error);
            }
            // console.error("Call to organizeElection failed. Called from ./context directory", error);
            // throw(error); // we need to throw the error so that the error can be caught in the try catch block in the component.
        }
    }

    const registerCandidate = async (form) => {
        // proable errors: invalidOrganizer, electionEnded, candidateOverflow
        // params: _electionName, _candidateName, _candidateParty, _candidateAge, _candidateDescription, _candidateImage
        try {
            const registerCandidate = await addCandidate({
                args: [form.electionName, form.candidateName, form.candidateParty, form.candidateAge, form.candidateDescription, form.candidateImage]
            });
            console.info("Call to addCandidate successful", registerCandidate);
        } catch (error) {
            if (error.message.includes(USER_REJECTION_MESSAGE)) {
                ERROR_CODE = 0;
                throw(ERROR_CODE);
            } else if (error.message.includes("ElectionV2__InvalidOrganizer")) {
                ERROR_CODE = 1;
                throw(ERROR_CODE);
            } else if (error.message.includes("ElectionV2__ElectionEnded")) {
                ERROR_CODE = 11;
                throw(ERROR_CODE);
            } else if (error.message.includes("ElectionV2__CandidateOverflow")) {
                ERROR_CODE = 8;
                throw(ERROR_CODE);
            } else if (error.message.includes("ElectionV2__UnexpectedError")) {
                console.log("UnexpectedError error message: ", error.message);
                ERROR_CODE = 9;
                throw(ERROR_CODE);
            } else {
                console.log("Unexpected Error while calling registerCandidate function from ./context directory. Error: ", error);
                throw(error);
            }
            // console.error("Call to addCandidate failed. Called from ./context directory", error);
        }
    }

    const registerVote = async (electionName, electionPassPhrase, candidateIndex) => {
        // proable errors: zeroCandidate, electionEnded, invalidPassPhrase, alreadyVoted, candidateIndexOutOfBound
        // params: _electionName, _electionPassPhrase, _candidateIndex
        try {
            const registerVote = await castVote({
                args: [electionName, electionPassPhrase, candidateIndex]
            });
            console.info("Call to registerVote successful and updated the displayAllElection array", registerVote);
        } catch (error) {
            if (error.message.includes(USER_REJECTION_MESSAGE)) {
                ERROR_CODE = 0;
                throw(ERROR_CODE);
            } else if (error.message.includes("ElectionV2__ZeroCandidate")) {
                ERROR_CODE = 7;
                throw(ERROR_CODE);
            } else if (error.message.includes("ElectionV2__ElectionEnded")) {
                ERROR_CODE = 11;
                throw(ERROR_CODE);
            } else if (error.message.includes("ElectionV2__InvalidPassPhrase")) {
                ERROR_CODE = 4;
                throw(ERROR_CODE);
            } else if (error.message.includes("ElectionV2__AlreadyVoted")) {
                ERROR_CODE = 10;
                throw(ERROR_CODE);
            } else if (error.message.includes("ElectionV2__CandidateIndexOutOfBound")) {
                ERROR_CODE = 5;
                throw(ERROR_CODE);
            } else {
                console.log("Unexpected Error while calling registerVote function from ./context directory. Error: ", error);
                throw(error);
            }
        }
    }

    const getAllElectionNames = async () => {
        try {
            const getElectionNames = await contract.call('getAllElectionNames');
            // console.log("Total Election Names: ", getElectionNames);
            return getElectionNames;
        } catch (error) {
            console.error("Call to getAllElectionNames failed. Called from ./context directory", error);
            throw(error);
        }
    }

    const getActiveAndPastElectionNames = async () => {
        try {
            const activeAndPastElectionNames = await contract.call('getActiveAndPastElectionNames'); // returns 2 array of strings: active election names and past election names
            // console.log("Total Election Names: ", activeAndPastElectionNames);
            return activeAndPastElectionNames;
        } catch (error) {
            console.error("Call to getActiveAndPastElectionNames failed. Called from ./context directory", error);
            throw(error);
        }
    }


    const getElectionDetails = async (electionName) => {
        try {
            const electionDetails = await contract.call('getElectionDetails', [electionName]); // returns an Election structure (id, name, organizerAddress, image, totalCandidate, totalVoteCount, startTime, endTime, passPhrase, description)
            const electionCandidates = await getCandidatesForElection(electionName);
            const electionTimeLeft = await getTimeLeftForElection(electionName);
            /* const timeLeftInDays = Math.ceil(Number(electionTimeLeft)/86400);
            const timeLeftInHours = Math.ceil(Number(electionTimeLeft)/3600);
            const timeLeftInMinutes = Math.ceil(Number(electionTimeLeft)/60);
            const formattedHourMinute = timeLeftInHours.toString() + ":" + timeLeftInMinutes.toString();
            const timeLeft = timeLeftInDays === 0 ? formattedHourMinute : timeLeftInDays.toString(); */
            // console.log("Election Details: ", electionDetails);
            const parsedElectionDetails = {
                electionId: Number(electionDetails.id),
                electionName: electionDetails.name,
                electionOrganizerAddress: electionDetails.organizerAddress,
                electionImage: electionDetails.image,
                electionTotalCandidate: Number(electionDetails.totalCandidate),
                electionTotalVote: Number(electionDetails.totalVoteCount),
                electionStartTime: new Date(Number(electionDetails.startTime)),
                electionEndTime: new Date(Number(electionDetails.endTime)),
                electionPassPhrase: electionDetails.passPhrase,
                electionDescription: electionDetails.description,
                electionCandidates: electionCandidates,
                electionTimeLeft: electionTimeLeft,
            }
            // console.log("Parsed Election Details: ", parsedElectionDetails);
            return parsedElectionDetails;
        } catch (error) {
            console.error("Call to getElectionDetails failed. Called from ./context directory", error);
            throw(error);
        }
    }

    const getElectionOrganizedByUser = async () => {
        try {
            const electionsByUser = await contract.call('getElectionOrganizedByUser', [address]); // returns an array of strings (election names)
            // console.log("Elections Organized by User: ", electionsByUser);
            return electionsByUser;
        } catch (error) {
            console.error("Call to getElectionOrganizedByUser failed. Called from ./context directory", error);
            throw(error);
        }
    }

    const getAddedCandidates = async (electionName) => {
        try {
            const addedCandidates = await contract.call('getAddedCandidates', [electionName]); // returns the total number of candidate added for the given election name
            // console.log("Added Candidates: ", addedCandidates);
            return addedCandidates;
        } catch (error) {
            console.error("Call to getAddedCandidates failed. Called from ./context directory", error);
            throw(error);
        }
    }

    const getCandidatesForElection = async (electionName) => {
        try {
            const candidatesForElection = await contract.call('getCandidatesForElection', [electionName]); // returns an array of Candidate structure (id, name, party, age, description, image, voteCount)
            // console.log("Candidates for Election: ", candidatesForElection);
            const candidateArray = [];
            for (let candidate of candidatesForElection) {
                const parsedCandidateForElection = {
                    candidateId: candidate.id,
                    candidateName: candidate.name,
                    candidateParty: candidate.party,
                    candidateAge: Number(candidate.age),
                    candidateDescription: candidate.description,
                    candidateImage: candidate.image,
                    candidateVoteCount: Number(candidate.voteCount),
                };
                candidateArray.push(parsedCandidateForElection);
            }
            return candidateArray;
        } catch (error) {
            console.error("Call to getCandidatesForElection failed. Called from ./context directory", error);
            throw(error);
        }
    }

    // TODO: check in which format this function returns the value as.
    const getTimeLeftForElection = async (electionName) => {
        try {
            const timeLeftForElection = await contract.call('getTimeLeftForElection', [electionName]); // returns a big number object that can be converted to Number (time left in seconds)
            return Number(timeLeftForElection);
        } catch (error) {
            console.error("Call to getTimeLeftForElection failed. Called from ./context directory", error);
            throw(error);
        }
    }

    const getVotersAddedInElection = async (electionName) => {
      try {
          const votersForElection = await contract.call('getVotersAddedInElection', [electionName]); // returns an array of addresses of the voters that has voted in the election
          return votersForElection;
      } catch (error) {
          console.error("Call to getVotersAddedInElection failed. Called from ./context directory", error);
          throw(error);
      }
    }

    const getElectionsOrganizedByUser = async (address) => {
      try {
        const electionsOrganizedByUser = await contract.call('getElectionOrganizedByUser', [address]);
        return electionsOrganizedByUser
      } catch (error) {
        console.error("Error Occured while fetching the elections Organized by the user. The error is: ", error);
        throw(error);
      }
    }

    /* const getElectionDetails = async () => {
        return await displayAllElection();
    } */

    // TODO: make sure to tweak this function such that it goes in the following process
    // TODO: 1. Get the names of the elections from the contract or
    // TODO: 1. Get the names of the elections that are active and past elections using the function `getActiveAndPastElectionNames`
    // TODO: 1. We can make sure that the active elections are listed in the top and is then followed by the past elections
    // TODO: 2. Get the details of the election by using the function `getElectionDetails`
    // TODO: 3. Get the details of the candidates by using the function `getCandidatesForElection`
    // TODO: 4. When creating a json object that is to be given to the frontend component, make sure to call the `getTimeLeftForElection` for the active elections
    // TOOD: 5. For the past elections, make sure to disable the cast vote button and show the time as 'time ended' or something.
    /* const displayAllElection = async () => {
        // TODO: make sure to display all the election details in the home page.
        // TODO: make sure to not trigger when an election is created (currently in createElection.jsx))
        try {
            let allElectionDetails = [];
            let electionId = 0;
            // const { electionNames } = useContractRead(contract, 'electionNames');
            const getElectionNames = await contract.call('getAllElectionNames'); // array of election names that has been organized
            // console.log("Total Election Names: ", getElectionNames);
            for (let electionName of getElectionNames) {
                let getElectionInfo = {
                    electionId,
                    electionName: electionName,
                    candidateArray: [],
                    timeLeft: '',
                    electionTotalVote: 0,
                    isElectionActive: true
                }
                // console.log("Election Name: ", electionName);
                const electionTimeLeft = await contract.call('getTimeLeftForElectionByName', [electionName]);
                if (electionTimeLeft === 0) {
                    getElectionInfo.timeLeft = Number(0);
                    getElectionInfo.isElectionActive = false;
                } else {
                    getElectionInfo.timeLeft = Math.ceil(Number(electionTimeLeft)/60); // time left in minutes
                    getElectionInfo.isElectionActive = true;
                }
                const candidates = await contract.call('getCandidatesForElection', [electionName]);
                for (let detail of candidates) {
                    // console.log("getCandidateDetail variable: ", detail);
                    const parsedCandidateForElection = {
                        candidateName: detail.name,
                        candidateParty: detail.party,
                        candidateVoteCount: Number(detail.voteCount),
                        candidateAge: Number(detail.age),
                        candidateIndex: Number(detail.id),
                    };
                    getElectionInfo.electionTotalVote += Number(detail.voteCount);
                    getElectionInfo.candidateArray.push(parsedCandidateForElection);
                }
                allElectionDetails.push(getElectionInfo);
                electionId += 1;
                // console.log("Election Info (object): ", getElectionInfo);
            }
            // console.log("All Election Details (array): ", allElectionDetails);
            return allElectionDetails;
        } catch (error) {
            console.error("Call to displayAllElection failed. Called from ./context directory", error);
            throw(error);
        }
    } */

    /* const displayUserElection = async () => {
        try {
            // console.log("Address of the Wallet is: ", address);
            let electionId = 0;
            const allElectionDetails = [];
            const getUserElection = await contract.call('getElectionOrganizedByUser', [address]);
            for (let electionName of getUserElection) {
                let getElectionInfo = {
                    electionId,
                    electionName: electionName,
                    candidateArray: [],
                    timeLeft: '',
                    electionTotalVote: 0,
                    isElectionActive: true
                }
                const electionTimeLeft = await contract.call('getTimeLeftForElectionByName', [electionName]);
                if (electionTimeLeft === 0) {
                    getElectionInfo.timeLeft = Number(0);
                    getElectionInfo.isElectionActive = false;
                } else {
                    getElectionInfo.timeLeft = Math.ceil(Number(electionTimeLeft)/60); // time left in minutes
                    getElectionInfo.isElectionActive = true;
                }
                const candidates = await contract.call('getCandidatesForElection', [electionName]);
                for (let detail of candidates) {
                    // console.log("getCandidateDetail variable: ", detail);
                    const parsedCandidateForElection = {
                        candidateName: detail.name,
                        candidateParty: detail.party,
                        candidateVoteCount: Number(detail.voteCount),
                        candidateAge: Number(detail.age),
                        candidateIndex: Number(detail.id),
                    };
                    getElectionInfo.electionTotalVote += Number(detail.voteCount);
                    getElectionInfo.candidateArray.push(parsedCandidateForElection);
                }
                allElectionDetails.push(getElectionInfo);
                electionId += 1;
            }
            return allElectionDetails;
        } catch (error) {
            console.error("Call to displayUserElection failed. Called from ./context directory", error);
            throw(error);
        }
    } */

    /* const getAllEvents = async () => {
        const eventCandidateAdded = await contract.events.getEvents("candidateAdded");
        const eventElectionOrganized = await contract.events.getEvents("electionOrganized");
        console.log("Candidate Event: ", eventCandidateAdded);
        console.log("Election Organized: ", eventElectionOrganized);
    } */

    return (
      <StateContext.Provider
        value={{
          address,
          connect,
          contract,
          setOrganizer: addOrganizer,
          organizeElection: addElection,
          registerCandidate,
          getAddedCandidates,
          registerVote,
          getElectionDetails,
          getElectionOrganizedByUser,
          getActiveAndPastElectionNames,
          getCandidatesForElection,
          getAllElectionNames,
          getVotersAddedInElection,
          getTimeLeftForElection,
          getElectionsOrganizedByUser
        }}
      >
        {children}
      </StateContext.Provider>
    );
}

export const useStateContext = () => useContext(StateContext);
