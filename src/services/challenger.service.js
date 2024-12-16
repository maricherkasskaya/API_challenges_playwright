import axios from "axios";
import * as allure from "allure-js-commons";

let URL = 'https://apichallenges.herokuapp.com/';

export class ChallengerService {
        constructor (options){
            this.options = options;
        }

    async post(){
        return await allure.step ("Create a new challenger session", async () => {
        const response = await axios.post(`${URL}challenger`);
        return response;
    });
    }

    async getChallengerByToken(headers, token){
        return await allure.step ("Get a challenger by token", async () => {
        const response = await axios.get(`${URL}challenger/${token}`, {headers: headers});
        return response;
    });
    }

    async restoreChallengerByToken(headers, token, dataData){
        return await allure.step ("Restore a challenger by token", async () => {
        const response = await axios.put(`${URL}challenger/${token}`,dataData, {
            headers: headers,
            validateStatus: function (status) {
                return status < 500; // All statuses below 500 are considered successful
            }
        });
        return response;
    }); 
    }

    async getChallengerFromDB(headers, token){
        return await allure.step ("Get a challenger from database", async () => {
        const response = await axios.get(`${URL}challenger/database/${token}`, {headers: headers});
        return response;
    });   
    }

    async restoreChallengerFromDB(headers, token, dataData){
        return await allure.step ("Restore a challenger from database", async () => {
        const response = await axios.put(`${URL}challenger/database/${token}`,dataData, {
            headers: headers,
            validateStatus: function (status) {
                return status < 500; // All statuses below 500 are considered successful
            }
        });
        return response;
    });   
    }
}