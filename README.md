# ghdbjs - GitHub DataBase JavaScipt

## About
This is a small database system to storage information in a git from github. This module uses github's API for read/write git repository with database.
Is a non-relational database, that using uid like a filename and JSON for content like a javascript object.
In this approach, we add categories like a relation with object.

## Using

You can see example.js to create registers and read this registers.
```
    const Ghdb = require("ghdbjs");
    require('dotenv').config({debug: true});

    var ghdbObj = new Ghdb( { personalAccessToken: process.env.ACCESSTOKEN, 
        owner: process.env.GH_USER, 
        repo: process.env.GH_REPOSITORY, 
        path: process.env.GH_PATH } )


    try {
       await ghdbObj.create({title: "First post", body:"some text here.", link:"http://first.url", author: "me"}, ['post', 'home'])
       await ghdbObj.create({title: "Second post", body:"some another text.", link:"http://second.url", author: "me"}, ['post'])
       await ghdbObj.create({title: "Third post", body:"some different text.", link:"http://third.url", author: "me"}, ['post'])

        var myList = await ghdbObj.getFromCategoryObjects('post')
        await ghdbObj.sortByField(myList, "updateAt", "ASC")
        console.log(myList)
    } catch (e) {
        console.log("Something wrong: " + e)
    }
```

## Definition

```
ghdbjs.generateUID
ghdbjs.create
ghdbjs.read
ghdbjs.remove
ghdbjs.upload
ghdbjs.addCategoryToUuid
ghdbjs.removeCategoryToUuid
ghdbjs.readCategoriesFromUuid
ghdbjs.changeCategoriesFromUuid
ghdbjs.getFromCategoryObjects
ghdbjs.sortByField
```

