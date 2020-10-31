const Ghdb = require("./src/ghdb");
require('dotenv').config({debug: true});

var ghdbObj = new Ghdb( { personalAccessToken: process.env.ACCESSTOKEN, 
    owner: process.env.GH_USER, 
    repo: process.env.GH_REPOSITORY, 
    path: process.env.GH_PATH } )

//console.log(ghdbObj.toString())
ghdbObj.lowWriteGithub("hola.json", {hello: 'World'})
.then((data) => {
    ghdbObj.lowReadGithub("hola.json")
    .then((data) => {
        console.log(data)
        ghdbObj.lowWriteGithub("hola.json", {hello: 'Universe'})
        .then((data) => {
            ghdbObj.lowReadGithub("hola.json")
            .then((data) => {
                console.log(data)
                ghdbObj.lowDeleteGithub("hola.json")
                .then((data) => {
                    console.log(data)
                })
            })
        })
    })
})

