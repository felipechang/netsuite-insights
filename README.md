# NetSuite Insights

### Notes:

The SuiteScripts and SuiteBundle folders must be imported manually as NetSuite has issues importing relative paths.

### Installation

1) Install suitecloud-cli `npm install -g @oracle/suitecloud-cli` if missing. Requires Java 17 SDK.
2) Inside the src folder run `suitecloud acccount:setup` to create a project.json configuration file.

### Usage

1) Fetch NetSuite account resources either:
   - Using the SDF interactive client and store files into named folders for each type.
   - Using `npm run refresh`. Fetches resources one by one, so it takes a really long time.
2) Download the SuiteScripts and SuiteBundles folder from the file cabinet and store under src/FileCabinet
3) Run `npm run generate [folder]`: to generate [Obsidian](https://obsidian.md/download) markdown files in the specified folder path. 