import { test, expect } from '@playwright/test';
import { faker } from '@faker-js/faker';


test.describe ('API challenge', ()=> {
    let URL = 'https://apichallenges.herokuapp.com/';
    let token;
    let payload;

    test.beforeAll (async ({ request })  => {
        //Запросить ключ авторизации
        let response = await request.post(`${URL}challenger`);
        let headers = await response.headers();
        // Передаем token 
        token = headers['x-challenger'];

        expect(headers).toEqual (expect.objectContaining({'x-challenger':expect.any(String)}));
        expect (response.status()).toBe(201);
        console.log (token);
        
});

test ("2. Получить список заданий со статусом - GET /challenges @API", async ({ request }) => {
    let response = await request.get(`${URL}challenges`, {
        headers: {
            'x-challenger': token
        },
    });
    let body = await response.json();
    let headers = await response.headers();
    
    expect (response.status()).toBe(200);
    expect(headers).toEqual (expect.objectContaining({'x-challenger':token}));
    expect (body.challenges.length).toBe(59);

});

test ("3. Получить список заданий - GET /todos @API", async ({ request }) => {
    let response = await request.get(`${URL}todos`, {
        headers: {
            'x-challenger': token
        },
    });
    let body = await response.json();
    
    //Проверяем статус ответа
    expect (response.status()).toBe(200);
    //Проверяем, что ответ содержит todos
    expect(body).toHaveProperty('todos');

});

test ("4. Получить ошибку по некорректной ручке - GET /todos @API", async ({ request }) => {
    let response = await request.get(`${URL}todo`, {
        headers: {
            'x-challenger': token
        },
    });
    
    //Проверяем статус ответа
    expect (response.status()).toBe(404);
    

});

test ("5. Получить конкретное задание по id - GET /todos/id @API", async ({ request }) => {
    const paramId = 5;
    let response = await request.get(`${URL}todos/${paramId}`, {
        headers: {
            'x-challenger': token
        },
    });
    
    let body = await response.json();
    let headers = await response.headers();
    
    //Проверяем статус ответа
    expect (response.status()).toBe(200);
    
    //Проверяем, что ответ содержит todos
    expect(body).toHaveProperty('todos');

    // Проверяем, что todos содержит объект с ожидаемым id
    const containsExpectedId = body.todos.some(todo => todo.id === paramId);
    expect(containsExpectedId).toBe(true);

});

test ("6. Получить ошибку по несуществующему id - GET /todos/id @API", async ({ request }) => {
    let response = await request.get(`${URL}todos/122888`, {
        headers: {
            'x-challenger': token
        },
    });
    
    //Проверяем статус ответа
    expect (response.status()).toBe(404);

});

test ("7. Получить список заданий со статусом Выполнено - GET /todos?doneStatus=true @API", async ({ request }) => {
    
    //Изменить статус todo
    let postTodos = await request.post(`${URL}todos/2`, {
    headers: {
        'x-challenger': token
    },
    data: {
        doneStatus: true
    }
    });
    
    //Получить todo со статусом done
    const status = {
        "doneStatus": true
    }
    let response = await request.get(`${URL}todos`, {
        headers: {
            'x-challenger': token
        },
        params: status
    });
    let body = await response.json();
    
    //Проверяем статус ответа 
    expect(response.status()).toBe(200);

    //Проверяем, что в ответе пришёл статус true
    let allDone = body.todos.every(todo => todo.doneStatus === true);
    expect(allDone).toBe(true);

});
  
test ("8. Проверить что запрос отдает 200 - HEAD /todos @API", async ({ request }) => {
    let response = await request.head(`${URL}todos`, {
        headers: {
            'x-challenger': token
        },
    });
    let headers = await response.headers();
    
    //Проверяем статус ответа
    expect (response.status()).toBe(200);
    expect(headers).toEqual (expect.objectContaining({'x-challenger':token}));

});

test ("9. Coздать новое задание - POST /todos @API", async ({ request }) => {
    const todo = {
            title: faker.string.alpha(5),
            doneStatus: true,
            description: faker.string.alpha(20)
        };

    let response = await request.post(`${URL}todos`, {
        headers: {
            'x-challenger': token
        },
        data: todo
    });
    let body = await response.json();
    
    //Проверяем статус ответа
    expect(response.status()).toBe(201);

    //Проверяем что в ответе содержится передаваемые данные
    expect(body).toEqual (expect.objectContaining(todo));

});

test ("10. Получить ошибку 400 по полю doneStatus - POST /todos @API", async ({ request }) => {
    const todo = {
            title: faker.string.alpha(5),
            doneStatus: "something",
            description: faker.string.alpha(20),
        };

    let response = await request.post(`${URL}todos`, {
        headers: {
            'x-challenger': token
        },
        data: todo
    });
    
    let body = await response.json();
    
    //Проверяем статус ответа
    expect(response.status()).toBe(400);
    
    //Проверяем сообщение об ошибке в ответе
    const errorMessage = 'Failed Validation: doneStatus should be BOOLEAN but was STRING';
    expect(body.errorMessages).toContain(errorMessage);
    
});

test ("11. Получить ошибку 400 по длине строки по полю title - POST /todos @API", async ({ request }) => {
    const todo = {
            title:  faker.string.alpha(51),
            doneStatus: true,
            description: faker.string.alpha(20),
        };

    let response = await request.post(`${URL}todos`, {
        headers: {
            'x-challenger': token
        },
        data: todo
    });

    let body = await response.json();

    //Проверяем статус ответа
    expect(response.status()).toBe(400);
    
    //Проверяем сообщение об ошибке в ответе
    const errorMessage = 'Failed Validation: Maximum allowable length exceeded for title - maximum allowed is 50';
    expect(body.errorMessages).toContain(errorMessage);

});

test ("12. Получить ошибку 400 по длине строки по полю description - POST /todos @API", async ({ request }) => {
    const todo = {
            title:  faker.string.alpha(5),
            doneStatus: true,
            description: faker.string.alpha(201)
        };

    let response = await request.post(`${URL}todos`, {
        headers: {
            'x-challenger': token
        },
        data: todo
    });

    let body = await response.json();

    //Проверяем статус ответа
    expect(response.status()).toBe(400);
    
    //Проверяем сообщение об ошибке в ответе
    const errorMessage = 'Failed Validation: Maximum allowable length exceeded for description - maximum allowed is 200';
    expect(body.errorMessages).toContain(errorMessage);

});


test ("13. Coздать новое задание c максимальной длиной строк по полям title и descriprion - POST /todos @API", async ({ request }) => {
    const todo = {
            title: faker.string.alpha(50),
            doneStatus: true,
            description: faker.string.alpha(200)
        };

    let response = await request.post(`${URL}todos`, {
        headers: {
            'x-challenger': token
        },
        data: todo
    });
    let body = await response.json();
    
    //Проверяем статус ответа
    expect(response.status()).toBe(201);

    //Проверяем что в ответе содержится передаваемые данные
    expect(body).toEqual (expect.objectContaining(todo));
    
});

test ("14. Получить ошибку 413 по размеру нагрузки по полям description или title - POST /todos @API", async ({ request }) => {
    const todo = {
            title: faker.string.alpha(5000),
            doneStatus: true,
            description: faker.string.alpha(200)
        };

    let response = await request.post(`${URL}todos`, {
        headers: {
            'x-challenger': token
        },
        data: todo
    });
    let body = await response.json();
    
    //Проверяем статус ответа
    expect(response.status()).toBe(413);
    
    //Проверяем сообщение об ошибке в ответе
    const errorMessage = 'Error: Request body too large, max allowed is 5000 bytes';
    expect(body.errorMessages).toContain(errorMessage);

});

test ("15. Получить ошибку 400 по неизвестному полю priority - POST /todos @API", async ({ request }) => {
    const todo = {
            title: faker.string.alpha(50),
            doneStatus: true,
            description: faker.string.alpha(20),
            priority: faker.string.alpha(5)

        };

    let response = await request.post(`${URL}todos`, {
        headers: {
            'x-challenger': token
        },
        data: todo
    });
    let body = await response.json();
    
    //Проверяем статус ответа
    expect(response.status()).toBe(400);
    
    //Проверяем сообщение об ошибке в ответе
    const errorMessage = 'Could not find field: priority';
    expect(body.errorMessages).toContain(errorMessage);
    
});


test ("16. Отредактировать задание - PUT /todos/id @API", async ({ request }) => {
    const todo = {
        "doneStatus": true,
        "descriotion": "реклама"
    };
    let response = await request.put(`${URL}todos/12222`, {
        headers: {
            'x-challenger': token
        },
        data: todo
    });

    //Проверяем статус ответа
    expect (response.status()).toBe(400);

});

test ("17. Отредактировать todo/7 полю doneStatus - POST /todos @API", async ({ request }) => {
    const todo = {
            title: "Update todo"
        };

    let response = await request.post(`${URL}todos/7`, {
        headers: {
            'x-challenger': token
        },
        data: todo
    });
    let body = await response.json();
    
    //Проверяем статус ответа
    expect(response.status()).toBe(200);
   
    //Проверяем что в ответе содержится передаваемые данные
    expect(body).toEqual (expect.objectContaining(todo));

});

test ("18. Получить ошибку 404 по несуществующему todo - POST /todos @API", async ({ request }) => {
    const todo = {
            title: "Update todo"
        };

    let response = await request.post(`${URL}todos/100`, {
        headers: {
            'x-challenger': token
        },
        data: todo
    });
    
    //Проверяем статус ответа
    expect(response.status()).toBe(404);

});

test ("19. Отредактировать полностью todo/5  - PUT /todos @API", async ({ request }) => {
    const todo = {
        title: faker.string.alpha(5),
        doneStatus: true,
        description: faker.string.alpha(10)
    };

    let response = await request.put(`${URL}todos/5`, {
        headers: {
            'x-challenger': token
        },
        data: todo
    });
    let body = await response.json();
    
    //Проверяем статус ответа
    expect(response.status()).toBe(200);
   
    //Проверяем что в ответе содержится передаваемые данные
    expect(body).toEqual (expect.objectContaining(todo));

});

test ("20. Отредактировать частично todo/6  - PUT /todos @API", async ({ request }) => {
    const todo = {
        title: faker.string.alpha(5)
    };

    let response = await request.put(`${URL}todos/6`, {
        headers: {
            'x-challenger': token
        },
        data: todo
    });

    let body = await response.json();
    
    //Проверяем статус ответа
    expect(response.status()).toBe(200);
   
    //Проверяем что в ответе содержится передаваемые данные
    expect(body).toEqual (expect.objectContaining(todo));

});

test ("21. Получить ошибку 400 при редактировании без передачи заголовка todo/6  - PUT /todos @API", async ({ request }) => {
    const todo = {
        doneStatus: true,
        description: faker.string.alpha(10)
    };

    let response = await request.put(`${URL}todos/6`, {
        headers: {
            'x-challenger': token
        },
        data: todo
    });

    let headers = await response.headers();
    
    //Проверяем статус ответа
    expect(response.status()).toBe(400);

});

test ("22. Получить ошибку 400 при редактировании с передачей отличного id для todo/6  - PUT /todos @API", async ({ request }) => {
    const todo = {
        id:10,
        title: faker.string.alpha(5),
        doneStatus: true,
        description: faker.string.alpha(10)
    };

    let response = await request.put(`${URL}todos/6`, {
        headers: {
            'x-challenger': token
        },
        data: todo
    });
    
    //Проверяем статус ответа
    expect(response.status()).toBe(400);

});

test ("23. Удалить todo/7  - DELETE /todos @API", async ({ request }) => {

    let response = await request.delete(`${URL}todos/6`, {
        headers: {
            'x-challenger': token
        }
    });

    let headers = await response.headers();
    
    //Проверяем статус ответа
    expect(response.status()).toBe(200);
    
    //Отправляем get запрос по удаленному id
    let getResponse = await request.get(`${URL}todos/6`, {
        headers: {
            'x-challenger': token
        }

    });

    //Проверяем что todo удален
    expect (getResponse.status()).toBe(404);

});

test ("24. Получить разрешенные методы для запроса - OPTIONS /todos @API", async ({ request }) => {

    let response = await request.fetch(`${URL}todos`, {
        method: "OPTIONS",
        headers: {
            'x-challenger': token
        }
    });

    let headers = await response.headers();
    
    //Проверяем статус ответа
    expect(response.status()).toBe(200);
    expect(headers).toEqual (expect.objectContaining({'x-challenger':token}));
    expect(headers).toEqual (expect.objectContaining({'allow': 'OPTIONS, GET, HEAD, POST'}));

});

test ("25. Получить ответ в формате xml для запроса с заголовком 'Accept': 'application/xml'  - GET /todos @API", async ({ request }) => {
    
    let response = await request.get(`${URL}todos`, {
        headers: {
            'x-challenger': token,
            'Accept': 'application/xml'
        }
    });

    let headers = await response.headers();
    
    //Проверяем статус ответа
    expect(response.status()).toBe(200);
   
    //Проверяем, что заголовок содержит нужный 'content-type'
    expect(headers['content-type']).toBe('application/xml');

});

test ("26. Получить ответ в формате json для запроса с заголовком 'Accept': 'application/json' - GET /todos @API", async ({ request }) => {
    
    let response = await request.get(`${URL}todos`, {
        headers: {
            'x-challenger': token,
            'Accept': 'application/json'
        }
    });

    let headers = await response.headers();
    
    //Проверяем статус ответа
    expect(response.status()).toBe(200);
   
    //Проверяем, что заголовок содержит нужный 'content-type'
    expect(headers['content-type']).toBe('application/json');

});

test ("27. Получить ответ в формате json для запроса c заголовком 'Accept': '*/*'  - GET /todos @API", async ({ request }) => {

    let response = await request.get(`${URL}todos`, {
        headers: {
            'x-challenger': token,
            'Accept': '*/*'
        }
    });

    let headers = await response.headers();
    
    //Проверяем статус ответа
    expect(response.status()).toBe(200);
   
    //Проверяем, что заголовок содержит нужный 'content-type'
    expect(headers['content-type']).toBe('application/json');

});

test ("28. Получить ответ в формате xml для запроса с заголовком 'Accept': 'application/xml, application/json'  - GET /todos @API", async ({ request }) => {

    let response = await request.get(`${URL}todos`, {
        headers: {
            'x-challenger': token,
            'Accept': 'application/xml, application/json'
        }
    });

    let headers = await response.headers();
    
    //Проверяем статус ответа
    expect(response.status()).toBe(200);
   
    //Проверяем, что заголовок содержит нужный 'content-type'
    expect(headers['content-type']).toBe('application/xml');

});

test ("29. Получить ответ в формате json для запроса c заголовком 'Accept': ''  - GET /todos @API", async ({ request }) => {

    let response = await request.get(`${URL}todos`, {
        headers: {
            'x-challenger': token,
            'Accept': ''
        }
    });

    let headers = await response.headers();
    
    //Проверяем статус ответа
    expect(response.status()).toBe(200);
   
    //Проверяем, что заголовок содержит нужный 'content-type'
    expect(headers['content-type']).toBe('application/json');

});

test ("30. Получить ошибку 406 при передаче неподдерживаемого формата 'Accept': 'application/gzip'  - GET /todos @API", async ({ request }) => {

    let response = await request.get(`${URL}todos`, {
        headers: {
            'x-challenger': token,
            'Accept': 'application/gzip'
        }
    });

    let headers = await response.headers();
    
    //Проверяем статус ответа
    expect(response.status()).toBe(406);

});

test ("31. Создать todo в формате xml  - POST /todos @API", async ({ request }) => {
    const todo = `
        <title>${faker.string.alpha(5)}</title>
        <description>${faker.string.alpha(10)}</description>
        `; 

    let response = await request.post(`${URL}todos`, {
        headers: {
            'x-challenger': token,
            'Accept': 'application/xml',
            'Content-type': 'application/xml'
        },
        data: todo
    });
    let headers = await response.headers();
    
    //Проверяем статус ответа
    expect(response.status()).toBe(201);

    //Проверяем, что заголовок содержит нужный 'content-type'
    expect(headers['content-type']).toBe('application/xml');
    

});

test ("32. Создать todo в формате json - POST /todos @API", async ({ request }) => {
    const todo = {
            title: faker.string.alpha(5),
            doneStatus: true,
            description: faker.string.alpha(20)
        };

    let response = await request.post(`${URL}todos`, {
            headers: {
                'x-challenger': token,
                'Accept': 'application/json',
                'Content-type': 'application/json'
            },
            data: todo
    });

    let body = await response.json();
    let headers = await response.headers();
    
    //Проверяем статус ответа
    expect(response.status()).toBe(201);

    //Проверяем, что заголовок содержит нужный 'content-type'
    expect(headers['content-type']).toBe('application/json');

    //Проверяем что в ответе содержится передаваемые данные
    expect(body).toEqual (expect.objectContaining(todo));

});

test ("33. Получить ошибку 415 при передаче неподдерживаемого типа content-type - POST /todos @API", async ({ request }) => {
    const todo = {
            title: faker.string.alpha(5),
            doneStatus: true,
            description: faker.string.alpha(20)
        };

    let response = await request.post(`${URL}todos`, {
            headers: {
                'x-challenger': token,
                'Accept': '*/*',
                'Content-type': 'something'
            },
            data: todo
    });

    let body = await response.json();
    
    //Проверяем статус ответа
    expect(response.status()).toBe(415);
    
    //Проверяем текст ошибки
    const errorMessage = 'Unsupported Content Type - something';
    expect(body.errorMessages).toContain(errorMessage);

});

test("34. Получить список заданий со статусом по GUID - GET /challenger @API", async ({ request }) => {
    let response = await request.get(`${URL}challenger/${token}`, {
        headers: {
            'x-challenger': token
        },
    });
    
    let headers = await response.headers();

    payload = await response.json();
    
    //Проверяем статус ответа
    expect (response.status()).toBe(200);
    expect(headers).toEqual (expect.objectContaining({'x-challenger':token}));

});

test ("35. Восстановить прогресс по GUID - PUT /challenger @API", async ({ request }) => {
    let response = await request.put(`${URL}challenger/${token}`, {
        headers: {
            'x-challenger': token
        }, 
        data:payload
    });

    let body = await response.json();
    
    //Проверяем статус ответа
    expect (response.status()).toBe(200);
    //Проверяем что в ответе содержится передаваемые данные
    expect(body).toEqual (expect.objectContaining(payload));
    

});

test ("36. Восстановить прогресс по cтарому GUID - PUT /challenger @API", async ({ request }) => {
    
    //todo посмотреть почему не зеленеет тест

    //Генерируем новый токен
    let newToken =faker.string.uuid();

    let getResponse = await request.get(`${URL}challenger/${token}`, {
        headers: {
            'x-challenger': token
        },
    });

    let newPayload = await getResponse.json(); 

    // Удаляем xAuthToken из новой копии
    delete newPayload.xAuthToken; 

    // Подставляем newToken в newPayload
    newPayload['xChallenger'] = newToken;
    
    let response = await request.put(`${URL}challenger/${newToken}`, {
        headers: {
            'x-challenger': token
        },
        data:newPayload
    });

    //Проверяем статус ответа
    expect (response.status()).toBe(201);

});

test ("37. Получить список заданий со статусом по GUID из БД - GET / challenger/database / guid @API", async ({ request }) => {
    let response = await request.get(`${URL}challenger/database/${token}`, {
        headers: {
            'x-challenger': token
        },
    });
    
    let headers = await response.headers();
    
    //Проверяем статус ответа
    expect (response.status()).toBe(200);
    expect(headers).toEqual (expect.objectContaining({'x-challenger':token}));

});

test ("38. Восстановить прогресс по GUID из БД - PUT /challenger @API", async ({ request }) => {
    let getDataBase = await request.get(`${URL}challenger/database/${token}`, {
        headers: {
            'x-challenger': token
        },
    });
    
    let body = await getDataBase.json();

    let response = await request.put(`${URL}challenger/database/${token}`, {
        headers: {
            'x-challenger': token
        },
        data:body
    });
    
    //Проверяем статус ответа
    expect (response.status()).toBe(204);

});

test ("39. Создать todo в формате xml и получить ответ в формате json  - POST /todos @API", async ({ request }) => {
    const todo = `
        <title>${faker.string.alpha(5)}</title>
        <description>${faker.string.alpha(10)}</description>
        `; 

    let response = await request.post(`${URL}todos`, {
        headers: {
            'x-challenger': token,
            'Accept': 'application/json',
            'Content-type': 'application/xml'
        },
        data: todo
    });
    let headers = await response.headers();
    
    //Проверяем статус ответа
    expect(response.status()).toBe(201);

    //Проверяем, что заголовок содержит нужный 'content-type'
    expect(headers['content-type']).toBe('application/json');
    

});

test ("40. Создать todo в формате json и получить ответ в формате xml  - POST /todos @API", async ({ request }) => {
    const todo = {
        title: faker.string.alpha(5),
        doneStatus: true,
        description: faker.string.alpha(20)
    };

    let response = await request.post(`${URL}todos`, {
        headers: {
            'x-challenger': token,
            'Accept': 'application/xml',
            'Content-type': 'application/json'
        },
        data: todo
    });
    let headers = await response.headers();
    
    //Проверяем статус ответа
    expect(response.status()).toBe(201);

    //Проверяем, что заголовок содержит нужный 'content-type'
    expect(headers['content-type']).toBe('application/xml');
    
});

test ("41. Получить ошибку 405 при попытке удалить heartbeat  - DELETE /heartbeat @API", async ({ request }) => {

    let response = await request.delete(`${URL}heartbeat`, {
        headers: {
            'x-challenger': token
        }
    });
    
    //Проверяем статус ответа
    expect(response.status()).toBe(405);

});

test ("42. Получить ошибку 500 при попытке заменить heartbeat  - PATCH /heartbeat @API", async ({ request }) => {

    let response = await request.patch(`${URL}heartbeat`, {
        headers: {
            'x-challenger': token
        }
    });
    
    //Проверяем статус ответа
    expect(response.status()).toBe(500);

});

test ("43. Получить ошибку 501 при попытке отследить heartbeat  - TRACE /heartbeat @API", async ({ request }) => {

    let response = await request.fetch(`${URL}heartbeat`, {
        method: "TRACE",
        headers: {
            'x-challenger': token
        }
    });
    
    //Проверяем статус ответа
    expect(response.status()).toBe(501);
    
});

test ("44. Получить ответ от сервера heartbeat  - GET /heartbeat @API", async ({ request }) => {
    

    let response = await request.get(`${URL}heartbeat`, {
        headers: {
            'x-challenger': token
        }
    });

    let headers = await response.headers();
    
    //Проверяем статус ответа
    expect(response.status()).toBe(204);
    expect(headers).toEqual (expect.objectContaining({'x-challenger':token}));
    

});

test ("45. Получить ошибку 405 при попытке удаления через метод DELETE heartbeat  - POST /heartbeat @API", async ({ request }) => {

    let response = await request.post(`${URL}heartbeat`, {
        headers: {
            'x-challenger': token,
            'X-HTTP-Method-Override': 'DELETE'
        }
    });
 
    //Проверяем статус ответа
    expect(response.status()).toBe(405);

});

test ("46. Получить ошибку 500 при попытке заменить через метод PATCH heartbeat  - POST /heartbeat @API", async ({ request }) => {

    let response = await request.post(`${URL}heartbeat`, {
        headers: {
            'x-challenger': token,
            'X-HTTP-Method-Override': 'PATCH'
        }
    });

    //Проверяем статус ответа
    expect(response.status()).toBe(500);

});

test ("47. Получить ошибку 501 при попытке отследить через метод TRACE heartbeat  - POST /heartbeat @API", async ({ request }) => {
    
    let response = await request.post(`${URL}heartbeat`, {
        headers: {
            'x-challenger': token,
            'X-HTTP-Method-Override': 'TRACE'
        }
    });

    //Проверяем статус ответа
    expect(response.status()).toBe(501);    

});

test ("48. Получить ошибку 401 при попытке аутентификации с неверным логином и паролем - POST /secret/token @API", async ({ request }) => {
    

    let response = await request.post(`${URL}secret/token`, {
        headers: {
            'x-challenger': token,
            'Authorization': 'Basic YWRtaW46cGFzc3dvcmRk'
        
        }
    });

    //Проверяем статус ответа
    expect(response.status()).toBe(401); 

});

test ("49. Получить токен при аутентификации с верным логином и паролем - POST /secret/token @API", async ({ request }) => {

    let response = await request.post(`${URL}secret/token`, {
        headers: {
            'x-challenger': token,
            'Authorization': 'Basic YWRtaW46cGFzc3dvcmQ='
        
        }
    });

    let headers = await response.headers();

    //Проверяем статус ответа
    expect(response.status()).toBe(201);

    //Проверяем токены в ответе
    expect(headers).toEqual (expect.objectContaining({'x-challenger':token}));
    expect(headers).toHaveProperty('x-auth-token');
    
});

test ("50. Получить ошибку 403 авторизации с неверным x-auth-token - GET /secret/note @API", async ({ request }) => {
    
    let response = await request.get(`${URL}secret/note`, {
        headers: {
            'x-challenger': token,
            'x-auth-token': 'something'
        
        }
    });
 
    //Проверяем статус ответа
    expect(response.status()).toBe(403);

});

test ("51. Получить ошибку 401 авторизации без передачи x-auth-token - GET /secret/note @API", async ({ request }) => {
    
    let response = await request.get(`${URL}secret/note`, {
        headers: {
            'x-challenger': token
        
        }
    });
  
    //Проверяем статус ответа
    expect(response.status()).toBe(401);

});

test ("52. Авторизоваться с верным x-auth-token  - GET /secret/note @API", async ({ request }) => {
    
    let getTokenResponse = await request.post(`${URL}secret/token`, {
        headers: {
            'x-challenger': token,
            'Authorization': 'Basic YWRtaW46cGFzc3dvcmQ='
        
        }
    });

    let tokenHeaders = await getTokenResponse.headers();
    let authToken = tokenHeaders['x-auth-token'];

    let authResponse = await request.get(`${URL}secret/note`, {
        headers: {
            'x-challenger': token,
            'x-auth-token': authToken
        
        }
    });
    
    let headers = await authResponse.headers();

    //Проверяем статус ответа
    expect(authResponse.status()).toBe(200);
    expect(headers).toEqual (expect.objectContaining({'x-challenger':token}));
    
});

test ("53. Опубликовать заметку  - POST /secret/note @API", async ({ request }) => {
    
    let getTokenResponse = await request.post(`${URL}secret/token`, {
        headers: {
            'x-challenger': token,
            'Authorization': 'Basic YWRtaW46cGFzc3dvcmQ='
        
        }
    });

    let tokenHeaders = await getTokenResponse.headers();
    let authToken = tokenHeaders['x-auth-token'];

    const note = {
      "note": faker.string.alpha(30)
   };

    let authResponse = await request.post(`${URL}secret/note`, {
        headers: {
            'Content-Type': 'application/json',
            'x-challenger': token,
            'x-auth-token': authToken
        },
        data: note
    });
    
    let body = await authResponse.json();
    let headers = await authResponse.headers();

    //Проверяем статус ответа
    expect(authResponse.status()).toBe(200);
    expect(headers).toEqual (expect.objectContaining({'x-challenger':token}));

    //Проверяем что в ответе содержится передаваемые данные
   expect(body).toEqual (expect.objectContaining(note));
    
});

test ("54. Получить ошибку 401  при публикации заметки без передачи x-auth-token  - POST /secret/note @API", async ({ request }) => {
    
    const note = {
      "note": faker.string.alpha(30)
   };

    let authResponse = await request.post(`${URL}secret/note`, {
        headers: {
            'Content-Type': 'application/json',
            'x-challenger': token
        },
        data: note
    });
    
    let headers = await authResponse.headers();

    //Проверяем статус ответа
    expect(authResponse.status()).toBe(401);
    expect(headers).toEqual (expect.objectContaining({'x-challenger':token}));
    
});

test ("55. Получить ошибку 403 при публикации заметки с неверным x-auth-token  - POST /secret/note @API", async ({ request }) => {
    
    const note = {
      "note": faker.string.alpha(30)
   };

    let authResponse = await request.post(`${URL}secret/note`, {
        headers: {
            'Content-Type': 'application/json',
            'x-challenger': token,
            'x-auth-token': 'something'
        },
        data: note
    });
    
    let headers = await authResponse.headers();

    //Проверяем статус ответа
    expect(authResponse.status()).toBe(403);
    expect(headers).toEqual (expect.objectContaining({'x-challenger':token}));
    
});

test ("56. Получить заметку по токену  - GET /secret/note @API", async ({ request }) => {
    
    let getTokenResponse = await request.post(`${URL}secret/token`, {
        headers: {
            'x-challenger': token,
            'Authorization': 'Basic YWRtaW46cGFzc3dvcmQ='
        
        }
    });

    let tokenHeaders = await getTokenResponse.headers();
    let authToken = tokenHeaders['x-auth-token'];

    let getNote = await request.get(`${URL}secret/note`, {
        headers: {
            'Content-Type': 'application/json',
            'x-challenger': token,
            'Authorization': `Bearer ${authToken}`
        }
    });
    
    let body = await getNote.json();
    let headers = await getNote.headers();

    //Проверяем статус ответа
    expect(getNote.status()).toBe(200);
    expect(headers).toEqual (expect.objectContaining({'x-challenger':token}));

    //Проверяем, что в теле приходит note
    expect(body).toHaveProperty('note');
    
});

test ("57. Добавить заметку по токену  - POST /secret/note @API", async ({ request }) => {
    
    let getTokenResponse = await request.post(`${URL}secret/token`, {
        headers: {
            'x-challenger': token,
            'Authorization': 'Basic YWRtaW46cGFzc3dvcmQ='
        }
    });

    let tokenHeaders = await getTokenResponse.headers();
    let authToken = tokenHeaders['x-auth-token'];

    const note = {
        "note": faker.string.alpha(30)
     };

    let postNote = await request.post(`${URL}secret/note`, {
        headers: {
            'Content-Type': 'application/json',
            'x-challenger': token,
            'Authorization': `Bearer ${authToken}`
        },
        data: note
    });
    
    let body = await postNote.json();
    let headers = await postNote.headers();

    //Проверяем статус ответа
    expect(postNote.status()).toBe(200);
    expect(headers).toEqual (expect.objectContaining({'x-challenger':token}));

    //Проверяем что в ответе содержится передаваемые данные
    expect(body).toEqual (expect.objectContaining(note));
    
});

test ("58. Удалить все todo  - DELETE /todos / {id} @API", async ({ request }) => {
    
    let getTodo = await request.get(`${URL}todos`, {
        headers: {
            'x-challenger': token
        },
    });
    
    //Получаем id todo
    let body = await getTodo.json();
    const todoId = body.todos.map(todo => todo.id);

    //Цикл в котором отправляется запрос на удаление с id
    for (let id of todoId) {
        let deleteResponse = await request.delete(`${URL}todos/${id}`, {
            headers: {
                'x-challenger': token
            },
        });
        
        //Проверяем статус ответа в каждом запросе
        expect(deleteResponse.status()).toBe(200);
    };

});

test ("59. Создание максимального количества todo  - POST /todos @API", async ({ request }) => {
        let getTodo = await request.get(`${URL}todos`, {
            headers: {
                'x-challenger': token
            },
        });
    
        let body = await getTodo.json();
        let todoCount = body.todos.length;
    
    
    //Цикл в котором отправляется запрос на создание todo
    for (let i = 0; i < 20-todoCount ; i++) {
        let response = await request.post(`${URL}todos`, {
            headers: {
                'x-challenger': token
            },
            data:{
                title: faker.string.alpha(5),
                doneStatus: true,
                description: faker.string.alpha(20)
            }
        });

        let body = await response.json();
        //Проверяем статус ответа в каждом запросе
        expect(response.status()).toBe(201);
        
        //Проверяем, что ответ в каждом запросе содержит id, title, doneStatus, description
        expect(body).toHaveProperty("id");
        expect(body).toHaveProperty("title");
        expect(body).toHaveProperty("doneStatus");
        expect(body).toHaveProperty("description");

    }
    //Проверяем, что больше нельзя создать todo
    let overResponse = await request.post(`${URL}todos`, {
        headers: {
            'x-challenger': token
        },
        data:{
            title: faker.string.alpha(5),
            doneStatus: true,
            description: faker.string.alpha(20)
        }
    });
    //Проверяем статус ответа
    expect(overResponse.status()).toBe(400);
});
});