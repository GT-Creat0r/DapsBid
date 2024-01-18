// SPDX-License-Identifier: MIT
pragma solidity ^0.8.8;

error DapsBid__InvalidOrganizer(string electionName, address organizerAddress);
error DapsBid__NotOranizer(address organizerAddress);
error DapsBid__InsufficientValue(string electionName, string fieldName, uint256 expectedValue, uint256 providedValue);
error DapsBid__InvalidPassPhrase(string electionName, string passPhrase);
error DapsBid__CandidateIndexOutOfBound(uint256 candidateIndex);
error DapsBid__DuplicateName(string electionName);
error DapsBid__ZeroCandidate(string electionName, uint256 maxCandidates);
error DapsBid__CandidateOverflow(string electionName, uint256 currentCandidates, uint256 maxCandidates);
error DapsBid__UnexpectedError(string possibleReason);
error DapsBid__AlreadyVoted(string electionName, address voterAddress);
error DapsBid__ElectionEnded(string electionName);
error DapsBid__EmptyPassPhrase(string electionName, string expectedPassPhrase);
error DapsBid__InvalidVoter(uint256 voterIdentifier);
error DapsBid__CandidateCountMismatch(uint256 expectedCandidateCount, uint256 givenCandidateCount);
error DapsBid__AllCandidateNotAdded(string electionName, uint256 maximumCandidates, uint256 currentAddedCandidates);
error DapsBid__CandidateCountOverflow(uint256 maximumCandidateAllowed, uint256 providedCandidateCount);
error DapsBid__CandidateCountOutOfBound(string electionName, uint256 minimumCandidateCount, uint256 maximumCandidateCount, uint256 providedCandidateCount);
error DapsBid__CandidateToVoteOverflow(uint256 totalCandidates, uint256 CandidatesToVotePerUser);
error DapsBid__ExistingOrganizer(address _organizerAddress);
error DapsBid__DuplicateCandidateIndex(uint256 _candidateIndex);

/**
 * @title DapsBid - A Decentralized Platform For Holding Multiple Elections.
 * @author Pranav
 * @notice This contract provides a way to organize elections and cast votes. 
 * @notice It also provides a way to retrieve the details of elections and voters.
 */
