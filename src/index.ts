import engine from "./engines/DBEngine";

console.log("Hello World test 2");

const setConfig = async () => {
  await engine.setConfig({
    connectionString: "mongodb://localhost:27017",
    databaseName: "mydb",
  });
  console.log("Config set");
};


setConfig().then(() => {
    engine
      .execute({
        collection: "samples",
        command: "aggregate",
        parameters: [
          {
            $match: {
              name: "Prajwal Ladkat",
            },
          },
        ],
      })
      .then((result) => {
        console.log(result);
      })
      .catch((err) => {
        console.log(err);
      });

})
