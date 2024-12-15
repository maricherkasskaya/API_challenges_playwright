import axios from "axios";
import * as allure from "allure-js-commons";

let URL = 'https://apichallenges.herokuapp.com/';

export class SecretService {
        constructor (options){
            this.options = options;
        }

        async postSecret(headers){
            return await allure.step ("Get a X-AUTH-TOKEN", async () => {
            const response = await axios.post(`${URL}secret/token`, null, {
                headers: headers,
                validateStatus: function (status) {
                    return status < 500; // All statuses below 500 are considered successful
                }
            });
            return response;
        });
        }

        async getSecret(authHeaders){
            return await allure.step ("Get a note", async () => {
            const response = await axios.get(`${URL}secret/note`, {
                headers: authHeaders,
                validateStatus: function (status) {
                    return status < 500; // All statuses below 500 are considered successful
                }
            });
            return response;
        });
        }

        async postSecretNote(authHeaders, dataData){
            return await allure.step ("Add a note", async () => {
            const response = await axios.post(`${URL}secret/note`, dataData, {
                headers: authHeaders,
                validateStatus: function (status) {
                    return status < 500; // All statuses below 500 are considered successful
                }
            });
            return response;
        });
        }
    }