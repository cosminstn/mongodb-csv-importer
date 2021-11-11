# About
Simple CLI tool that allows importing data from a `csv` file into a [MongoDB](https://www.mongodb.com/) collection.

# How to use
The program can be used in 2 ways, by specifying args manually or with a config file. The config file method is recommended.

## Using with a config file (recommended)
Sample usage for macos platform, `config.json` is located in the current folder.
```bash
./mongodb-csv-importer-macos --cf ./sample_input/config.json
```

## Configuration file structure
```js
{
    // mongodb instance url, mongodb:// prefix is automatically added
    "url": "localhost:27017",
    "database": "test",
    "collection": "nonsense_data",
    // path of the input csv file
    "input": "./sample_input/input.csv",
    // OPTIONAL: csv separator, defaults to ,
    "separator": ",",
    // OPTIONAL: Specifies field conversions. In this case, for every entry read from the csv file, `_id` is converted to `ObjectId`, and `temperature` is converted to `number`
    "fieldMappings": {
        "_id": "ObjectId",
        "number": "number"
    }
}
```

## Using with args (not recommended)
`This Method is only suitable for simple use cases as it doesn't support field mappings.`
```bash
./mongodb-csv-importer-macos -u localhost:27017 -d test -c temperatures_2 -i ./sample_input/input.csv
```