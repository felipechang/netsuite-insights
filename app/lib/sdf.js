const {spawnSync} = require("child_process");

const fetchTypeObjects = async (type) => {
    const {stdout, stderr} = await spawnSync('suitecloud.cmd', [
        "object:list",
        "--type",
        type,
    ]);
    let response = String(stdout).split('\n');
    response.shift();
    response = response.map((e) => e.replace(`${type}:`, ''));
    return response.filter((e) => !!e);
}

const importObject = async (type, scriptId) => {
    console.log(`Importing ${type}:${scriptId}`);
    const {stdout, stderr} = await spawnSync('suitecloud.cmd', [
        "object:import",
        "--excludefiles",
        "--type",
        type,
        "--scriptid",
        scriptId,
        "--destinationfolder",
        `/Objects/${type}`,
    ]);
    console.log(String(stdout), String(stderr));
}

module.exports = {
    fetchTypeObjects,
    importObject,
}