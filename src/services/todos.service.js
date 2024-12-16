import axios from "axios";
import * as allure from "allure-js-commons";


let URL = 'https://apichallenges.herokuapp.com/';


export class TodosService {
    constructor (options){
        this.options = options;
    }
    async getAllTask(headers){
        return await allure.step ("Get all task", async () => {
        const response = await axios.get(`${URL}todos`, {
            headers: headers,
            validateStatus: function (status) {
                return status < 500; // Все статусы ниже 500 считаются успешными
            }
        });
        return response;
    });
    }
    async getErrorTodo(headers){
        return await allure.step ("Get error task", async () => {
        const response = await axios.get(`${URL}todo`, {
            headers: headers,
            validateStatus: function (status) {
                return status < 500; // Все статусы ниже 500 считаются успешными 
            }
        });
        return response;
    });
    }
    async getTaskById(headers, paramId){
        return await allure.step ("Get task by id", async () => {
        const response = await axios.get(`${URL}todos/${paramId}`, {headers: headers});
        return response;
    });
    }
    async getErrorBytaskId(headers, paramId){
        return await allure.step ("Get error task by id", async () => {
        const response = await axios.get(`${URL}todos/${paramId}`, {
            headers: headers,
            validateStatus: function (status) {
                return status < 500; // Все статусы ниже 500 считаются успешными 
            }
        });
        return response;
    });
    }
    async updateTodoPost(headers, paramId, todoData){
        return await allure.step ("Update task", async () => {
        const response = await axios.post(`${URL}todos/${paramId}`, todoData, { 
            headers: headers,
            validateStatus: function (status) {
                return status < 500; // All statuses below 500 are considered successful
            }
        });
        return response;
    });
    }

    async getTodoStatusDone(headers, doneStatus) {
        return await allure.step ("Get task with status 'done'", async () => {
        const response = await axios.get(`${URL}todos`, {
            headers: headers,
            params: { doneStatus: doneStatus }
        });
        return response;
    }); 
    }

    async headTodo(headers){
        return await allure.step ("Returns the headers and status code", async () => {
        const response = await axios.head(`${URL}todos`, {headers: headers});
        return response;
    });
    }
    async createTodo(headers, todoData){
        return await allure.step ("Create a task", async () => {
        const response = await axios.post(`${URL}todos`, todoData, { 
            headers: headers,
            validateStatus: function (status) {
                return status < 500; // All statuses below 500 are considered successful
            }
        });
        return response;
    });
    }

    async updateTodoPut(headers, paramId, todoData){
        return await allure.step ("Update a task with PUT request", async () => {
        const response = await axios.put(`${URL}todos/${paramId}`, todoData, { 
            headers: headers,
            validateStatus: function (status) {
                return status < 500; // All statuses below 500 are considered successful
            }
        });
        return response;
    });
    }

    async deleteTaskById(headers, paramId){
        return await allure.step ("Delete a task by id", async () => {
        const response = await axios.delete(`${URL}todos/${paramId}`, {headers: headers});
        return response;
    });
    }

    async optionsTodo(headers){
        return await allure.step ("What verbs are allowed to be used on an endpointd", async () => {
        const response = await axios.options(`${URL}todos`, {headers: headers});
        return response;
    });
    }

    async deleteAllTask(headers, paramId){
        return await allure.step ("Delete all task by id", async () => {
        const response = await axios.delete(`${URL}todos/${paramId}`, {headers: headers});
        return response;
    });
    }

}