const Ghdb = require("../src/ghdb");
require('dotenv').config({debug: true});
var ghdbObj

beforeAll(()=>{
    ghdbObj = new Ghdb( { personalAccessToken: process.env.ACCESSTOKEN, 
        owner: process.env.GH_USER, 
        repo: process.env.GH_REPOSITORY, 
        path: process.env.GH_PATH } )
})

test("Create object", () => {
    expect(ghdbObj.repo).toBe(process.env.GH_REPOSITORY);
});

test("Write file", () => {
    return ghdbObj.lowWriteGithub("hola.json", {hello: 'World'})
    .then( data => {
        expect(data.status).toBe(200)
    })
})

test("Read file", () => {
    return ghdbObj.lowReadGithub("hola.json")
    .then( data => {
        expect(data.content.hello).toBe('World')
    })
})
