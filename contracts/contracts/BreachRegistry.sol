// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title BreachRegistry
 * @dev A decentralized, privacy-preserving credential breach notification registry.
 *      Stores SHA-256 hashes of compromised credentials — never raw data.
 *      Inspired by "Have I Been Pwned" but decentralized and trustless.
 *
 *      Privacy Model: The hash of an email is submitted, not the email itself.
 *      SHA-256 is a one-way function — given the hash, no one can recover
 *      the original email. Users hash their own email in their browser
 *      and query this contract without revealing their identity to any server.
 */
contract BreachRegistry {

    // -----------------------------------------------------------------------
    // DATA STRUCTURES
    // -----------------------------------------------------------------------

    /**
     * @dev Stores metadata about a single reported breach record.
     *      'sourceName' is a human-readable label like "LinkedIn-2025" or "RockYou2024".
     *      'reportedAt' is the Unix timestamp set by the block when the transaction was mined.
     *      'reportedBy' is the Ethereum address of the researcher who submitted this record.
     */
    struct BreachRecord {
        string sourceName;
        uint256 reportedAt;
        address reportedBy;
    }

    // Maps a bytes32 hash (SHA-256 of a credential) to its breach metadata.
    // If leaks[hash].reportedAt == 0, that hash has never been reported.
    mapping(bytes32 => BreachRecord) public leaks;

    // Keeps a list of all hashes ever reported, so the frontend can display a live feed.
    bytes32[] public allReportedHashes;

    // -----------------------------------------------------------------------
    // EVENTS
    // -----------------------------------------------------------------------

    /**
     * @dev Emitted every time a new breach hash is submitted.
     *      Indexed parameters allow the frontend to filter events efficiently.
     */
    event BreachReported(
        bytes32 indexed hashValue,
        string sourceName,
        address indexed reportedBy,
        uint256 reportedAt
    );

    // -----------------------------------------------------------------------
    // WRITE FUNCTIONS
    // -----------------------------------------------------------------------

    /**
     * @dev Submit a new compromised credential hash.
     *      Anyone can call this — no access control, fully permissionless.
     *      Reverts if the hash was already reported (prevents duplicate entries).
     *
     * @param _hash     The bytes32 SHA-256 hash of the compromised credential.
     * @param _source   A human-readable name for the breach source.
     */
    function reportBreach(bytes32 _hash, string memory _source) public {
        // Prevent duplicate reporting of the same hash
        require(leaks[_hash].reportedAt == 0, "Hash already reported");

        // Require a non-empty source name
        require(bytes(_source).length > 0, "Source name cannot be empty");

        // Store the breach record
        leaks[_hash] = BreachRecord({
            sourceName: _source,
            reportedAt: block.timestamp,
            reportedBy: msg.sender
        });

        // Append to the list for enumeration
        allReportedHashes.push(_hash);

        // Emit event so frontends can react in real time
        emit BreachReported(_hash, _source, msg.sender, block.timestamp);
    }

    // -----------------------------------------------------------------------
    // READ FUNCTIONS
    // -----------------------------------------------------------------------

    /**
     * @dev The primary user-facing function. Check if a given hash appears
     *      in any reported breach. The caller hashes their email in their
     *      own browser and passes only the hash — maximum privacy.
     *
     * @param _hash     The bytes32 SHA-256 hash to look up.
     * @return found    True if this hash was ever reported.
     * @return source   The name of the breach where this hash appeared.
     * @return reportedAt  Unix timestamp of when it was reported.
     */
    function checkHash(bytes32 _hash)
        public
        view
        returns (bool found, string memory source, uint256 reportedAt)
    {
        BreachRecord memory record = leaks[_hash];

        if (record.reportedAt == 0) {
            // Hash not found — user is safe
            return (false, "", 0);
        }

        return (true, record.sourceName, record.reportedAt);
    }

    /**
     * @dev Returns the total number of breach records stored in the registry.
     *      Used by the frontend to display a counter.
     */
    function getTotalBreaches() public view returns (uint256) {
        return allReportedHashes.length;
    }

    /**
     * @dev Returns a paginated slice of all reported hashes.
     *      Used by the frontend BreachFeed component.
     *      Returns up to 20 most recent entries.
     *
     * @param _offset   Starting index (0-based) from the END of the array (newest first).
     */
    function getRecentHashes(uint256 _offset)
        public
        view
        returns (bytes32[20] memory recentHashes, uint256 totalCount)
    {
        totalCount = allReportedHashes.length;
        bytes32[20] memory result;

        if (totalCount == 0) return (result, 0);

        // Start from the end (most recent) and work backwards
        uint256 start = totalCount - 1 - _offset;
        uint256 count = 0;

        for (uint256 i = start; count < 20; i--) {
            result[count] = allReportedHashes[i];
            count++;
            if (i == 0) break;
        }

        return (result, totalCount);
    }
}
