const {join, resolve} = require("path");
const {readdir, readFile, writeFile} = require("node:fs/promises");
const {existsSync, mkdirSync} = require("node:fs");
const xml2js = require("xml2js");
const json2md = require("json2md");
const {extractFieldsFromText} = require("./extract");

const fileCabinetPath = resolve('src', 'FileCabinet');
const objectsPath = resolve('src', 'Objects');
let baseStorePath = "";

/**
 * Sets the base store path
 * @param {string} storePath - The path to set as the base store path
 */
const setBaseStorePath = (storePath) => {
    baseStorePath = resolve(storePath);
    if (!existsSync(baseStorePath)) mkdirSync(baseStorePath);
}

/**
 * Processes custom records
 * @param {string} folder - The folder name
 * @param {Function} cb - The callback function
 */
const processCustomRecords = async (folder, cb) => {
    const basePathFolder = join(objectsPath, folder);
    const basePathFolderFiles = await readdir(basePathFolder);
    const baseStorePathFolder = join(baseStorePath, folder);
    if (!existsSync(baseStorePathFolder)) mkdirSync(baseStorePathFolder);
    for (let i = 0; i < basePathFolderFiles.length; i++) {
        if (basePathFolderFiles[i].indexOf('.template') !== -1) continue;
        if (basePathFolderFiles[i].indexOf('.xml') === -1) continue;
        const filePath = join(basePathFolder, basePathFolderFiles[i]);
        xml2js.parseString(await readFile(filePath), async (error, result) => {
            if (error) console.error(error)
            else await writeFile(join(baseStorePathFolder, `${result[folder]['$'].scriptid}.md`),
                json2md(await cb(result[folder], filePath))
            )
        });
    }
}

/**
 * Stores a record field
 * @param {Object} data - The field data
 * @param {string} id - The record id
 */
const storeRecordField = async (data, id) => {
    const baseStorePathFolder = join(baseStorePath, 'customrecordtype');
    await writeFile(join(baseStorePathFolder, `${id}.md`), json2md(data));
}

/**
 * Reads fields from text
 * @param {Object} result - The result object
 * @param {string} filePath - The file path
 */
const readFieldsFromText = async (result, filePath) => {
    const content = await readFile(filePath.replace('.xml', '.template.xml'));
    return extractFieldsFromText(content);
}

/**
 * Reads paths from text
 * @param {Buffer} extractPathsFromText - The text to extract paths from
 * @param {string} baseScriptPath - The base script path
 * @param {string} scriptPath - The current script path
 * @returns {Array} The parsed paths array
 */
const readPathsFromText = (extractPathsFromText, baseScriptPath, scriptPath) => {
    const splitScriptPath = scriptPath.split('\\');
    splitScriptPath.pop();
    let paths = String(extractPathsFromText).match(/require\(['"]([^'"]+)['"]\)/g);
    if (!paths) return [];
    paths = paths.map(path => {
        return path
            .replace('require(', '')
            .replace(')', '')
            .replace(/"/g, '')
            .replace(/'/g, '');
    });
    paths = paths.filter((e) => e.indexOf('N/') === -1);
    return paths.map((e) => {
        if (e.startsWith('.')) return `${join(splitScriptPath.join('\\'), e)}.js`
        return `${join(baseScriptPath, e)}.js`;
    });
}

/**
 * Reads fields from a script
 * @param {string} path - The script path
 * @param {string} scriptId - The script id
 * @returns {Promise<Array>} The fields array
 */
const readFieldsFromScript = async (path, scriptId) => {
    path = path.replace('[', '').replace(']', '');
    let fields = [];
    const scriptPath = join(fileCabinetPath, path);
    if (!existsSync(scriptPath)) return [];
    const scriptContent = await readFile(scriptPath);
    fields = fields.concat(extractFieldsFromText(scriptContent).filter((e) => e.indexOf(scriptId) === -1));
    const paths = readPathsFromText(scriptContent, fileCabinetPath, scriptPath);
    for (let i = 0; i < paths.length; i++) {
        fields = fields.concat(await readFieldsFromScript(paths[i], scriptId));
    }
    return fields;
}

/**
 * Creates an object folder
 * @param {string} type - The object type
 */
const createObjectFolder = async (type) => {
    const baseObjectFolderPath = join(objectsPath, type);
    if (!existsSync(baseObjectFolderPath)) mkdirSync(baseObjectFolderPath);
}

module.exports = {
    setBaseStorePath,
    processCustomRecords,
    readFieldsFromText,
    readFieldsFromScript,
    storeRecordField,
    createObjectFolder,
    processRecords
};