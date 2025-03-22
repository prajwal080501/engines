import { DBEngine } from "./engines/DBEngine";

const engine = new DBEngine();
console.log("Hello World test 2");

const setConfig = async () => {
    await engine.setConfig({
        connectionString: "mongodb://localhost:27017",
        databaseName: "mydb"
    })
    console.log("Config set")
}

setConfig();

engine.execute({
    collection: 'samples',
    command: 'deleteMany',
    parameters: {
        'name': 'Jane Doe'
    },
}).then((result) => {
    console.log(result)
}).catch((err) => {
    console.log(err)
})