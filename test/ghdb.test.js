const Ghdb = require("../src/ghdb");
require('dotenv').config({debug: true});

test("Create object", () => {
    var ghdbObj = new Ghdb( { personalAccessToken: process.env.ACCESSTOKEN, 
                              owner: process.env.USER, 
                              repo: process.env.REPOSITORY, 
                              path: process.env.PATH } )
    expect(ghdbObj.repo).toBe("r");
});