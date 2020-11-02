const Ghdb = require("../src/ghdb");
require('dotenv').config({debug: true});
var ghdbObj
var guuid

jest.setTimeout(60000)

beforeAll(()=>{
    ghdbObj = new Ghdb( { personalAccessToken: process.env.ACCESSTOKEN, 
        owner: process.env.GH_USER, 
        repo: process.env.GH_REPOSITORY, 
        path: process.env.GH_PATH } )
})

test("Create object", () => {
    expect(ghdbObj.repo).toBe(process.env.GH_REPOSITORY);
});

test("Create register", () => {
    return ghdbObj.create({hello: 'World'}, ['post', 'important'])
    .then( data => {
        guuid = data
        expect(data.length).toBe(40);
    })
})

test("Read last register", () =>  {
    return ghdbObj.read(guuid)
    .then ( data => {
        expect(data.content.hello).toBe('World')
    })
})

test("Remove register", () => {
    return ghdbObj.remove(guuid)
    .then ( data => (
        expect(data.status).toBe("ok")
    ))
})
