// MARK: Dependencies
const fs = require('fs');
const ejs = require('ejs');
const getUsage = require('command-line-usage');
const commandLineArgs = require('command-line-args');
const colors = require('colors');
const mkdirp = require('mkdirp');
const moment = require('moment');

// MARK: Command Line Usage
const sections = [
    {
        header: 'createExampleFolder.js',
        content: 'Generates an empty sketch folder for a given Processing method'
    },
    {
        header: 'Options',
        optionList: [
            {
                name: 'name',
                alias: 'n',
                typeLabel: '[underline]{string}',
                description: 'The name of the method to be covered in the new folder. Can be multiple.'
            },
            {
                name: 'empty',
                alias: 'e',
                typeLabel: '[underline]{flag}',
                description: 'Do not include setup() and draw() methods'
            },
            {
                name: 'help',
                alias: 'h',
                description: 'Print this usage guide'
            },
        ]
    },
];
const usage = getUsage(sections);

// MARK: Command Line Handling
const optionDefinitions = [
    {
        name: 'name',
        alias: 'n',
        multiple: true,
    },
    {
        name: 'empty',
        alias: 'e',
        type: Boolean,
        default: false,
    },
    {
        name: 'help',
        alias: 'h',
        type: Boolean,
    },
];
const options = commandLineArgs(optionDefinitions);
if (options.help || !options.name) {
    console.log(usage);
    process.exit();
}

// MARK: Directory Structure
const rootDir = "./";
const scriptsDir = rootDir + "scripts/";
const templatesDir = scriptsDir + "templates/";

// MARK: General Helper Functions
function createDirectory(path) {
    return new Promise((fulfill, reject) => {
        mkdirp(path, (err) => { if (err) reject(err); else fulfill(); });
    });
}
function createDirectories(paths) {
    return new Promise((fulfill, reject) => {
        const promises = paths.map((path) => {
            return createDirectory(path);
        });
        Promise.all(promises).then(() => { fulfill(paths); }, reject);
    });
}
function renderEjsTemplate(templatePath, data, destination) {
    return new Promise((fulfill, reject) => {
        ejs.renderFile(templatePath, data, {}, (err, str) => {
            if (err) {
                reject("ERROR: Failed to render EJS template for template '" + templatePath + "'. Err: " + err);
            } else {
                fs.writeFile(destination, str, (err) => {
                    if (err) {
                        reject("ERROR: Failed to write rendered template to " + destination + ". Err: " + err);
                    } else {
                        fulfill(destination);
                    }
                });
            }
        });
    });
}
function appendToFile(path, str) {
    return new Promise((fulfill, reject) => {
        fs.appendFile(path, str, (err) => {
            if (err) {
                reject("ERROR: Failed to append to file " + path + ". Err: " + err);
            } else {
                fulfill();
            }
        });
    });
}

// MARK: Specific Helper Functions
function createSketchFiles(dirPaths) {
    return new Promise((fulfill, reject) => {
        const templatePath = templatesDir + "exampleSketch.ejs.pde";
        const date = moment().format('MMMM Do, YYYY');
        // Create the appropriate .pde file for each
        // of the directories we just created
        const promises = dirPaths.map((path) => {
            // Grab the name of the module from the end 
            // of the directory path
            const methodName = path.split('/').slice(-1)[0];
            // Render the EJS template with that module name
            // and save the results to the approprieat location
            const ejsData = {
                methodName: methodName,
                date: date,
            };
            const destination = path + "/" + methodName + ".pde";
            return renderEjsTemplate(templatePath, ejsData, destination);
        });

        // When we finish creating all the empty .pde files,
        Promise.all(promises).then((paths) => {
            // Append setup() and draw() methods if requested
            if (options.empty) {
                fulfill();
            } else {
                const setupStr = "\n\nvoid setup() {\n\tsize(400, 400);\n}";
                const drawStr = "void draw() {\n\n}";
                const promises = paths.map((path) => {
                    return appendToFile(path, setupStr + "\n\n" + drawStr);
                });
                Promise.all(promises).then(fulfill, reject);
            }
        }, reject);
    });
}

// MARK: Main Control
createDirectories(options.name)
    .then(createSketchFiles)
    .then(() => { console.log(colors.green("Finished successfully")); })
    .catch((err) => console.log(colors.red("ERROR: " + err)));