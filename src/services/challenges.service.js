import axios from "axios";
import * as allure from "allure-js-commons";

let URL = 'https://apichallenges.herokuapp.com/';

export class ChallengesService {
    constructor (options){
        this.options = options;
    }
    async get(headers){
        return await allure.step ("Get the list of challenges", async () => {
        const response = await axios.get(`${URL}challenges`, {headers: headers});
        return response;
    });
    }
}