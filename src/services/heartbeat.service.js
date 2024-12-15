import axios from "axios";
import * as allure from "allure-js-commons";

let URL = 'https://apichallenges.herokuapp.com/';

export class HeartbeatService {
        constructor (options){
            this.options = options;
        }

        async getHeartbeat(headers){
            return await allure.step ("Check a GET request on the /heartbeat", async () => {
            const response = await axios.get(`${URL}heartbeat`, {headers: headers});
            return response;
        });
        }

        async deleteHeartbeat(headers){
            return await allure.step ("Check a DELETE request on the /heartbeat", async () => {
            const response = await axios.delete(`${URL}heartbeat`, {
                headers: headers,
                validateStatus: function (status) {
                    return status < 500; // All statuses below 500 are considered successful
                }
            });
            return response;
        });
        }

        async patchHeartbeat(headers){
            return await allure.step ("Check a PATCH request on the /heartbeat", async () => {    
            const response = await axios.patch(`${URL}heartbeat`, null, {
                    headers: headers,
                    validateStatus: function (status) {
                        return status >= 200 && status <= 500; // Все статусы от 200 до 500 считаются успешными
                    }
                });
                return response;
            });
        }

        async traceHeartbeat(headers){
            return await allure.step ("Check a TRACE request on the /heartbeat", async () => {
            const response = await axios({
                method: 'trace',
                url:`${URL}heartbeat`,
                headers: headers,
                validateStatus: function (status) {
                    return status >= 200 && status <= 503; // Все статусы от 200 до 503 считаются успешными
                }
            });
            return response;
        });
        }

        async postHeartbeat(headers){
            return await allure.step ("Check a POST request on the /heartbeat", async () => {
            const response = await axios.post(`${URL}heartbeat`, null, {
                headers: headers,
                validateStatus: function (status) {
                    return status >= 200 && status <= 503; // Все статусы от 200 до 503 считаются успешными
                }
            });
            return response;
        });
        }
}