const Ghdb = require("../src/ghdb");
require('dotenv').config({debug: true});
var ghdbObj

beforeAll(()=>{
    ghdbObj = new Ghdb( { personalAccessToken: process.env.ACCESSTOKEN, 
        owner: process.env.GH_USER, 
        repo: process.env.GH_REPOSITORY, 
        path: process.env.GH_PATH } )
})


test("Generate UID", () => {
    return ghdbObj.generateUID()
    .then( data => {
        expect(data.length).toBe(64);
    })
})
