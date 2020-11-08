const Ghdb = require("../src/ghdb");
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, `../.env.${process.env.NODE_ENV}`) });
var ghdbObj

jest.setTimeout(60000)

beforeAll(()=>{
    ghdbObj = new Ghdb( { personalAccessToken: process.env.ACCESSTOKEN, 
        owner: process.env.GH_USER, 
        repo: process.env.GH_REPOSITORY, 
        path: process.env.GH_PATH } )

})

test("Split Category emptys", () => {
    a = []
    n = []

    return ghdbObj.splitCategories(n,a)
    .then( a => {
        expect(a).toEqual({ add: [], rem: [], keep:[]})
    })
})

test("Split Category test", () => {
    a = ['a','b','d']
    n = ['b','c','d']

    return ghdbObj.splitCategories(n,a)
    .then( a => {
        expect(a).toEqual({ add: ['c'], rem: ['a'], keep:['b','d']})
    })
})

test("Split Category actual empty", () => {
    a = []
    n = ['b','c','d']

    return ghdbObj.splitCategories(n,a)
    .then( a => {
        expect(a).toEqual({ add: ['b','c','d'], rem: [], keep:[]})
    })
})

test("Split Category new empty", () => {
    a = ['a','b']
    n = []

    return ghdbObj.splitCategories(n,a)
    .then( a => {
        expect(a).toEqual({ add: [], rem: ['a','b'], keep:[]})
    })
})

test("Split Category same", () => {
    a = ['a','b']
    n = ['a','b']

    return ghdbObj.splitCategories(n,a)
    .then( a => {
        expect(a).toEqual({ add: [], rem: [], keep:['a','b']})
    })
})

test("Split Category same", () => {
    a = ['b','c','d']
    n = ['a','c','e']

    return ghdbObj.splitCategories(n,a)
    .then( a => {
        expect(a).toEqual({ add: ['a','e'], rem: ['b','d'], keep:['c']})
    })
})




