const {join} = require("path");
const {readdir, readFile, writeFile} = require("node:fs/promises");
const {existsSync, mkdirSync} = require("node:fs");
const xml2js = require("xml2js");
const json2md = require("json2md");
const {extractFieldsFromText, extractSelectType} = require("./extract");

const baseScriptPath = `${__dirname}/../../src/FileCabinet`;
const baseObjectPath = `${__dirname}/../../src/Objects`;
let baseStorePath = "";

const setBaseStorePath = (storePath) => {
    baseStorePath = join(process.cwd(), storePath);
    if (!existsSync(baseStorePath)) mkdirSync(baseStorePath);
}

const readXMLDirContent = async (folder, cb) => {
    const basePathFolder = join(baseObjectPath, folder);
    const basePathFolderFiles = await readdir(basePathFolder);
    const baseStorePathFolder = join(baseStorePath, folder);
    if (!existsSync(baseStorePathFolder)) mkdirSync(baseStorePathFolder);
    for (let i = 0; i < basePathFolderFiles.length; i++) {
        if (basePathFolderFiles[i].indexOf('.template') !== -1) continue;
        const filePath = join(basePathFolder, basePathFolderFiles[i]);
        xml2js.parseString(await readFile(filePath), async (error, result) => {
            if (error) console.error(error)
            else await writeFile(join(baseStorePathFolder, `${result[folder]['$'].scriptid}.md`),
                json2md(await cb(result[folder], filePath))
            )
        });
    }
}

const storeRecordField = async (field) => {
    const data = [
        {h1: field.label[0]},
        {p: `#FIELD`},
        {p: `Type: ${field.fieldtype[0]}`}
    ];
    if (field.selectrecordtype[0]) data.push({p: `Select Type:${extractSelectType(field.selectrecordtype[0])}`});
    const baseStorePathFolder = join(baseStorePath, 'customrecordtype');
    await writeFile(join(baseStorePathFolder, `${field['$'].scriptid}.md`), json2md(data));
}

const readFieldsFromText = async (result, filePath) => {
    const content = await readFile(filePath.replace('.xml', '.template.xml'));
    return extractFieldsFromText(content);
}


const readPathsFromText = (extractPathsFromText, baseScriptPath, scriptPath) => {
    scriptPath = scriptPath.split('\\');
    scriptPath.pop();
    scriptPath = scriptPath.join('\\');

    let paths = String(extractPathsFromText).match(/require\(['"]([^'"]+)['"]\)/g);
    if (!paths) return [];
    paths = paths.map((e) =>
        e.replace('require(', '').replace(')', '').replace(/"/g, '').replace(/'/g, '')
    )
    paths = paths.filter((e) => e.indexOf('N/') === -1);
    return paths.map((e) => {
        if (e.startsWith('.')) return `${join(scriptPath, e)}.js`
        return `${join(baseScriptPath, e)}.js`;
    });
}

const readFieldsFromScript = async (path, scriptId) => {
    path = path.replace('[', '').replace(']', '');
    let fields = [];
    const scriptPath = join(baseScriptPath, path);
    if (!existsSync(scriptPath)) return [];
    const scriptContent = await readFile(scriptPath);
    fields = fields.concat(extractFieldsFromText(scriptContent).filter((e) => e.indexOf(scriptId) === -1));
    const paths = readPathsFromText(scriptContent, baseScriptPath, scriptPath);
    for (let i = 0; i < paths.length; i++) {
        fields = fields.concat(await readFieldsFromScript(paths[i], scriptId));
    }
    return fields;
}

const createObjectFolder = async (type) => {
    const baseObjectFolderPath = join(baseObjectPath, type);
    if (!existsSync(baseObjectFolderPath)) mkdirSync(baseObjectFolderPath);
}

module.exports = {
    setBaseStorePath,
    readXMLDirContent,
    readFieldsFromText,
    readFieldsFromScript,
    storeRecordField,
    createObjectFolder,
};