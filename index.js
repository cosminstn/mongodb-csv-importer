const yargs = require("yargs");

const options = yargs
    .usage("Usage: -c <db_url> -i <input_file_path>")
    .option("c", {
        alias: "connection",
        describe: "MongoDB Connection URL",
        type: "string",
        demandOption: true,
    })
    .option("i", {
        alias: "input",
        describe: "Input File Path",
        type: "string",
        demandOption: true,
    }).argv;

console.log(`Connected to ${options.connection}!`);

console.log(`Importing data from file ${options.input}`);
