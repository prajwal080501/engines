import engine from "./engines/DBEngine";
import dotenv from "dotenv";

dotenv.config();
console.log("Hello World test 2");

  engine.setConfig({
    connectionString: "mongodb://localhost:27017",
    databaseName: "mydb",
  });

  engine
    .execute({
      collection: "samples",
      command: "findOne",
      parameters: {
        name: "Prajwal",
      },
    }).then((res) => 
    console.log(res)
  );
