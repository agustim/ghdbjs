const Ghdb = require("../src/ghdb");
require('dotenv').config({debug: true});
var envGlobal = { ObjectReg: {hello: 'World'}, ArrCategories: ['post', 'important'] }
jest.setTimeout(60000)

beforeAll(()=>{
    envGlobal.ghdbObj = new Ghdb( { personalAccessToken: process.env.ACCESSTOKEN, 
        owner: process.env.GH_USER, 
        repo: process.env.GH_REPOSITORY, 
        path: process.env.GH_PATH } )
})

test("Create object", () => {
    expect(envGlobal.ghdbObj.repo).toBe(process.env.GH_REPOSITORY);
});

test("Create register", () => {
    return envGlobal.ghdbObj.create(envGlobal.ObjectReg, envGlobal.ArrCategories)
    .then( data => {
        envGlobal.guuid = data
        expect(data.length).toBe(40);
    })
})

test("Read last register", () =>  {
    return envGlobal.ghdbObj.read(envGlobal.guuid)
    .then ( data => {
        expect(data.content.hello).toBe(envGlobal.ObjectReg.hello)
    })
})

test("Read Categories from last register", () => {
    return envGlobal.ghdbObj.readCategoriesFromUuid(envGlobal.guuid)
    .then ( data => { 
        expect(JSON.stringify(data)).toBe(JSON.stringify(envGlobal.ArrCategories))
    })
})

test("Read all registres from Category", () => {
    return envGlobal.ghdbObj.getFromCategory("post")
    .then( data => {
        var listContent = data.filter( e => {
            var parts = e.path.split("/")
            return (parts[ parts.length - 1 ] === envGlobal.guuid )
        })
        expect(listContent.length).toBe(1)
    })
})

test("Remove register", () => {
    return envGlobal.ghdbObj.remove(envGlobal.guuid)
    .then ( data => (
        expect(data.status).toBe("ok")
    ))
})
