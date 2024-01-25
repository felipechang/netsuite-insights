const {
    fetchTypeObjects, importObject, importSuiteBundles, importSuiteScripts
} = require("./lib/sdf");
const {
    createObjectFolder
} = require("./lib/filesystem");

const fields = [
    'advancedpdftemplate',
    'clientscript',
    'crmcustomfield',
    'customlist',
    'customrecordtype',
    'entitycustomfield',
    'itemcustomfield',
    'mapreducescript',
    'massupdatescript',
    'othercustomfield',
    'restlet',
    'role',
    'savedsearch',
    'scheduledscript',
    'suitelet',
    'transactionbodycustomfield',
    'transactioncolumncustomfield',
    'usereventscript',
    'workflow',
    'workflowactionscript'
];

(async function () {
    fields.map(async (type) => {
        await createObjectFolder(type);
        const objects = await fetchTypeObjects(type);
        console.log(`${type}: ${objects.length} objects found`);
        for (let i = 0; i < objects.length; i++) {
            await importObject(type, objects[i]);
        }
    });
})();