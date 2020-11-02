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

    this.create = async function (obj, listCategories) {
        if (!listCategories) {
            listCategories = []
        }
        if (!Array.isArray(listCategories)) {
            listCategories = [ listCategories ]
        }
        // Write record
        const uuid = await this.generateUID()
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

    this.getFromCategory = async function ( category ) {
        return this.lowReadDirGithub(this.category + category)
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
        const asyncRes = await Promise.all(res.data.map(async (e) => {
            return {path: e.path, type: e.type};
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