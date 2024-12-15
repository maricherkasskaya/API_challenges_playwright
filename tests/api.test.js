import { test, expect } from '@playwright/test';
import { faker } from '@faker-js/faker';
import * as allure from "allure-js-commons";
import { ChallengerService, ChallengesService, TodosService, HeartbeatService, SecretService } from '../src/services/index';

let challenger = new ChallengerService();
let challenges = new ChallengesService();
let todos = new TodosService();
let heartbeat = new HeartbeatService();
let secret = new SecretService();

test.describe ('API challenge', ()=> {
   // let URL = 'https://apichallenges.herokuapp.com/';
    let token;
    let payload;

    test.beforeAll (async ({ request })  => {
        //Запросить ключ авторизации
        let response = await challenger.post();
        //let headers = response.headers;
        // Передаем token 
        token = response.headers['x-challenger'];

        expect(response.headers).toEqual (expect.objectContaining({'x-challenger':expect.any(String)}));
        expect (response.status).toBe(201);
        
});

test ("2. Get the list of challenges- GET /challenges @API", async ({ request }) => {
    await allure.tag ("challenges")
    const headers = {
        'x-challenger': token
    }
    let response = await challenges.get(headers);
    
    expect (response.status).toBe(200);
    expect(response.headers).toEqual (expect.objectContaining({'x-challenger':token}));
    expect (response.data.challenges.length).toBe(59);

});

test ("3. Return all the Todos in default - GET /todos @API", async ({ request }) => {
    await allure.tag ("todos")
    const headers = {
        'x-challenger': token
    }
    let response = await todos.getAllTask(headers);
    //Проверяем статус ответа
    expect (response.status).toBe(200);
    //Проверяем, что ответ содержит todos
    expect(response.data).toHaveProperty('todos');

});

test ("4. Return 404 by issuing a request on a non-existent endpoint - GET /todos @API", async ({ request }) => {
    await allure.tag ("todos")
    const headers = {
        'x-challenger': token
    }
    let response = await todos.getErrorTodo(headers);
    //Проверяем статус ответа
    expect (response.status).toBe(404);
    
});

test ("5. Return a specific todo - GET /todos/id @API", async ({ request }) => {
    await allure.tag ("todos")
    const paramId = 5;
    const headers = {
        'x-challenger': token
    }
    let response = await todos.getTaskById(headers, paramId)
    
    //Проверяем статус ответа
    expect (response.status).toBe(200);
    //Проверяем, что ответ содержит todos
    expect(response.data).toHaveProperty('todos');
    // Проверяем, что todos содержит объект с ожидаемым id
    const containsExpectedId = response.data.todos.find(todo => todo.id === paramId);
    expect(containsExpectedId.id).toBe(paramId);

});

test ("6. Return 404 for a todo that does not exist - GET /todos/id @API", async ({ request }) => {
    await allure.tag ("todos")
    const paramId = 122888;
    const headers = {
        'x-challenger': token
    }
    
    let response = await todos.getErrorBytaskId(headers, paramId)
    
    //Проверяем статус ответа
    expect (response.status).toBe(404);

});

test ("7. Get only todos which are 'done' - GET /todos?doneStatus=true @API", async ({ request }) => {
    await allure.tag ("todos")
    const paramId = 2;
    const headers = {
        'x-challenger': token
    }
    //Изменить статус todo
    let postTodo = await todos.updateTodoPost(headers, paramId, {doneStatus: true})
    
    //Получить todo со статусом done
    let response = await todos.getTodoStatusDone(headers, true)
    
    //Проверяем статус ответа 
    expect(response.status).toBe(200);

    //Проверяем, что в ответе пришёл статус true
    let allDone = response.data.todos.every(todo => todo.doneStatus === true);
    expect(allDone).toBe(true);

});
  
test ("8. See the results of a request without the body - HEAD /todos @API", async ({ request }) => {
    await allure.tag ("todos")
    const headers = {
        'x-challenger': token
    }
    let response = await todos.headTodo(headers)
    
    //Проверяем статус ответа
    expect (response.status).toBe(200);
    expect(response.headers).toEqual (expect.objectContaining({'x-challenger':token}));

});

test ("9. Create a todo - POST /todos @API", async ({ request }) => {
    await allure.tag ("todos")
    const todo = {
            title: faker.string.alpha(5),
            doneStatus: true,
            description: faker.string.alpha(20)
        };
    const headers = {
            'x-challenger': token
        }
    //Создать todo
    let response = await todos.createTodo(headers, todo)
    
    //Проверяем статус ответа
    expect(response.status).toBe(201);

    //Проверяем что в ответе содержится передаваемые данные
    expect(response.data).toEqual (expect.objectContaining(todo));

});

test ("10. Fail validation on the `doneStatus` field - POST /todos @API", async ({ request }) => {
    await allure.tag ("todos")
    const todo = {
            title: faker.string.alpha(5),
            doneStatus: "something",
            description: faker.string.alpha(20),
        };

    const headers = {
            'x-challenger': token
        }
    //Создать todo
    let response = await todos.createTodo(headers, todo)
    
    //Проверяем статус ответа
    expect(response.status).toBe(400);
    
    //Проверяем сообщение об ошибке в ответе
    const errorMessage = 'Failed Validation: doneStatus should be BOOLEAN but was STRING';
    expect(response.data.errorMessages).toContain(errorMessage);
    
});

test ("11. Fail length validation on the `title` field because your title exceeds maximum allowable characters - POST /todos @API", async ({ request }) => {
    await allure.tag ("todos")
    const todo = {
            title:  faker.string.alpha(51),
            doneStatus: true,
            description: faker.string.alpha(20),
        };

    const headers = {
            'x-challenger': token
        }
    //Создать todo
    let response = await todos.createTodo(headers, todo)
    
    //Проверяем статус ответа
    expect(response.status).toBe(400);
    
    //Проверяем сообщение об ошибке в ответе
    const errorMessage = 'Failed Validation: Maximum allowable length exceeded for title - maximum allowed is 50';
    expect(response.data.errorMessages).toContain(errorMessage);

});

test ("12. Fail length validation on the `description` because your description exceeds maximum allowable characters - POST /todos @API", async ({ request }) => {
    await allure.tag ("todos")
    const todo = {
            title:  faker.string.alpha(5),
            doneStatus: true,
            description: faker.string.alpha(201)
        };

    const headers = {
            'x-challenger': token
        }
    //Создать todo
    let response = await todos.createTodo(headers, todo)
    
    //Проверяем статус ответа
    expect(response.status).toBe(400);
    
    //Проверяем сообщение об ошибке в ответе
    const errorMessage = 'Failed Validation: Maximum allowable length exceeded for description - maximum allowed is 200';
    expect(response.data.errorMessages).toContain(errorMessage);

});


test ("13. Create a todo with maximum length title and description fields - POST /todos @API", async ({ request }) => {
    await allure.tag ("todos")
    const todo = {
            title: faker.string.alpha(50),
            doneStatus: true,
            description: faker.string.alpha(200)
        };

    const headers = {
            'x-challenger': token
        }
    //Создать todo
    let response = await todos.createTodo(headers, todo)
    
    //Проверяем статус ответа
    expect(response.status).toBe(201);

    //Проверяем что в ответе содержится передаваемые данные
    expect(response.data).toEqual (expect.objectContaining(todo));
    
});

test ("14. Fail payload length validation on the `description` - POST /todos @API", async ({ request }) => {
    await allure.tag ("todos")
    const todo = {
            title: faker.string.alpha(5000),
            doneStatus: true,
            description: faker.string.alpha(200)
        };
    const headers = {
            'x-challenger': token
        }
    //Создать todo
    let response = await todos.createTodo(headers, todo)
    
    //Проверяем статус ответа
    expect(response.status).toBe(413);
    
    //Проверяем сообщение об ошибке в ответе
    const errorMessage = 'Error: Request body too large, max allowed is 5000 bytes';
    expect(response.data.errorMessages).toContain(errorMessage);

});

test ("15. Fail validation because your payload contains an unrecognised field - POST /todos @API", async ({ request }) => {
    await allure.tag ("todos")
    const todo = {
            title: faker.string.alpha(50),
            doneStatus: true,
            description: faker.string.alpha(20),
            priority: faker.string.alpha(5)

        };
    const headers = {
            'x-challenger': token
        }
    //Создать todo
    let response = await todos.createTodo(headers, todo)
    
    //Проверяем статус ответа
    expect(response.status).toBe(400);
    
    //Проверяем сообщение об ошибке в ответе
    const errorMessage = 'Could not find field: priority';
    expect(response.data.errorMessages).toContain(errorMessage);
    
});


test ("16. Unsuccessfully create a todo whit a PUT request - PUT /todos/id @API", async ({ request }) => {
    await allure.tag ("todos")
    const paramId = 12222;
    const headers = {
        'x-challenger': token
    };
    const todo = {
        "doneStatus": true,
        "descriotion": "реклама"
    };
    let response = await todos.updateTodoPut(headers, paramId, todo);

    //Проверяем статус ответа
    expect (response.status).toBe(400);

});

test ("17. Update a todo with a POST request - POST /todos @API", async ({ request }) => {
    await allure.tag ("todos")
    const paramId = 7;
    const headers = {
        'x-challenger': token
    };
    const todo = {
            title: "Update todo"
        };

    let response = await todos.updateTodoPost(headers, paramId, todo);
    
    //Проверяем статус ответа
    expect(response.status).toBe(200);
   
    //Проверяем что в ответе содержится передаваемые данные
    expect(response.data).toEqual (expect.objectContaining(todo));

});

test ("18. Update a todo which does not exist - POST /todos @API", async ({ request }) => {
    await allure.tag ("todos")
    const paramId = 200;
    const headers = {
        'x-challenger': token
    };
    const todo = {
            title: "Update todo"
        };

    let response = await todos.updateTodoPost(headers, paramId, todo);
    //Проверяем статус ответа
    expect(response.status).toBe(404);

});

test ("19. Update an existing todo with a complete payload - PUT /todos @API", async ({ request }) => {
    await allure.tag ("todos")
    const paramId = 5;
    const headers = {
        'x-challenger': token
    };
    const todo = {
        title: faker.string.alpha(5),
        doneStatus: true,
        description: faker.string.alpha(10)
    };

    let response = await todos.updateTodoPut(headers, paramId, todo);
    
    //Проверяем статус ответа
    expect(response.status).toBe(200);
   
    //Проверяем что в ответе содержится передаваемые данные
    expect(response.data).toEqual (expect.objectContaining(todo));

});

test ("20. Update an existing todo with just mandatory items in payload  - PUT /todos @API", async ({ request }) => {
    await allure.tag ("todos")
    const paramId = 6;
    const headers = {
        'x-challenger': token
    };
    const todo = {
        title: faker.string.alpha(5)
    };

    let response = await todos.updateTodoPut(headers, paramId, todo);
    
    //Проверяем статус ответа
    expect(response.status).toBe(200);
   
    //Проверяем что в ответе содержится передаваемые данные
    expect(response.data).toEqual (expect.objectContaining(todo));

});

test ("21. Fail to update an existing todo because title is missing in payload  - PUT /todos @API", async ({ request }) => {
    await allure.tag ("todos")
    const paramId = 6;
    const headers = {
        'x-challenger': token
    };
    const todo = {
        doneStatus: true,
        description: faker.string.alpha(10)
    };

    let response = await todos.updateTodoPut(headers, paramId, todo);
    
    //Проверяем статус ответа
    expect(response.status).toBe(400);

});

test ("22. Fail to update an existing todo because id different in payload  - PUT /todos @API", async ({ request }) => {
    await allure.tag ("todos")
    const paramId = 6;
    const headers = {
        'x-challenger': token
    };
    const todo = {
        id:10,
        title: faker.string.alpha(5),
        doneStatus: true,
        description: faker.string.alpha(10)
    };

    let response = await todos.updateTodoPut(headers, paramId, todo);
    
    //Проверяем статус ответа
    expect(response.status).toBe(400);

});

test ("23. Delete a todo  - DELETE /todos @API", async ({ request }) => {
    await allure.tag ("todos")
    const paramId = 6;
    const headers = {
        'x-challenger': token
    };

    let response = await todos.deleteTaskById (headers, paramId);
    
    //Проверяем статус ответа
    expect(response.status).toBe(200);
    
    //Отправляем get запрос по удаленному id
    let getResponse = await todos.getErrorBytaskId(headers,paramId);

    //Проверяем что todo удален
    expect (getResponse.status).toBe(404);

});

test ("24. Identify the allowed verbs for an API End Point - OPTIONS /todos @API", async ({ request }) => {
    await allure.tag ("todos")
    const headers = {
        'x-challenger': token
    };
    let response = await todos.optionsTodo(headers)
    
    //Проверяем статус ответа
    expect(response.status).toBe(200);
    expect(response.headers).toEqual (expect.objectContaining({'x-challenger':token}));
    expect(response.headers).toEqual (expect.objectContaining({'allow': 'OPTIONS, GET, HEAD, POST'}));

});

test ("25. Receive results in XML format with an `Accept` header of `application/xml`  - GET /todos @API", async ({ request }) => {
    await allure.tag ("todos")
    const headers = {
        'x-challenger': token,
        'Accept': 'application/xml'
    };
    let response = await todos.getAllTask(headers);
    
    //Проверяем статус ответа
    expect(response.status).toBe(200);
   
    //Проверяем, что заголовок содержит нужный 'content-type'
    expect(response.headers['content-type']).toBe('application/xml');

});

test ("26. Receive results in JSON format with an `Accept` header of `application/json` - GET /todos @API", async ({ request }) => {
    await allure.tag ("todos")
    const headers = {
        'x-challenger': token,
        'Accept': 'application/json'
    };
    let response = await todos.getAllTask(headers);
    
    //Проверяем статус ответа
    expect(response.status).toBe(200);
   
    //Проверяем, что заголовок содержит нужный 'content-type'
    expect(response.headers['content-type']).toBe('application/json');

});

test ("27. Receive results in default JSON format with an `Accept` header of `*/*`  - GET /todos @API", async ({ request }) => {
    await allure.tag ("todos")
    const headers = {
        'x-challenger': token,
        'Accept': '*/*'
    };
    let response = await todos.getAllTask(headers);
    
    //Проверяем статус ответа
    expect(response.status).toBe(200);
   
    //Проверяем, что заголовок содержит нужный 'content-type'
    expect(response.headers['content-type']).toBe('application/json');

});

test ("28. Receive results in the preferred XML format with an `Accept` header of `application/xml, application/json` - GET /todos @API", async ({ request }) => {
    await allure.tag ("todos")
    const headers = {
        'x-challenger': token,
        'Accept': 'application/xml, application/json'
    };
    let response = await todos.getAllTask(headers);
    
    //Проверяем статус ответа
    expect(response.status).toBe(200);
   
    //Проверяем, что заголовок содержит нужный 'content-type'
    expect(response.headers['content-type']).toBe('application/xml');

});

test ("29. Receive results in default JSON format with no `Accept`  - GET /todos @API", async ({ request }) => {
    await allure.tag ("todos")
    const headers = {
        'x-challenger': token,
        'Accept': ''
    };
    let response = await todos.getAllTask(headers);
    
    //Проверяем статус ответа
    expect(response.status).toBe(200);
   
    //Проверяем, что заголовок содержит нужный 'content-type'
    expect(response.headers['content-type']).toBe('application/json');

});

test ("30. Receive 406 'NOT ACCEPTABLE' status code with 'Accept': 'application/gzip'  - GET /todos @API", async ({ request }) => {
    await allure.tag ("todos")
    const headers = {
        'x-challenger': token,
        'Accept': 'application/gzip'
    };
    let response = await todos.getAllTask(headers);
    
    //Проверяем статус ответа
    expect(response.status).toBe(406);

});

test ("31. Create a todo using Content-Type `application/xml`, and Accepting only XML  - POST /todos @API", async ({ request }) => {
    await allure.tag ("todos")
    const headers = {
        'x-challenger': token,
        'Accept': 'application/xml',
        'Content-type': 'application/xml'
    };
    const todo = `
        <title>${faker.string.alpha(5)}</title>
        <description>${faker.string.alpha(10)}</description>
        `; 

    let response = await todos.createTodo(headers, todo);
    
    //Проверяем статус ответа
    expect(response.status).toBe(201);

    //Проверяем, что заголовок содержит нужный 'content-type'
    expect(response.headers['content-type']).toBe('application/xml');
    

});

test ("32. Create a todo using Content-Type `application/json`, and Accepting only JSON - POST /todos @API", async ({ request }) => {
    await allure.tag ("todos")
    const headers = {
        'x-challenger': token,
        'Accept': 'application/json',
        'Content-type': 'application/json'
    };
    const todo = {
            title: faker.string.alpha(5),
            doneStatus: true,
            description: faker.string.alpha(20)
        };

    let response = await todos.createTodo(headers, todo);

    //Проверяем статус ответа
    expect(response.status).toBe(201);

    //Проверяем, что заголовок содержит нужный 'content-type'
    expect(response.headers['content-type']).toBe('application/json');

    //Проверяем что в ответе содержится передаваемые данные
    expect(response.data).toEqual (expect.objectContaining(todo));

});

test ("33. Generate a 415 status code with an unsupported content type - POST /todos @API", async ({ request }) => {
    await allure.tag ("todos")
    const headers = {
        'x-challenger': token,
        'Accept': '*/*',
        'Content-type': 'something'
    };
    const todo = {
            title: faker.string.alpha(5),
            doneStatus: true,
            description: faker.string.alpha(20)
        };
    let response = await todos.createTodo(headers, todo);

    //Проверяем статус ответа
    expect(response.status).toBe(415);
    
    //Проверяем текст ошибки
    const errorMessage = 'Unsupported Content Type - something';
    expect(response.data.errorMessages).toContain(errorMessage);

});

test("34. Return the progress data payload - GET /challenger @API", async ({ request }) => {
    await allure.tag ("challenger")
    const headers = {
        'x-challenger': token
    };
    
    let response = await challenger.getChallengerByToken(headers, token);

    payload = await response.data;
    
    //Проверяем статус ответа
    expect(response.status).toBe(200);
    expect(response.headers).toEqual (expect.objectContaining({'x-challenger':token}));

});

test ("35. Restore that challenger's progress into memory - PUT /challenger @API", async ({ request }) => {
    await allure.tag ("challenger")
    const headers = {
        'x-challenger': token
    };
    const data = payload;
    
    let response = await challenger.restoreChallengerByToken(headers, token, data);
    //Проверяем статус ответа
    expect (response.status).toBe(200);
    //Проверяем что в ответе содержится передаваемые данные
    expect(response.data).toEqual (expect.objectContaining(payload));
    
});

test ("37. Retrieve the current todos database for the user - GET / challenger/database / guid @API", async ({ request }) => {
    await allure.tag ("challenger")
    const headers = {
        'x-challenger': token
    };
    
    let response = await challenger.getChallengerFromDB(headers, token);
    
    //Проверяем статус ответа
    expect(response.status).toBe(200);
    expect(response.headers).toEqual (expect.objectContaining({'x-challenger':token}));

});

test ("38. Restore the Todos database in memory - PUT /challenger @API", async ({ request }) => {
    await allure.tag ("challenger")
    const headers = {
        'x-challenger': token
    };
    //Получаем прогресс из базы
    let getChallengerFromDB = await challenger.getChallengerFromDB(headers, token);
    //Сохраняем ответ
    const data = await getChallengerFromDB.data;
    //Восстанавливаем прогресс
    let response = await challenger.restoreChallengerFromDB(headers, token, data);
    //Проверяем статус ответа
    expect (response.status).toBe(204);

});

test ("39. Create a todo using Content-Type `application/xml` but Accept `application/json`  - POST /todos @API", async ({ request }) => {
    await allure.tag ("todos")
    const headers = {
        'x-challenger': token,
        'Accept': 'application/json',
        'Content-type': 'application/xml'
    };
    const todo = `
        <title>${faker.string.alpha(5)}</title>
        <description>${faker.string.alpha(10)}</description>
        `; 

    let response = await todos.createTodo(headers, todo);
    
    //Проверяем статус ответа
    expect(response.status).toBe(201);

    //Проверяем, что заголовок содержит нужный 'content-type'
    expect(response.headers['content-type']).toBe('application/json');
    
});

test ("40. Create a todo using Content-Type `application/json` but Accept `application/xml`  - POST /todos @API", async ({ request }) => {
    await allure.tag ("todos")
    const headers = {
        'x-challenger': token,
        'Accept': 'application/xml',
        'Content-type': 'application/json'
    };
    const todo = {
        title: faker.string.alpha(5),
        doneStatus: true,
        description: faker.string.alpha(20)
    };

    let response = await todos.createTodo(headers, todo);
    
    //Проверяем статус ответа
    expect(response.status).toBe(201);

    //Проверяем, что заголовок содержит нужный 'content-type'
    expect(response.headers['content-type']).toBe('application/xml');
    
});

test ("41. Receive 405 with a DELETE request on the `/heartbeat`  - DELETE /heartbeat @API", async ({ request }) => {
    await allure.tag ("heartbeat")
    const headers = {
        'x-challenger': token
    };
    let response = await heartbeat.deleteHeartbeat(headers);
    
    //Проверяем статус ответа
    expect(response.status).toBe(405);

});

test ("42. Receive 500 with a PATCH request on the `/heartbeat`  - PATCH /heartbeat @API", async ({ request }) => {
    await allure.tag ("heartbeat")
    const headers = {
        'x-challenger': token
    };
    let response = await heartbeat.patchHeartbeat(headers);
    
    //Проверяем статус ответа
    expect(response.status).toBe(500);

});

test ("43. Receive 501 a TRACE request on the `/heartbeat`  - TRACE /heartbeat @API", async ({ request }) => {
    await allure.tag ("heartbeat")
    const headers = {
        'x-challenger': token
    };
    let response = await heartbeat.traceHeartbeat(headers);
    
    //Проверяем статус ответа
    expect(response.status).toBe(501);
    
});

test ("44. Receive 204 with a GET request on the `/heartbeat` - GET /heartbeat @API", async ({ request }) => {
    await allure.tag ("heartbeat")
    const headers = {
        'x-challenger': token
    };

    let response = await heartbeat.getHeartbeat(headers);
    
    //Проверяем статус ответа
    expect(response.status).toBe(204);
    expect(response.headers).toEqual (expect.objectContaining({'x-challenger':token}));
    
});

test ("45. Receive 405 when you override the Method Verb to a DELETE  - POST /heartbeat @API", async ({ request }) => {
    await allure.tag ("heartbeat")
    const headers = {
        'x-challenger': token,
        'X-HTTP-Method-Override': 'DELETE'
    };
    let response = await heartbeat.postHeartbeat(headers);
 
    //Проверяем статус ответа
    expect(response.status).toBe(405);

});

test ("46. Receive 500 when you override the Method Verb to a PATCH  - POST /heartbeat @API", async ({ request }) => {
    await allure.tag ("heartbeat")
    const headers = {
        'x-challenger': token,
        'X-HTTP-Method-Override': 'PATCH'
    }
    let response = await heartbeat.postHeartbeat(headers);

    //Проверяем статус ответа
    expect(response.status).toBe(500);

});

test ("47. Receive 501 (Not Implemented) when you override the Method Verb to a TRACE  - POST /heartbeat @API", async ({ request }) => {
    await allure.tag ("heartbeat")
    const headers ={
        'x-challenger': token,
        'X-HTTP-Method-Override': 'TRACE'
    };
    let response = await heartbeat.postHeartbeat(headers);

    //Проверяем статус ответа
    expect(response.status).toBe(501);    

});

test ("48. Receive 401 when Basic auth username/password is not admin/password - POST /secret/token @API", async ({ request }) => {
    await allure.tag ("secret")
    const headers = {
        'x-challenger': token,
        'Authorization': 'Basic YWRtaW46cGFzc3dvcmRk'
    
    };

    let response = await secret.postSecret (headers);

    //Проверяем статус ответа
    expect(response.status).toBe(401); 

});

test ("49. Receive 201 when Basic auth username/password is admin/password - POST /secret/token @API", async ({ request }) => {
    await allure.tag ("secret")
    const headers = {
        'x-challenger': token,
        'Authorization': 'Basic YWRtaW46cGFzc3dvcmQ='
    
    };
    let response = await secret.postSecret(headers);
    //Проверяем статус ответа
    expect(response.status).toBe(201);

    //Проверяем токены в ответе
    expect(response.headers).toEqual (expect.objectContaining({'x-challenger':token}));
    expect(response.headers).toHaveProperty('x-auth-token');
    
});

test ("50. Receive 403 when X-AUTH-TOKEN does not match a valid token - GET /secret/note @API", async ({ request }) => {
    await allure.tag ("secret")
    const authHeaders = {
        'x-challenger': token,
        'x-auth-token': 'something'
    };
    let response = await secret.getSecret(authHeaders);
 
    //Проверяем статус ответа
    expect(response.status).toBe(403);

});

test ("51. Receive 401 when no X-AUTH-TOKEN header present - GET /secret/note @API", async ({ request }) => {
    await allure.tag ("secret")
    const authHeaders = {
        'x-challenger': token
    
    }
    let response = await secret.getSecret(authHeaders);
  
    //Проверяем статус ответа
    expect(response.status).toBe(401);

});

test ("52. Receive 200 when valid X-AUTH-TOKEN used - response body contain the note  - GET /secret/note @API", async ({ request }) => {
    await allure.tag ("secret")
    const headers = {
        'x-challenger': token,
        'Authorization': 'Basic YWRtaW46cGFzc3dvcmQ='
    
    }
    let getTokenResponse = await secret.postSecret(headers);

    let tokenHeaders = getTokenResponse.headers;
    let authToken = tokenHeaders['x-auth-token'];
    const authHeaders = {
        'x-challenger': token,
        'x-auth-token': authToken
    
    };

    let authResponse = await secret.getSecret(authHeaders);

    //Проверяем статус ответа
    expect(authResponse.status).toBe(200);
    expect(authResponse.headers).toEqual (expect.objectContaining({'x-challenger':token}));
    
});

test ("53. Receive 200 when valid X-AUTH-TOKEN used  - POST /secret/note @API", async ({ request }) => {
    await allure.tag ("secret")
    const headers = {
        'x-challenger': token,
        'Authorization': 'Basic YWRtaW46cGFzc3dvcmQ='
    
    }
    let getTokenResponse = await secret.postSecret(headers);

    let tokenHeaders = getTokenResponse.headers;
    let authToken = tokenHeaders['x-auth-token'];
    const authHeaders = {
        'Content-Type': 'application/json',
        'x-challenger': token,
        'x-auth-token': authToken
    };

    const data = {
      "note": faker.string.alpha(30)
   };

    let response = await secret.postSecretNote(authHeaders, data);
    
    //Проверяем статус ответа
    expect(response.status).toBe(200);
    expect(response.headers).toEqual (expect.objectContaining({'x-challenger':token}));

    //Проверяем что в ответе содержится передаваемые данные
   expect(response.data).toEqual (expect.objectContaining(data));
    
});

test ("54. Receive 401 when no X-AUTH-TOKEN present  - POST /secret/note @API", async ({ request }) => {
    await allure.tag ("secret")
    const authHeaders = {
        'Content-Type': 'application/json',
        'x-challenger': token
    };
    const data = {
        "note": faker.string.alpha(30)
     };
    
    let response = await secret.postSecretNote(authHeaders, data);

    //Проверяем статус ответа
    expect(response.status).toBe(401);
    expect(response.headers).toEqual (expect.objectContaining({'x-challenger':token}));
    
});

test ("55. Receive 403 when X-AUTH-TOKEN does not match a valid token - POST /secret/note @API", async ({ request }) => {
    await allure.tag ("secret")
    const authHeaders = {
        'Content-Type': 'application/json',
        'x-challenger': token,
        'x-auth-token': 'something'
    };
    const data = {
        "note": faker.string.alpha(30)
     };
    
     let response = await secret.postSecretNote(authHeaders, data);

    //Проверяем статус ответа
    expect(response.status).toBe(403);
    expect(response.headers).toEqual (expect.objectContaining({'x-challenger':token}));
    
});

test ("56. Receive 200 when using the X-AUTH-TOKEN value as an Authorization Bearer token - response body contain the note  - GET /secret/note @API", async ({ request }) => {
    await allure.tag ("secret")
    const headers = {
        'x-challenger': token,
        'Authorization': 'Basic YWRtaW46cGFzc3dvcmQ='
    
    };
    let getTokenResponse = await secret.postSecret(headers);

    let tokenHeaders = getTokenResponse.headers;
    let authToken = tokenHeaders['x-auth-token'];

    const authHeaders = {
        'Content-Type': 'application/json',
        'x-challenger': token,
        'Authorization': `Bearer ${authToken}`
    }; 

    let response = await secret.getSecret(authHeaders);
    
    //Проверяем статус ответа
    expect(response.status).toBe(200);
    expect(response.headers).toEqual (expect.objectContaining({'x-challenger':token}));

    //Проверяем, что в теле приходит note
    expect(response.data).toHaveProperty('note');
    
});

test ("57. Receive 200 when valid X-AUTH-TOKEN value used as an Authorization Bearer token  - POST /secret/note @API", async ({ request }) => {
    await allure.tag ("secret")
    const headers = {
        'x-challenger': token,
        'Authorization': 'Basic YWRtaW46cGFzc3dvcmQ='
    
    };
    let getTokenResponse = await secret.postSecret(headers);

    let tokenHeaders = getTokenResponse.headers;
    let authToken = tokenHeaders['x-auth-token'];

    const authHeaders ={
        'Content-Type': 'application/json',
        'x-challenger': token,
        'Authorization': `Bearer ${authToken}`
    };
    const data = {
        "note": faker.string.alpha(30)
     };

     let response = await secret.postSecretNote(authHeaders, data);

    //Проверяем статус ответа
    expect(response.status).toBe(200);
    expect(response.headers).toEqual (expect.objectContaining({'x-challenger':token}));

    //Проверяем что в ответе содержится передаваемые данные
    expect(response.data).toEqual (expect.objectContaining(data));
    
});

test ("58. Delete the all todo in system - DELETE /todos / {id} @API", async ({ request }) => {
    await allure.tag ("todos")
    const headers = {
        'x-challenger': token
    }
    
    let getAllTodo = await todos.getAllTask(headers);
    
    //Получаем id todo
    let body = getAllTodo.data;
    const todoId = body.todos.map(todo => todo.id);

    //Цикл в котором отправляется запрос на удаление с id
    for (let paramId of todoId) {
        let deleteResponse = await todos.deleteAllTask(headers, paramId);
        
        //Проверяем статус ответа в каждом запросе
        expect(deleteResponse.status).toBe(200);
    };

});

test ("59. Add the maximum number of TODOS allowed for a user  - POST /todos @API", async ({ request }) => {
    await allure.tag ("todos")
    const headers = {
        'x-challenger': token
    }
    
    let getAllTodo = await todos.getAllTask(headers);
    
    let body = getAllTodo.data;
    let todoCount = body.todos.length;
    
    let todo = {
        title: faker.string.alpha(5),
        doneStatus: true,
        description: faker.string.alpha(20)
    }
    //Цикл в котором отправляется запрос на создание todo
    for (let i = 0; i < 20-todoCount ; i++) {
        let response = await todos.createTodo(headers, todo);

        let body = response.data;
        //Проверяем статус ответа в каждом запросе
        expect(response.status).toBe(201);
        
        //Проверяем, что ответ в каждом запросе содержит id, title, doneStatus, description
        expect(body).toHaveProperty("id");
        expect(body).toHaveProperty("title");
        expect(body).toHaveProperty("doneStatus");
        expect(body).toHaveProperty("description");

    }
    //Проверяем, что больше нельзя создать todo
    let overResponse = await todos.createTodo(headers, todo);
    //Проверяем статус ответа
    expect(overResponse.status).toBe(400);
});
test ("36. Restore that challenger's progress into memory - PUT /challenger @API", async ({ request }) => {
    await allure.tag ("todos")
    let headers = {
        'x-challenger': token
    }

    let getResponse = await challenger.getChallengerByToken(headers, token);

    let newPayload = getResponse.data; 

    //Генерируем новый токен
    let newToken =faker.string.uuid();
    console.log (newToken);

    // Подставляем newToken в newPayload
    newPayload["xChallenger"] = newToken;
    let data = newPayload;
    let newHeaders = {
        'x-challenger': newToken
    };
    
    let response = await challenger.restoreChallengerByToken(newHeaders, newToken, data)

    //Проверяем статус ответа
    expect (response.status).toBe(201);

});
});