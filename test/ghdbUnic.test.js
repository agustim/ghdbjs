// Unic test file
const Ghdb = require("../src/ghdb");
const path = require('path')
require('dotenv').config({ path: path.resolve(__dirname, `../.env.${process.env.NODE_ENV}`) });
var ghdbObj
var filename
var envGlobal = { ObjectReg: {hello: 'World'}, ArrCategories: ['post', 'important'] }
jest.setTimeout(60000)

beforeAll(()=>{
    console.log(process.env)
    ghdbObj = new Ghdb( { personalAccessToken: process.env.ACCESSTOKEN, 
        owner: process.env.GH_USER, 
        repo: process.env.GH_REPOSITORY, 
        path: process.env.GH_PATH } )
    ghdbObj.generateUID()
    .then(d => {
        filename = d + ".data"
    })
})


test("Generate UID", () => {
    return ghdbObj.generateUID()
    .then( data => {
        expect(data.length).toBe(40);
    })
})

test("Write file", () => {
    return ghdbObj.lowWriteGithub(filename, {hello: 'World'})
    .then( data => {
        expect(data.status.toString().substring(0,2)).toBe("20")
    })
})

test("Read file", () => {
    return ghdbObj.lowReadGithub(filename)
    .then( data => {
        expect(data.content.hello).toBe('World')
    })
})

test("Delete existent file", () => {
    return ghdbObj.lowDeleteGithub(filename)
    .then( data => {
        expect(data.status).toBe(200)
    })
})

test("Delete does not file", () => {
    return ghdbObj.lowDeleteGithub(filename)
    .then( data => {
        expect(data).toBe(null)
    })
})


test("Create register", () => {
    return ghdbObj.create(envGlobal.ObjectReg, envGlobal.ArrCategories)
    .then( data => {
        envGlobal.guuid = data
        expect(data.length).toBe(40);
    })
})

test("Read last register", () =>  {
    return ghdbObj.read(envGlobal.guuid)
    .then ( data => {
        expect(data.content.hello).toBe(envGlobal.ObjectReg.hello)
    })
})

test("Read Categories from last register", () => {
    return ghdbObj.readCategoriesFromUuid(envGlobal.guuid)
    .then ( data => { 
        expect(JSON.stringify(data)).toBe(JSON.stringify(envGlobal.ArrCategories))
    })
})

test("Read all registres from Category", () => {
    return ghdbObj.getFromCategoryObjects("post")
    .then( data => {
        var listContent = data.filter( e => {
            return (e.content.uuid === envGlobal.guuid )
        })
        expect(listContent.length).toBe(1)
    })
})

test("Remove register", () => {
    return ghdbObj.remove(envGlobal.guuid)
    .then ( data => (
        expect(data.status).toBe("ok")
    ))
})


