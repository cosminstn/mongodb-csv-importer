const yargs = require("yargs");
const fs = require("fs");
const path = require("path");
const { MongoClient } = require("mongodb");
const csv = require("csvtojson");

const options = yargs
    .usage(
        "Usage: -u <mongo_instance_url> -d <db_name> -c <collection_name> -i <input_file_path>"
    )
    .option("cf", {
        alias: "configFile",
        describe: "Configuration File Path",
        type: "string",
        demandOption: false,
        // default: path.resolve(process.cwd, "config.json").toString(),
    })
    .option("u", {
        alias: "url",
        describe: "MongoDB Connection URL",
        type: "string",
        demandOption: false,
    })
    .option("d", {
        alias: "database",
        describe: "Database Name",
        type: "string",
        demandOption: false,
    })
    .option("c", {
        alias: "collection",
        describe: "Collection Name",
        type: "string",
        demandOption: false,
    })
    .option("i", {
        alias: "input",
        describe: "Input File Path",
        type: "string",
        demandOption: false,
    }).argv;

// check configuration
// if no config file is specified then we must have params u, d and c configured
if (options.configFile == null) {
    if (options.url == null) {
        console.error("Please specify connection url: -u <connection_url>");
        return;
    }
    if (options.database == null) {
        console.error("Please specify database name: -d <database_name>");
        return;
    }
    if (options.collection == null) {
        console.error("Please specify collection name: -c <collection_name>");
        return;
    }
    if (options.input == null) {
        console.error("Please specify input file path: -i <input_file_path>");
        return;
    }
} else {
    if (
        options.url != null ||
        options.database != null ||
        options.collection != null
    ) {
        console.error(
            "Please don't mix manual configuration with file configuration! Drop url, database and collection args from the command!"
        );
        return;
    }
}

const configurationMode = options.configFile == null ? "manual" : "file";

function processMongoConnectionUrl(url) {
    return url.startsWith("mongodb://") ? url : "mongodb://" + url;
}

(async () => {
    const mongoConfig = { url: null, database: null, collection: null };
    let collection = null;
    let inputDataUrl = null;

    try {
        if (configurationMode === "file") {
            // read data from json file
            try {
                const config = JSON.parse(
                    fs.readFileSync(path.resolve(options.configFile))
                );

                console.log("Configuration file:");
                console.log(config);

                mongoConfig.url = processMongoConnectionUrl(config.url);
                mongoConfig.database = config.database;
                mongoConfig.collection = config.collection;

                inputDataUrl = config.input;
            } catch (ex) {
                console.error(
                    "Invalid configuration file: " + options.configFile
                );
            }
        } else {
            mongoConfig.url = processMongoConnectionUrl(options.url);
            mongoConfig.database = options.database;
            mongoConfig.collection = options.collection;

            inputDataUrl = options.input;
        }

        console.info(`Connecting to url: ${mongoConfig.url}...`);

        const client = new MongoClient(mongoConfig.url);
        await client.connect();

        console.info(`Connected to url: ${mongoConfig.url}!`);

        const db = client.db(mongoConfig.database);
        collection = db.collection(mongoConfig.collection);
    } catch (ex) {
        console.error(`Could not connect to url: ${mongoConfig.url}`, ex);
        return;
    }

    let data = [];
    try {
        const rawData = fs.readFileSync(path.resolve(inputDataUrl), "utf8");
        console.log("Raw data");
        console.log(rawData);
        data = await csv().fromFile(inputDataUrl);

        console.log("Parsed data: ");
        console.log(data);
    } catch (ex) {
        console.error("Invalid input data from path: " + inputDataUrl, ex);
        throw ex;
    }

    try {
        const insertResult = await collection.insertMany(data);
        console.info("Inserted documents =>", insertResult);

        process.exit();
    } catch (ex) {
        console.error(
            "Error inserting data into collection: " + mongoConfig.collection,
            ex
        );
    }
})();
