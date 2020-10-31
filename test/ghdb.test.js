const Ghdb = require("../src/ghdb");
require('dotenv').config({debug: true});

test("Create object", () => {
    var ghdbObj = new Ghdb( { personalAccessToken: process.env.ACCESSTOKEN, 
                              owner: process.env.GH_USER, 
                              repo: process.env.GH_REPOSITORY, 
                              path: process.env.GH_PATH } )
    expect(ghdbObj.repo).toBe(process.env.GH_REPOSITORY);
});

test("Write file", () => {
    var ghdbObj = new Ghdb( { personalAccessToken: process.env.ACCESSTOKEN, 
        owner: process.env.GH_USER, 
        repo: process.env.GH_REPOSITORY, 
        path: process.env.GH_PATH } )
    //ghdbObj.toString()
    ghdbObj.lowWriteGithub("hola.json", {hello: 'World'})
})