contract DapsBid {
    // variables
    string[] private electionNames;
    mapping (address => string[]) organizerToElectionNames;
    mapping (address => bool) organizerAdded;

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

    // structure for the Voter
    struct VoterForElection {
        uint256 voterIdentifier;
        uint256[] candidateIndices;
    }

    // structure for the election
    struct Election {
        uint256 id;
        string name;
        address organizerAddress;
        string image;
        uint256 totalCandidate;
        uint256 totalPossibleVotes;
        uint256 totalVoteCount;
        uint256 startTime;
        uint256 endTime;
        string passPhrase;
        string description;
    }

    // mappings 
    mapping (string => bool) electionNameExists;
    mapping (string => Election) electionNameToElectionDetails;
    mapping (string => VoterForElection[]) electionNameToVoterDetails;
    mapping (string => Candidate[]) electionNameToCandidateList;
    mapping (string => uint256[]) electionNameToEligibleVoterList;
    mapping (string => uint256) electionNameToCandidatesAdded;
    mapping (string => uint256) electionNameToPossibleVotePerUser;
    mapping (string => address[]) electionNameToVoterAddress;

    // modifiers

    /**
     * @dev Modifier to check if there is time left for a specific election.
     * @param _electionName The name of the election.
     * Requirements:
     * - The election must be within its start and end time.
     * Throws an error if the election has ended.
     */
    modifier isTimeLeft (string memory _electionName) {
        if (block.timestamp > electionNameToElectionDetails[_electionName].startTime && block.timestamp < electionNameToElectionDetails[_electionName].endTime) {
            _;
        } else {
            // electionNameToElectionDetails[_electionName].isActive = false;
            revert DapsBid__ElectionEnded(_electionName);
        }
    }

    /**
     * @dev Modifier to check if the given election name is a duplicate.
     * @param _electionName The name of the election to check.
     * @notice This modifier can be used to prevent the creation of elections with duplicate names.
     * If the election name already exists, the function will revert with the DapsBid__DuplicateName error.
     */
    modifier isDuplicateName (string memory _electionName) {
        if (electionNameExists[_electionName] == false) {
            _;
        } else {
            revert DapsBid__DuplicateName(_electionName);
        }
    }

    /**
     * @dev Modifier to check if the organizer address is added.
     * @param _organizerAddress The address of the organizer.
     * Requirements:
     * - The organizer address must be added.
     */
    modifier isOrganizerAdded (address _organizerAddress) {
        if (organizerAdded[_organizerAddress] == true) {
            _;
        } else {
            revert DapsBid__NotOranizer(_organizerAddress);
        }
    }

    /**
     * @dev Modifier to check if all candidates have been added for a given election.
     * @param _electionName The name of the election.
     * @notice This modifier ensures that all candidates have been added for a given election before executing the function.
     * @dev If all candidates have been added, the function is executed. Otherwise, it reverts with an error message.
     */
    modifier hasFullCandidates (string memory _electionName) {
        if (electionNameToCandidatesAdded[_electionName] == electionNameToElectionDetails[_electionName].totalCandidate) {
            _;
        } else {
            revert DapsBid__AllCandidateNotAdded(_electionName, electionNameToElectionDetails[_electionName].totalCandidate, electionNameToCandidatesAdded[_electionName]);
        }
    }

    /**
     * @dev Modifier to check if the voter identifier is unique for a given election.
     * @param _electionName The name of the election.
     * @param _voterIdentifier The identifier of the voter.
     * @notice This modifier checks if the given voter identifier has already been used for the specified election.
     * If the voter identifier is not unique, it reverts the transaction with an error message.
     */
    modifier isUniqueVoterIdentifier (string memory _electionName, uint256 _voterIdentifier) {
        for (uint256 index = 0; index < electionNameToVoterDetails[_electionName].length; index++) {
            if (_voterIdentifier == electionNameToVoterDetails[_electionName][index].voterIdentifier) {
                revert DapsBid__AlreadyVoted(_electionName, msg.sender);
            }
        }
        _;
    }

    // helper functions
    
    /**
     * @dev Checks if a voter is eligible to vote in a specific election.
     * @param _electionName The name of the election.
     * @param _electionVoterIdentifier The identifier of the voter.
     * @return A boolean indicating whether the voter is eligible or not.
     */
    function isEligibleVoter(string memory _electionName, uint256 _electionVoterIdentifier) isTimeLeft(_electionName) private view returns (bool) {
        for (uint256 index = 0; index < electionNameToEligibleVoterList[_electionName].length; index++) {
            if (_electionVoterIdentifier == electionNameToEligibleVoterList[_electionName][index]) {
                return true;
            }
        }
        return false;
    }

    /**
     * @dev Checks if all candidates are available for voting in a specific election.
     * @param _electionName The name of the election.
     * @param candidateCount The number of candidates to be checked.
     * @return A boolean indicating whether all candidates are available for voting.
     * @dev Throws an exception if the candidate count does not match the total possible votes for the election.
     */
    function hasAllCandidatesToVote(string memory _electionName, uint256 candidateCount) private view returns (bool) {
        if (electionNameToElectionDetails[_electionName].totalPossibleVotes == candidateCount) {
            return true;
        } else {
            revert DapsBid__CandidateCountMismatch(electionNameToElectionDetails[_electionName].totalPossibleVotes, candidateCount);
        }
    }

    /**
     * @dev Checks if the provided pass phrase matches the stored pass phrase for a given election.
     * @param _electionName The name of the election.
     * @param _passPhrase The pass phrase to be checked.
     * @return A boolean indicating whether the pass phrase is correct or not.
     */
    function isCorrectPassPhrase (string memory _electionName, string memory _passPhrase) private view returns (bool) {
        if (keccak256(abi.encodePacked(_passPhrase)) == keccak256(abi.encodePacked(electionNameToElectionDetails[_electionName].passPhrase))) {
            return true;
        } else {
            return false;
        }
    }

    /**
     * @dev Checks if a candidate can be added to the election.
     * @param _electionName The name of the election.
     * @return A boolean indicating whether a candidate can be added.
     */
    function canAddCandidate (string memory _electionName) isTimeLeft(_electionName) private view returns (bool) {
        if (electionNameToCandidatesAdded[_electionName] < electionNameToElectionDetails[_electionName].totalCandidate) {
            return true;
        } else {
            revert DapsBid__CandidateOverflow(_electionName, electionNameToCandidatesAdded[_electionName], electionNameToElectionDetails[_electionName].totalCandidate);
        }
    }

    /**
     * @dev Checks if the given election name and organizer address match an existing organizer.
     * @param _electionName The name of the election.
     * @param _organizerAddress The address of the organizer.
     * @return A boolean indicating whether the organizer is valid.
     * @dev Throws an exception if the organizer is invalid.
     */
    function isOrganizer(string memory _electionName, address _organizerAddress) private view returns (bool) {
        for (uint256 index = 0; index < organizerToElectionNames[_organizerAddress].length; index++) {
            if (keccak256(abi.encodePacked(_electionName)) == keccak256(abi.encodePacked(organizerToElectionNames[_organizerAddress][index]))) {
                return true;
            }
        }
        revert DapsBid__InvalidOrganizer(_electionName, _organizerAddress);
    }


    /**
     * @dev Checks if an array of candidate indices has no duplicates.
     * @param _candidateIndices The array of candidate indices to check.
     * @return A boolean indicating whether the array has no duplicates.
     */
    function hasNoDuplicates(uint256[] memory _candidateIndices) private pure returns (bool) {
        for (uint256 i = 0; i < _candidateIndices.length; i++) {
            for (uint256 j = i + 1; j < _candidateIndices.length; j++) {
                if (_candidateIndices[i] == _candidateIndices[j]) {
                    // Duplicate found
                    // return false;
                    revert DapsBid__DuplicateCandidateIndex(_candidateIndices[i]);
                }
            }
        }
        // No duplicates found
        return true;
    }

    /**
     * @dev Checks if the given candidate indices are correct for a specific election.
     * @param _electionName The name of the election.
     * @param _candidateIndices The array of candidate indices to be checked.
     * @return A boolean indicating whether the candidate indices are correct or not.
     */
    function hasCorrectCandidateIndices (string memory _electionName, uint256[] memory _candidateIndices) private view returns (bool) {
        for (uint256 index = 0; index < _candidateIndices.length; index++) {
            if (_candidateIndices[index] >= electionNameToCandidatesAdded[_electionName]) {
                revert DapsBid__CandidateIndexOutOfBound(_candidateIndices[index]);
            }
        }
        hasNoDuplicates(_candidateIndices);
        return true;
    }

    /**
     * @dev Checks if the number of voters is valid for the given election.
     * @param _electionTotalPossibleVotes The total number of possible votes in the election.
     * @param _totalCandidate The total number of candidates in the election.
     * @return A boolean indicating whether the number of voters is valid.
     */
    function isValidNumberOfVoters (uint256 _electionTotalPossibleVotes, uint256 _totalCandidate) private pure returns (bool) {
        if (_electionTotalPossibleVotes < _totalCandidate && _electionTotalPossibleVotes != 0) {
            return true;
        } else {
            revert DapsBid__CandidateToVoteOverflow(_totalCandidate, _electionTotalPossibleVotes);
        }
    }

    /**
     * @dev Checks if a voter can vote in a specific election.
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
                    revert DapsBid__AlreadyVoted(_electionName, _voterAddress);
                }
            }
            return true;
        } else {
            revert DapsBid__InvalidPassPhrase(_electionName, _electionPassPhrase);
        }
    }

    /**
     * @dev Checks if the provided values for an election are sufficient.
     * @param _electionName The name of the election.
     * @param _electionPassPhrase The passphrase for the election.
     * @param _totalCandidate The total number of candidates for the election.
     * @param _electionDuration The duration of the election in seconds.
     * @return A boolean indicating whether the values are sufficient or not.
     */
    function isInsufficientValues (string memory _electionName, string memory _electionPassPhrase, uint256 _totalCandidate, uint256 _electionDuration) isDuplicateName (_electionName) private view returns (bool) {
        if (_totalCandidate >= 2 && _totalCandidate <= 25) {
            if (_electionDuration >= 10) {
                if (keccak256(abi.encodePacked(_electionPassPhrase)) != keccak256(abi.encodePacked(""))) {
                    return true;
                } else {
                    revert DapsBid__EmptyPassPhrase(_electionName, "Pass Phrase should not be empty and can be a multi-word password");
                }
            } else {
                revert DapsBid__InsufficientValue(_electionName, "Election Duration", 10, _electionDuration);
            }
        } else {
            revert DapsBid__CandidateCountOutOfBound(_electionName, 2, 25, _totalCandidate);
        }
    }

    // functions
    
    // set the Organizer
    /**
     * @dev Sets the organizer address.
     * @param _organizerAddress The address of the organizer.
     * @notice This function can only be called once for each organizer address.
     * @notice If the organizer address has already been added, it will revert with an error.
     */
    function setOrganizer(address _organizerAddress) public {
        if (organizerAdded[_organizerAddress] == false) {
            organizerAdded[_organizerAddress] = true;
        } else {
            revert DapsBid__ExistingOrganizer(_organizerAddress);
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
     * @param _electionTotalPossibleVotes The total number of possible votes in the election.
     * @param _electionVoterIdentifier The list of voter identifiers for the election.
     * Requirements:
     * - The caller must be added as an organizer.
     * - The election name, passphrase, total candidate, and duration must have sufficient values.
     * - The total number of possible votes must be valid based on the total number of candidates.
     * - The election name must be unique.
     * - The election details must be stored in the contract.
     * - The election name must be added to the list of election names.
     * - The election name must be added to the organizer's list of elections.
     * - The candidate count, vote count, start time, end time, and other details must be initialized.
     * - If any requirement is not met, the function will revert with an error message.
     */
    function organizeElection (string memory _electionName, uint256 _totalCandidate, uint256 _electionDurationInMinutes, string memory _electionPassPhrase, string memory _electionDescription, string memory _electionImage, uint256 _electionTotalPossibleVotes, uint256[] memory _electionVoterIdentifier) isOrganizerAdded (msg.sender) public {
        if (isInsufficientValues(_electionName, _electionPassPhrase, _totalCandidate, _electionDurationInMinutes) && isValidNumberOfVoters(_electionTotalPossibleVotes, _totalCandidate)) {
            electionNameExists[_electionName] = true;
            electionNames.push(_electionName);
            organizerToElectionNames[msg.sender].push(_electionName);
            electionNameToCandidatesAdded[_electionName] = 0;
            electionNameToPossibleVotePerUser[_electionName] = _electionTotalPossibleVotes;
            electionNameToEligibleVoterList[_electionName] = _electionVoterIdentifier;
            electionNameToElectionDetails[_electionName] = Election({
                id: electionNames.length,
                name: _electionName,
                organizerAddress: msg.sender,
                image: _electionImage,
                totalCandidate: _totalCandidate,
                totalVoteCount: 0,
                totalPossibleVotes: _electionTotalPossibleVotes,
                startTime: block.timestamp,
                endTime: block.timestamp + (_electionDurationInMinutes * 1 minutes),
                passPhrase: _electionPassPhrase,
                description: _electionDescription
            });
        } else {
            revert DapsBid__UnexpectedError("Organizing Election Failed. Try again Later");
        }
    }

    /**
     * @dev Adds a candidate to the specified election.
     * @param _electionName The name of the election.
     * @param _candidateName The name of the candidate.
     * @param _candidateParty The political party of the candidate.
     * @param _candidateAge The age of the candidate.
     * @param _candidateDescription The description of the candidate.
     * @param _candidateImage The image URL of the candidate.
     */
    function addCandidate (string memory _electionName, string memory _candidateName, string memory _candidateParty, uint256 _candidateAge, string memory _candidateDescription, string memory _candidateImage) public {
        if (canAddCandidate(_electionName) && isOrganizer (_electionName, msg.sender)) {
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
            revert DapsBid__UnexpectedError("Organizing Election Failed. Try again Later");
        }
    }

    /**
     * @dev Registers a voter for a specific election.
     * @param _electionName The name of the election.
     * @param _voterIdentifier The unique identifier of the voter.
     * @param _electionPassPhrase The passphrase for the election.
     * @param _candidateId The array of candidate IDs the voter wants to vote for.
     */
    function registerVoter (string memory _electionName, uint256 _voterIdentifier, string memory _electionPassPhrase, uint256[] memory _candidateId) hasFullCandidates(_electionName) isUniqueVoterIdentifier (_electionName, _voterIdentifier) public {
        if (isEligibleVoter(_electionName, _voterIdentifier) && hasAllCandidatesToVote(_electionName, _candidateId.length)){
            if (canVote(_electionName, _electionPassPhrase, msg.sender) && hasCorrectCandidateIndices(_electionName, _candidateId)) {
                VoterForElection memory registeredVoter;
                registeredVoter = VoterForElection({
                    // voterAddress: msg.sender,
                    voterIdentifier: _voterIdentifier,
                    candidateIndices: _candidateId
                    // votedCount: _candidateId.length
                });
                for (uint256 index = 0; index < _candidateId.length; index ++) {
                    electionNameToCandidateList[_electionName][_candidateId[index]].voteCount += 1;
                    electionNameToElectionDetails[_electionName].totalVoteCount += 1;
                }
                electionNameToVoterAddress[_electionName].push(msg.sender);
                electionNameToVoterDetails[_electionName].push(registeredVoter);
            }
        } else {
            revert DapsBid__InvalidVoter(_voterIdentifier);
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
     * @dev Returns the number of candidates added for a given election name.
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
     * @dev Returns an array of election names organized by a specific user.
     * @param _organizerAddress The address of the organizer.
     * @return An array of election names.
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
     * @dev Retrieves the details of voters for a specific election.
     * @param _electionName The name of the election.
     * @return An array of VoterForElection structs containing the details of voters.
     */
    function getVotersDetailForElection (string memory _electionName) public view returns (VoterForElection[] memory) {
        return electionNameToVoterDetails[_electionName];
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
            return electionNameToCandidateList[_electionName];
            // return new Candidate[](0);
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
    function getElectionStatus (string memory _electionName) public view returns (bool) {
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
        for (uint256 i = 0; i < electionNames.length; i++) {
            if (getElectionStatus(electionNames[i])) {
                activeElectionCount += 1;
            } else {
                pastElectionCount += 1;
            }
        }
        return (activeElectionCount, pastElectionCount);
    }

    /**
     * @dev Retrieves the voter identifiers for a specific election.
     * @param _electionName The name of the election.
     * @return identifier An array of voter identifiers for the given election.
     */
    function getVoterIdentifierForElection (string memory _electionName) public view returns (uint256[] memory identifier) {
        if (isOrganizer (_electionName, msg.sender)) {
            return electionNameToEligibleVoterList[_electionName];
        }
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
        for (uint256 i = 0; i < electionNames.length; i++) {
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
}
