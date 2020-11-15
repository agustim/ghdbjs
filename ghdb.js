const { Octokit } = require("@octokit/rest");
const crypto = require('crypto');

/* Create element */
function Ghdb ( config ) {
    this.personalAccessToken = config.personalAccessToken;
    this.owner = config.owner
    this.repo = config.repo;
    this.path = config.path;
    this.octokit = null;

    this.storage = "storage/"
    this.category = "category/"
    this.selfCategory = "self/"
    this.toString = function(){
        return JSON.stringify(this)
    }
    this.getOptions = function(filename) {
        return ({
            owner: this.owner,
            repo: this.repo,
            path: this.path + filename
        });
    }
    this.connectOctokit = function() {
        if (!this.octokit) {
            this.octokit = new Octokit({
                auth: "token " + this.personalAccessToken,
            });
        }
    }

    this.generateUID = async function() {
        const epochNow = Math.floor(new Date().getTime()).toString() + crypto.randomBytes(5).toString('hex')
        const uuid = crypto.createHash('sha1').update(epochNow, 'utf8').digest().toString('hex')
        return uuid
    }
    this.automaticFields = async function(o, uuid) {
        const ara = new Date().getTime()
        if (!o.createAt)
            o['createAt'] = ara
        o['updateAt'] = ara
        o['uuid'] = uuid
        return o  
    }

    this.create = async function (obj, listCategories) {
        if (!listCategories) {
            listCategories = []
        }
        if (!Array.isArray(listCategories)) {
            listCategories = [ listCategories ]
        }
        listCategories.sort()
        const uuid = await this.generateUID()
        // Add some fields if not exist.
        obj = await this.automaticFields(obj, uuid)
        // Write record
        await this.lowWriteGithub(this.storage + uuid, obj)
        // Write in selfCategories
        await this.lowWriteGithub(this.selfCategory + uuid, listCategories)
        // Write in categories
        for await (let e of listCategories) {
            await this.lowWriteGithub(this.category + e + "/" + uuid)
        }
        return uuid
    }
    this.read = async function (uuid) {
        return this.lowReadGithub (this.storage + uuid)
    }

    this.remove = async function (uuid) {
        // Get selfCategories
        var listCategories = await this.lowReadGithub(this.selfCategory + uuid)
        // Remove Categories
        for await(let e of listCategories.content) {
            await this.lowDeleteGithub(this.category + e + "/" + uuid)
        }
        // Remove selfCategories
        await this.lowDeleteGithub(this.selfCategory + uuid)
        // Remove element
        await this.lowDeleteGithub(this.storage + uuid)
        return {status: "ok"}
    }

    this.update = async function (uuid, obj){
        obj = await this.automaticFields(obj, uuid)
        // Write record
        await this.lowWriteGithub(this.storage + uuid, obj)
        return obj
    }

    this.addCategoryToUuid = async function (uuid, category){
        var oldCategories = await this.readCategoriesFromUuid(uuid)
        if (oldCategories.indexOf(category) == -1){
            var categories = oldCategories.concat(category).sort()
            await this.lowWriteGithub(this.category + category + "/" + uuid)
            await this.lowWriteGithub(this.selfCategory + uuid, categories)
        }
        return categories
    }

    this.removeCategoryToUuid = async function (uuid, category){
        var oldCategories = await this.readCategoriesFromUuid(uuid)
        const indexDelete = oldCategories.indexOf(category)
        if (indexDelete > -1){
            oldCategories.splice(indexDelete,1)
            await this.lowDeleteGithub(this.category + category + "/" + uuid)
            await this.lowWriteGithub(this.selfCategory + uuid, oldCategories)
        }
        return oldCategories
    }

    this.readCategoriesFromUuid = async function (uuid) {
        var ret = await this.lowReadGithub (this.selfCategory + uuid)
        return ret.content
    }

    this.changeCategoriesFromUuid = async function(uuid, categories) {
        var oldCategories = await this.readCategoriesFromUuid(uuid)
        var sCategories = await this.splitCategories(categories,oldCategories)
        categories.sort()
        // Remove categories
        for await(let e of sCategories.rem) {
            await this.lowDeleteGithub(this.category + e + "/" + uuid)
        }
        // Add categories
        for await(let e of sCategories.add) {
            await this.lowWriteGithub(this.category + e + "/" + uuid)
        }
        // Fixed categori group
        await this.lowWriteGithub(this.selfCategory + uuid, categories)
        return categories
    }

    this.splitCategories = async function(categories, oldCategories) {
        // Sort both arrays.
        categories.sort()
        oldCategories.sort()
        var indCat = 0
        var indOldCat
        var addCat = []
        var remCat = []
        var keepCat = []
        for(indOldCat=0; indOldCat < oldCategories.length; indOldCat++){
            while (categories[indCat] < oldCategories[indOldCat]){
                addCat.push(categories[indCat])
                indCat++
            }
            if (categories[indCat] == oldCategories[indOldCat]){
                keepCat.push(categories[indCat])
                indCat++
            } else {
                remCat.push(oldCategories[indOldCat])
            }
        }
        for(;indCat < categories.length; indCat++) {
            addCat.push(categories[indCat])
        }
        return { add: addCat, rem: remCat, keep: keepCat}
    }

    this.getFromCategoryObjects = async function ( category ) {
        const res = await this.lowReadDirGithub(this.category + category)
        if (!res) return null
        const asyncRes = await Promise.all(res.map(async (e) => {
            return this.lowReadGithub (this.storage + e.path);
        }));
        return asyncRes
    }

    this.sortByField = async function (data, field, direction) {
        data.sort(function(a,b){
            if (!direction || direction === 'ASC'){
                if (a.content[field] < b.content[field]) return -1
                if (a.content[field] > b.content[field]) return 1
                if (a.content[field] == b.content[field]) return 0
            } else {
                if (a.content[field] > b.content[field]) return -1
                if (a.content[field] < b.content[field]) return 1
                if (a.content[field] == b.content[field]) return 0
            }
        })
    }

    this.lowWriteGithub = async function (filename, reg) {
        const options = this.getOptions(filename)
        this.connectOctokit();
        var content = (reg) ? Buffer.from(JSON.stringify(reg)).toString('base64') : "";
        var obj = Object.assign(options,{
            message: `writeObject`,
            content: content,
        })

        var current = await this.lowReadGithub(filename)
        if (current != null) {
            obj.sha = current.sha
        }
        return this.octokit.repos.createOrUpdateFileContents(
            obj
        )
        .then((data) => {
            return data
        }, (error) => {
            console.log("ERROR:" + error)
            return error
        })
    }
    this.lowReadGithubCall = async function (f) {
        const options = this.getOptions(f)
        this.connectOctokit();
        let res = null
        try {
            res = await this.octokit.repos.getContent(options)
        } catch(e) {
            return null     
        }
        return res       
    }
    this.lowReadGithub = async function (filename) {
        var res = await this.lowReadGithubCall(filename)
        if (!res) return null
        var content = Buffer.from(res.data.content, 'base64').toString()
        if (!content) return { sha: res.data.sha }
        try {
            content = JSON.parse(content)
            return { content: content , sha: res.data.sha }            
        } catch (e) {
            return null
        }
    }
    this.lowReadDirGithub = async function (dir) {
        var res = await this.lowReadGithubCall(dir)
        if (!res) return null
        const asyncRes = await Promise.all(res.data.map(async (e) => {
            const newPath = e.path.split('/')
            return {path: newPath[newPath.length - 1], type: e.type};
        }));
        return asyncRes
    }
    this.lowDeleteGithub = async function (filename) {
        const options = this.getOptions(filename)
        this.connectOctokit();
        var obj = Object.assign(options,{
            message: `deleteObject`,
        })

        var current = await this.lowReadGithub(filename)
        if (current != null) {
            obj.sha = current.sha
            return this.octokit.repos.deleteFile(
                obj
            )
            .then((data) => {
                return data
            }, (error) => {
                console.log("ERROR:" + error)
                return error
            })
        }
        return null
    }
}

module.exports = Ghdb;