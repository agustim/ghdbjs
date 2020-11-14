(async () => {
    const Ghdb = require("./ghdb");
    require('dotenv').config({debug: true});

    var ghdbObj = new Ghdb( { personalAccessToken: process.env.ACCESSTOKEN, 
        owner: process.env.GH_USER, 
        repo: process.env.GH_REPOSITORY, 
        path: process.env.GH_PATH } )


    try {
       await ghdbObj.create({title: "First post", body:"some text here.", link:"http://tv3.cat", author: "me"}, ['post', 'home'])
       await ghdbObj.create({title: "Second post", body:"some another text.", link:"http://nextjs.org", author: "me"}, ['post'])
       await ghdbObj.create({title: "Third post", body:"some different text.", link:"http://github.com", author: "me"}, ['post'])

        var myList = await ghdbObj.getFromCategoryObjects('post')
        await ghdbObj.sortByField(myList, "updateAt", "ASC")
        console.log(myList)
    } catch (e) {
        console.log("Something wrong: " + e)
    }
})();