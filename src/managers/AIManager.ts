import { GoogleGenerativeAI } from "@google/generative-ai"
import dotenv from "dotenv";

dotenv.config();;
export class AIManager {
    genAi: GoogleGenerativeAI;
    key: string = process.env.GOOGLE_GEMINI_API_KEY || "";
    model:any
    constructor() {
        console.log(this.key, 'key');
        this.genAi = new GoogleGenerativeAI(this.key);
        this.model = this.genAi.getGenerativeModel({ model: "gemini-2.0-flash" });
    };

    async optimizeQuery(input:{query: Object}){
        let query = input.query;

        let prompt = "Optimize the mongodb query  " + JSON.stringify(query);
        const result = await this.model.generateContent(prompt);
        const textResult = await result.response.text();
        console.log(textResult, 'ai res');
        debugger;
        return input.query;
    }
}