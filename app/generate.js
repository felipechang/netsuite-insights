const {
    processCustomRecords,
    readFieldsFromText,
    readFieldsFromScript,
    storeRecordField,
    setBaseStorePath
} = require("./lib/filesystem");
const {
    extractRecordName,
    extractSelectType,
    extractFieldsFromText
} = require("./lib/extract");
const {sep} = require("path");


(async function () {

    if (!process.argv[2]) throw new Error('Please input a folder to store results.');
    if (!process.argv[2].includes(sep)) throw new Error('Invalid folder path');

    setBaseStorePath(process.argv[2]);

    await processCustomRecords('advancedpdftemplate', async (result, filePath) => [
        {p: "---"},
        {p: `type: template`},
        {p: "---"},
        {p: `#NETSUITE`},
        {h2: `Fields:`},
        {ul: await readFieldsFromText(result, filePath)}
    ]);

    await processCustomRecords('clientscript', async (result) => [
        {p: "---"},
        {p: `type: script`},
        {p: "---"},
        {h1: result.name[0]},
        {p: `#NETSUITE`},
        {h2: `Fields:`},
        {ul: await readFieldsFromScript(result.scriptfile[0], result['$'].scriptid)}
    ]);

    await processCustomRecords('crmcustomfield', (result) => {
        const response = [
            {p: "---"},
            {p: `type: field`},
            {p: "---"},
            {h1: result.label[0]},
            {p: `#NETSUITE`},
            {p: `Description: ${result.description[0]}`},
            {p: `Type: ${result.fieldtype[0]}`},
        ];
        if (result.selectrecordtype[0]) response.push({p: `Select Record Type: ${extractSelectType(result.selectrecordtype[0])}`});
        if (result.sourcefrom[0]) response.push({p: `Source From: ${result.sourcefrom[0]}`});
        return response;
    });

    await processCustomRecords('customlist', (result) => [
        {p: "---"},
        {p: `type: list`},
        {p: "---"},
        {p: `#NETSUITE`},
        {h1: `${result.name[0]}`},
        {p: `Description: ${result.description[0]}`},
    ]);

    await processCustomRecords('customrecordtype', async (result) => {
        const response = [
            {p: "---"},
            {p: `type: record`},
            {p: "---"},
            {h1: extractRecordName(result.recordname[0])},
            {p: `#NETSUITE`},
            {p: `Description: ${result.description[0]}`},
        ];
        if (!result.customrecordcustomfields) {
            response.push({p: `#WARNING: ${result['$'].scriptid} has no fields`});
        } else {
            const ul = [];
            for (let i = 0; i < result.customrecordcustomfields.length; i++) {
                const fields = result.customrecordcustomfields[i].customrecordcustomfield;
                for (let j = 0; j < fields.length; j++) {
                    const data = [
                        {p: "---"},
                        {p: `type: field`},
                        {p: "---"},
                        {h1: fields[j].label[0]},
                        {p: `#NETSUITE`},
                        {p: `Type: ${fields[j].fieldtype[0]}`}
                    ];
                    if (fields[j].selectrecordtype[0]) data.push({
                        p: `Select Type:${extractSelectType(fields[j].selectrecordtype[0])}`
                    });
                    const id = fields[j]['$'].scriptid;
                    await storeRecordField(data, id);
                    ul.push(`[[${id}]]`)
                }
            }
            if (ul.length > 0) response.push({ul});
        }
        return response;
    });

    await processCustomRecords('entitycustomfield', (result) => {
        const response = [
            {p: "---"},
            {p: `type: field`},
            {p: "---"},
            {h1: result.label[0]},
            {p: `#NETSUITE`},
            {p: `Description: ${result.description[0]}`},
            {p: `Type: ${result.fieldtype[0]}`},
        ];
        if (result.selectrecordtype[0]) response.push({p: `Select Record Type: ${extractSelectType(result.selectrecordtype[0])}`});
        if (result.sourcefrom[0]) response.push({p: `Source From: ${result.sourcefrom[0]}`});
        return response;
    });

    await processCustomRecords('itemcustomfield', (result) => {
        const response = [
            {p: "---"},
            {p: `type: field`},
            {p: "---"},
            {h1: result.label[0]},
            {p: `#NETSUITE`},
            {p: `Description: ${result.description[0]}`},
            {p: `Type: ${result.fieldtype[0]}`},
        ];
        if (result.selectrecordtype[0]) response.push({p: `Select Record Type: ${extractSelectType(result.selectrecordtype[0])}`});
        if (result.sourcefrom[0]) response.push({p: `Source From: ${result.sourcefrom[0]}`});
        return response;
    });

    await processCustomRecords('mapreducescript', async (result) => [
        {p: "---"},
        {p: `type: script`},
        {p: "---"},
        {h1: result.name[0]},
        {p: `#NETSUITE`},
        {h2: `Fields:`},
        {ul: await readFieldsFromScript(result.scriptfile[0], result['$'].scriptid)}
    ]);

    await processCustomRecords('massupdatescript', async (result) => [
        {p: "---"},
        {p: `type: script`},
        {p: "---"},
        {h1: result.name[0]},
        {p: `#NETSUITE`},
        {h2: `Fields:`},
        {ul: await readFieldsFromScript(result.scriptfile[0], result['$'].scriptid)}
    ]);

    await processCustomRecords('othercustomfield', (result) => {
        const response = [
            {p: "---"},
            {p: `type: field`},
            {p: "---"},
            {h1: result.label[0]},
            {p: `#NETSUITE`},
            {p: `Description: ${result.description[0]}`},
            {p: `Type: ${result.fieldtype[0]}`},
        ];
        if (result.selectrecordtype[0]) response.push({p: `Select Record Type: ${extractSelectType(result.selectrecordtype[0])}`});
        if (result.sourcefrom[0]) response.push({p: `Source From: ${result.sourcefrom[0]}`});
        return response;
    });

    await processCustomRecords('restlet', async (result) => [
        {p: "---"},
        {p: `type: script`},
        {p: "---"},
        {h1: result.name[0]},
        {p: `#NETSUITE`},
        {h2: `Fields:`},
        {ul: await readFieldsFromScript(result.scriptfile[0], result['$'].scriptid)}
    ]);

    await processCustomRecords('role', (result) => [
        {p: "---"},
        {p: `type: role`},
        {p: "---"},
        {h1: `${result.name[0]}`},
        {p: `#NETSUITE`},
    ]);

    await processCustomRecords('savedsearch', (_) => [
        {p: "---"},
        {p: `type: search`},
        {p: "---"},
        {p: `#NETSUITE`},
    ]);

    await processCustomRecords('scheduledscript', async (result) => [
        {p: "---"},
        {p: `type: script`},
        {p: "---"},
        {h1: result.name[0]},
        {p: `#NETSUITE`},
        {h2: `Fields:`},
        {ul: await readFieldsFromScript(result.scriptfile[0], result['$'].scriptid)}
    ]);

    await processCustomRecords('suitelet', async (result) => [
        {p: "---"},
        {p: `type: script`},
        {p: "---"},
        {h1: result.name[0]},
        {p: `#NETSUITE`},
        {h2: `Fields:`},
        {ul: await readFieldsFromScript(result.scriptfile[0], result['$'].scriptid)}
    ]);

    await processCustomRecords('transactionbodycustomfield', (result) => {
        const response = [
            {p: "---"},
            {p: `type: field`},
            {p: "---"},
            {h1: result.label[0]},
            {p: `#NETSUITE`},
            {p: `Description: ${result.description[0]}`},
            {p: `Type: ${result.fieldtype[0]}`},
        ];
        if (result.selectrecordtype[0]) response.push({p: `Select Record Type: ${extractSelectType(result.selectrecordtype[0])}`});
        if (result.sourcefrom[0]) response.push({p: `Source From: ${result.sourcefrom[0]}`});
        return response;
    });

    await processCustomRecords('transactioncolumncustomfield', (result) => {
        const response = [
            {p: "---"},
            {p: `type: field`},
            {p: "---"},
            {h1: result.label[0]},
            {p: `#NETSUITE`},
            {p: `Description: ${result.description[0]}`},
            {p: `Type: ${result.fieldtype[0]}`},
        ];
        if (result.selectrecordtype[0]) response.push({p: `Select Record Type: ${extractSelectType(result.selectrecordtype[0])}`});
        if (result.sourcefrom[0]) response.push({p: `Source From: ${result.sourcefrom[0]}`});
        return response;
    });

    await processCustomRecords('usereventscript', async (result) => [
        {p: "---"},
        {p: `type: script`},
        {p: "---"},
        {h1: result.name[0]},
        {p: `#NETSUITE`},
        {h2: `Fields:`},
        {ul: await readFieldsFromScript(result.scriptfile[0], result['$'].scriptid)}
    ]);

    await processCustomRecords('workflow', async (result) => {
        const response = [
            {p: "---"},
            {p: `type: workflow`},
            {p: "---"},
            {h1: result.name[0]},
            {p: `#NETSUITE`},
            {p: `Description: ${result.description[0]}`},
            {h2: `Record Types:`},
            {ul: result.recordtypes[0].split('|')},
            {h2: `Fields:`},
        ];
        let stringFields = [];
        for (let i = 0; i < result.workflowstates[0].workflowstate.length; i++) {
            const ws = result.workflowstates[0].workflowstate[i];
            if (!ws.workflowactions) continue;
            for (let j = 0; j < ws.workflowactions.length; j++) {
                for (const key in ws.workflowactions[j]) {
                    const s = ws.workflowactions[j][key];
                    if (s.hasOwnProperty('triggertype')) continue;
                    for (let k = 0; k < s.length; k++) {
                        if (s[k].field) stringFields = stringFields.concat(extractFieldsFromText(JSON.stringify(s[k])));
                    }
                }
            }
        }
        response.push({ul: [...new Set(stringFields)]});
        return response;
    });

    await processCustomRecords('workflowactionscript', async (result) => [
        {p: "---"},
        {p: `type: script`},
        {p: "---"},
        {h1: result.name[0]},
        {p: `#NETSUITE`},
        {h2: `Fields:`},
        {ul: await readFieldsFromScript(result.scriptfile[0], result['$'].scriptid)}
    ]);

})();