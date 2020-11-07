(async () => {
    const Ghdb = require("./src/ghdb");
    require('dotenv').config({debug: true});

    var ghdbObj = new Ghdb( { personalAccessToken: process.env.ACCESSTOKEN, 
        owner: process.env.GH_USER, 
        repo: process.env.GH_REPOSITORY, 
        path: process.env.GH_PATH } )


    try {
        await ghdbObj.create({title: "First post", body:"some text here.", author: "me"}, ['post', 'home'])
        await ghdbObj.create({title: "Second post", body:"some another text.", author: "me"}, ['post'])
        await ghdbObj.create({title: "Third post", body:"some different text.", author: "me"}, ['post'])

        console.log(await ghdbObj.getFromCategoryObjects('post'))
    } catch (e) {
        console.log("Something wrong: " + e)
    }
})();