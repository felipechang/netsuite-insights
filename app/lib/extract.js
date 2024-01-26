/**
 * Extracts the select type
 * @param {string} srt - The select type string
 * @returns {string} The extracted select type
 */
const extractSelectType = (srt) => {
    if (srt.indexOf('[') === -1) return srt;
    return `[${srt.replace('scriptid=', '')}]`;
}

/**
 * Extracts the record name
 * @param {string} rcn - The record name object
 * @returns {string} The extracted record name
 */
const extractRecordName = (rcn) => {
    if (rcn.hasOwnProperty('$')) return 'NOT AVAILABLE';
    return rcn;
}

/**
 * Extracts fields from text
 * @param {Buffer} content - The text content
 * @returns {Array} The extracted fields array
 */
const extractFieldsFromText = (content) => {
    const excludedStrings = [
        'custworkflow',
        'customform',
        'custpage',
        'custform',
        'custscript',
        'customdeploy',
        '[[custom]]',
        '[[customer]]'
    ];

    const matchArray = String(content).match(/['"]cust\w*/g);
    if (!matchArray) return [];
    return [...new Set(matchArray)].map((e) => `[[${e.replace('"', '').replace("'", '')}]]`)
        .filter((e) => {
            for (let i = 0; i < excludedStrings.length; i++) {
                const excludedWord = excludedStrings[i];
                if (e.indexOf(excludedWord) !== -1) return false;
            }
            return true;
        });
}

module.exports = {
    extractSelectType, extractRecordName, extractFieldsFromText,
}
