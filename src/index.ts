import engine from "./engines/DBEngine";
import dotenv from "dotenv";

dotenv.config();
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
      command: "updateOne",
      parameters: {
        filter: { name: "Prajwal Ladkat" },
        update: { name: "Roger Doe" },
      },
    }).then((res) => {
      console.log(res);
    }
    )
    .catch((err) => {
      console.log(err);
    });
});
