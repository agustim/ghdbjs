const Ghdb = require("../src/ghdb");
require('dotenv').config({debug: true});
var ghdbObjhCategori
jest.setTimeout(60000)

beforeAll(()=>{
    ghdbObjhCategori = new Ghdb( { personalAccessToken: process.env.ACCESSTOKEN, 
        owner: process.env.GH_USER, 
        repo: process.env.GH_REPOSITORY, 
        path: process.env.GH_PATH } )
})


test("Generate UID", () => {
    return ghdbObjhCategori.generateUID()
    .then( data => {
        expect(data.length).toBe(40);
    })
})
