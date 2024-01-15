// SPDX-License-Identifier: MIT
pragma solidity ^0.8.8;

error ElectionV2__InvalidOrganizer(address organizerAddress);
error ElectionV2__InsufficientValue(string electionName, string fieldName, uint256 expectedValue, uint256 providedValue);
error ElectionV2__InvalidPassPhrase(string electionName, string passPhrase);
error ElectionV2__CandidateIndexOutOfBound(string electionName, uint256 candidateIndex);
error ElectionV2__DuplicateName(string electionName);
error ElectionV2__ZeroCandidate(string electionName, uint256 maxCandidates);
error ElectionV2__CandidateOverflow(string electionName, uint256 currentCandidates, uint256 maxCandidates);
error ElectionV2__UnexpectedError(string possibleReason);
error ElectionV2__AlreadyVoted(string electionName, address voterAddress);
error ElectionV2__ElectionEnded(string electionName);
error ElectionV2__EmptyPassPhrase(string electionName, string expectedPassPhrase);

contract ElectionV2 {
    // variables
    uint256 electionOrganizedCount = 0;
    string[] private electionNames;
    mapping (address => string[]) organizerToElectionNames;
    mapping (address => bool) organizerAdded;
    // mapping (string => uint256) electionNameToIndex;
    // mapping (string => bool) isActiveElection;

    // structure for the candidate
    struct Candidate {
        uint256 id;
        string name;
        string party;
        uint256 age;
        string description;
        string image;
        uint256 voteCount;
    }

    // structure for the election
    struct Election {
        uint256 id;
        string name;
        address organizerAddress;
        string image;
        uint256 totalCandidate;
        uint256 totalVoteCount;
        uint256 startTime;
        uint256 endTime;
        string passPhrase;
        string description;
        // bool isActive;
    }

    mapping (string => bool) electionNameExists;
    mapping (string => Election) electionNameToElectionDetails;
    mapping (string => Candidate[]) electionNameToCandidateList;
    mapping (string => uint256) electionNameToCandidatesAdded;
    mapping (string => address[]) electionNameToVoterAddress;
    // mapping (string => uint256) electionNameToMaxCandidatesAllocated;

    // modifiers
    /**
     * @dev Modifier to check if there is time left for a specific election.
     * @param _electionName The name of the election.
     */
    modifier isTimeLeft (string memory _electionName) {
        if (block.timestamp > electionNameToElectionDetails[_electionName].startTime && block.timestamp < electionNameToElectionDetails[_electionName].endTime) {
            _;
        } else {
            // electionNameToElectionDetails[_electionName].isActive = false;
            revert ElectionV2__ElectionEnded(_electionName);
        }
    }

    /**
     * @dev Modifier to check if the given election name is a duplicate.
     * @param _electionName The name of the election to check.
     */
    modifier isDuplicateName (string memory _electionName) {
        if (electionNameExists[_electionName] == false) {
            _;
        } else {
            revert ElectionV2__DuplicateName(_electionName);
        }
    }

    /**
     * @dev Modifier to check if the specified election has at least one candidate added.
     * @param _electionName The name of the election.
     */
    modifier isEmptyCandidate (string memory _electionName) {
        if(electionNameToCandidatesAdded[_electionName] > 0) {
            _;
        } else {
            revert ElectionV2__ZeroCandidate(_electionName, electionNameToElectionDetails[_electionName].totalCandidate);
        }
    }

    /**
     * @dev Modifier to check if the given address is an organizer.
     * @param _organizerAddress The address to check.
     * Requirements:
     * - The address must be added as an organizer.
     */
    modifier isOrganizer (address _organizerAddress) {
        if (organizerAdded[_organizerAddress] == true) {
            _;
        } else {
            revert ElectionV2__InvalidOrganizer(_organizerAddress);
        }
    }

    // helper functions
    /**
     * @dev Checks if the provided pass phrase matches the pass phrase associated with the given election name.
     * @param _electionName The name of the election.
     * @param _passPhrase The pass phrase to be checked.
     * @return A boolean indicating whether the pass phrase is correct or not.
     */
    function isCorrectPassPhrase(string memory _electionName, string memory _passPhrase) private view returns (bool) {
        if (keccak256(abi.encodePacked(_passPhrase)) == keccak256(abi.encodePacked(electionNameToElectionDetails[_electionName].passPhrase))) {
            return true;
        } else {
            return false;
        }
    }

    /**
     * @dev Checks if a candidate can be added to the election.
     * @param _electionName The name of the election.
     * @param _organizerAddress The address of the organizer.
     * @return A boolean indicating whether a candidate can be added.
     */
    function canAddCandidate (string memory _electionName, address _organizerAddress) isTimeLeft (_electionName) private view returns (bool) {
        if (_organizerAddress == electionNameToElectionDetails[_electionName].organizerAddress) {
            if (electionNameToCandidatesAdded[_electionName] < electionNameToElectionDetails[_electionName].totalCandidate) {
                return true;
            } else {
                revert ElectionV2__CandidateOverflow(_electionName, electionNameToCandidatesAdded[_electionName], electionNameToElectionDetails[_electionName].totalCandidate);
            }
        } else {
            revert ElectionV2__InvalidOrganizer(_organizerAddress);
        }
    }

    /**
     * @dev Checks if a voter can vote in the specified election.
     * @param _electionName The name of the election.
     * @param _electionPassPhrase The passphrase of the election.
     * @param _voterAddress The address of the voter.
     * @return A boolean indicating whether the voter can vote or not.
     */
    function canVote (string memory _electionName, string memory _electionPassPhrase, address _voterAddress) isTimeLeft(_electionName) private view returns (bool) {
        if (isCorrectPassPhrase(_electionName, _electionPassPhrase)) {
            uint256 votersLength = electionNameToVoterAddress[_electionName].length;
            for (uint256 i = 0; i < votersLength; i++) {
                if (electionNameToVoterAddress[_electionName][i] == _voterAddress) {
                    revert ElectionV2__AlreadyVoted(_electionName, _voterAddress);
                }
            }
            return true;
        } else {
            revert ElectionV2__InvalidPassPhrase(_electionName, _electionPassPhrase);
        }
    }

    /**
     * @dev Checks if the provided values for an election are sufficient.
     * @param _electionName The name of the election.
     * @param _electionPassPhrase The passphrase for the election.
     * @param _totalCandidate The total number of candidates in the election.
     * @param _electionDuration The duration of the election in seconds.
     * @return A boolean indicating whether the values are sufficient or not.
     */
    function isInsufficientValues (string memory _electionName, string memory _electionPassPhrase, uint256 _totalCandidate, uint256 _electionDuration) isDuplicateName (_electionName) private view returns (bool) {
        if (_totalCandidate >= 2) {
            if (_electionDuration >= 10) {
                if (keccak256(abi.encodePacked(_electionPassPhrase)) != keccak256(abi.encodePacked(""))) {
                    return true;
                } else {
                    revert ElectionV2__EmptyPassPhrase(_electionName, "Pass Phrase should not be empty and can be a multi-word password");
                }
            } else {
                revert ElectionV2__InsufficientValue(_electionName, "Election Duration", 10, _electionDuration);
            }
        } else {
            revert ElectionV2__InsufficientValue(_electionName, "Total Candidate", 2, _totalCandidate);
        }
    }

    // functions
    // set the Organizer
    /**
     * @dev Sets the organizer address.
     * @param _organizerAddress The address of the organizer.
     */
    function setOrganizer(address _organizerAddress) public {
        if (organizerAdded[_organizerAddress] == false) {
            organizerAdded[_organizerAddress] = true;
        }
    }

    // organize the election
    /**
     * @dev Function to organize an election.
     * @param _electionName The name of the election.
     * @param _totalCandidate The total number of candidates in the election.
     * @param _electionDurationInMinutes The duration of the election in minutes.
     * @param _electionPassPhrase The passphrase required to access the election.
     * @param _electionDescription The description of the election.
     * @param _electionImage The image associated with the election.
     */
    function organizeElection (string memory _electionName, uint256 _totalCandidate, uint256 _electionDurationInMinutes, string memory _electionPassPhrase, string memory _electionDescription, string memory _electionImage) isOrganizer (msg.sender) public {
        if (isInsufficientValues(_electionName, _electionPassPhrase, _totalCandidate, _electionDurationInMinutes)) {
            electionNameExists[_electionName] = true;
            electionNames.push(_electionName);
            // isActiveElection[_electionName] = true;
            organizerToElectionNames[msg.sender].push(_electionName);
            // electionNameToIndex[_electionName] = electionOrganizedCount;
            electionNameToCandidatesAdded[_electionName] = 0;
            // electionNameToMaxCandidatesAllocated[_electionName] = _totalCandidate;
            Election memory organizedElection;
            organizedElection = Election({
                id: electionOrganizedCount,
                name: _electionName,
                organizerAddress: msg.sender,
                image: _electionImage,
                totalCandidate: _totalCandidate,
                totalVoteCount: 0,
                startTime: block.timestamp,
                endTime: block.timestamp + (_electionDurationInMinutes * 1 minutes),
                passPhrase: _electionPassPhrase,
                description: _electionDescription
                // isActive: true
            });
            electionOrganizedCount += 1;
            electionNameToElectionDetails[_electionName] = organizedElection;
        } else {
            revert ElectionV2__UnexpectedError("Organizing Election Failed. Try again Later");
        }
    }

    /**
     * @dev Adds a candidate to the election.
     * @param _electionName The name of the election.
     * @param _candidateName The name of the candidate.
     * @param _candidateParty The party affiliation of the candidate.
     * @param _candidateAge The age of the candidate.
     * @param _candidateDescription The description of the candidate.
     * @param _candidateImage The image of the candidate.
     */
    function addCandidate (string memory _electionName, string memory _candidateName, string memory _candidateParty, uint256 _candidateAge, string memory _candidateDescription, string memory _candidateImage) isOrganizer (msg.sender) public {
        if (canAddCandidate(_electionName, msg.sender)) {
            Candidate memory addedCandidate;
            addedCandidate = Candidate({
                id: electionNameToCandidatesAdded[_electionName],
                name: _candidateName,
                party: _candidateParty,
                age: _candidateAge,
                description: _candidateDescription,
                image: _candidateImage,
                voteCount: 0
            });
            electionNameToCandidateList[_electionName].push(addedCandidate);
            electionNameToCandidatesAdded[_electionName] += 1;
        } else {
            revert ElectionV2__UnexpectedError("Addition of Candidate Failed. Try again Later");
        }
    }

    /**
     * @dev Allows a voter to cast a vote for a specific candidate in an election.
     * @param _electionName The name of the election.
     * @param _electionPassPhrase The passphrase for the election.
     * @param _candidateIndex The index of the candidate in the candidate list.
     * @notice This function requires that the candidate index is within the bounds of the candidate list for the given election.
     * @notice This function also checks if the voter is eligible to vote in the given election.
     * @notice If the conditions are met, the vote count for the candidate and the total vote count for the election are incremented, and the voter's address is added to the list of voters for the election.
     * @notice If the conditions are not met, the function reverts with an error message.
     */
    function castVote (string memory _electionName, string memory _electionPassPhrase, uint256 _candidateIndex) isEmptyCandidate (_electionName) public {
        if (canVote(_electionName, _electionPassPhrase, msg.sender) && _candidateIndex < electionNameToCandidatesAdded[_electionName]) {
            electionNameToCandidateList[_electionName][_candidateIndex].voteCount += 1;
            electionNameToElectionDetails[_electionName].totalVoteCount += 1;
            electionNameToVoterAddress[_electionName].push(msg.sender);
        } else {
            revert ElectionV2__CandidateIndexOutOfBound(_electionName, _candidateIndex);
        }
    }

    // getters

    /**
     * @dev Retrieves the details of a specific election.
     * @param _electionName The name of the election.
     * @return The Election struct containing the details of the election.
     */
    function getElectionDetails (string memory _electionName) public view returns (Election memory) {
        return electionNameToElectionDetails[_electionName];
    }

    /**
     * @dev Returns the number of candidates added for a given election.
     * @param _electionName The name of the election.
     * @return The number of candidates added.
     */
    function getAddedCandidates (string memory _electionName) public view returns (uint256) {
        return electionNameToCandidatesAdded[_electionName];
    }

    /**
     * @dev Returns an array of all election names.
     * @return An array of strings representing the names of all elections.
     */
    function getAllElectionNames () public view returns (string[] memory) {
        return electionNames;
    }

    /**
     * @dev Retrieves the names of elections organized by a specific user.
     * @param _organizerAddress The address of the organizer.
     * @return An array of strings representing the names of elections organized by the user.
     */
    function getElectionOrganizedByUser (address _organizerAddress) public view returns (string[] memory) {
        return organizerToElectionNames[_organizerAddress];
    }

    /**
     * @dev Retrieves the addresses of voters added in a specific election.
     * @param _electionName The name of the election.
     * @return An array of addresses representing the voters added in the election.
     */
    function getVotersAddedInElection (string memory _electionName) public view returns (address[] memory) {
        return electionNameToVoterAddress[_electionName];
    }

    /**
     * @dev Retrieves the list of candidates for a specific election.
     * @param _electionName The name of the election.
     * @return An array of Candidate structures representing the candidates for the election.
     */
    function getCandidatesForElection (string memory _electionName) public view returns (Candidate[] memory) {
        // uint256 totalCandidates = electionNameToElectionDetails[_electionName].totalCandidate;
        uint256 addedCandidates = electionNameToCandidatesAdded[_electionName];
        if (addedCandidates == 0) {
            return new Candidate[](0);
            // can also throw an revert message or just send an empty array of candidate structure
        } else {
            Candidate[] memory candidateArray = new Candidate[](addedCandidates);
            for (uint256 candidateIndex = 0; candidateIndex < addedCandidates; candidateIndex++) {
                candidateArray[candidateIndex] = electionNameToCandidateList[_electionName][candidateIndex];
            }
            return candidateArray;
        }
    }

    /**
     * @dev Retrieves the status of an election.
     * @param _electionName The name of the election.
     * @return A boolean indicating whether the election is currently active or not.
     */
    function getElectionStatus (string memory _electionName) private view returns (bool) {
        if (block.timestamp > electionNameToElectionDetails[_electionName].endTime) {
            return false;
        } else {
            return true;
        }
    }

    /**
     * @dev Returns the count of active and past elections.
     * @return activeElectionCount The count of active elections.
     * @return pastElectionCount The count of past elections.
     */
    function getActiveAndPastElectionCount() private view returns (uint256, uint256) {
        uint256 activeElectionCount = 0;
        uint256 pastElectionCount = 0;
        for (uint256 i = 0; i < electionOrganizedCount; i++) {
            if (getElectionStatus(electionNames[i])) {
                activeElectionCount += 1;
            } else {
                pastElectionCount += 1;
            }
        }
        return (activeElectionCount, pastElectionCount);
    }

    /**
     * @dev Returns the names of active and past elections.
     * @return activeElection An array of strings containing the names of active elections.
     * @return pastElection An array of strings containing the names of past elections.
     */
    function getActiveAndPastElectionNames () public view returns (string[] memory, string[] memory) {
        (uint256 activeElectionCount, uint256 pastElectionCount) = getActiveAndPastElectionCount();
        string[] memory activeElection = new string[](activeElectionCount);
        string[] memory pastElection = new string[](pastElectionCount);
        uint256 activeIndex = 0;
        uint256 pastIndex = 0;
        for (uint256 i = 0; i < electionOrganizedCount; i++) {
            if (getElectionStatus(electionNames[i])) {
                activeElection[activeIndex] = electionNames[i];
                activeIndex += 1;
            } else {
                // electionNameToElectionDetails[electionNames[i]].isActive = false;
                pastElection[pastIndex] = electionNames[i];
                pastIndex += 1;
            }
        }
        if (activeIndex == 0) {
            activeElection = new string[](0);
        }
        if (pastIndex == 0) {
            pastElection = new string[](0);
        } 
        return (activeElection, pastElection);
    }

    /**
     * @dev Returns the time left for a specific election.
     * @param _electionName The name of the election.
     * @return The time left in seconds.
     */
    function getTimeLeftForElection (string memory _electionName) public view returns (uint256) {
        if (block.timestamp > electionNameToElectionDetails[_electionName].endTime) {
            return 0;
        } else {
            return (electionNameToElectionDetails[_electionName].endTime - block.timestamp);
        }
    }

    /* function getActiveAndPastElectionNames () public view returns (string[] memory, string[] memory) {
        string[] memory allElectionNames = getAllElectionNames();
        string[] memory activeElection;
        string[] memory pastElection;
        uint256 activeIndex = 0;
        uint256 pastIndex = 0;
        for (uint256 i = 0; i < allElectionNames.length; i++) {
            if (isActiveElection[allElectionNames[i]] == true) {
                activeElection[activeIndex] = allElectionNames[i];
                activeIndex += 1;
            } else {
                pastElection[pastIndex] = allElectionNames[i];
                pastIndex += 1;
            }
        }
        return (activeElection, pastElection);
    } */
}
