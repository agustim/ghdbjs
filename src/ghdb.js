const { Octokit } = require("@octokit/rest");
const crypto = require('crypto');

/* Create element */
function Ghdb ( config ) {
    this.personalAccessToken = config.personalAccessToken;
    this.owner = config.owner
    this.repo = config.repo;
    this.path = config.path;

    this.storage = "storage/" 
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
    this.generateUID = async function() {
        const epochNow = Math.floor(new Date().getTime()).toString() + crypto.randomBytes(5).toString('hex')
        const uuid = crypto.createHash('sha256').update(epochNow, 'utf8').digest().toString('hex')
        return uuid
    }

    this.create = async function (obj, listCategories) {
        if (!listCategories) {
            listCategories = []
        }
        // Write record
        const uuid = await this.generateUID()
        this.lowWriteGithub(this.storage + uuid, obj)
        // Write in categories

    }

    this.lowWriteGithub = async function (filename, obj) {
        const options = this.getOptions(filename)
        const octokit = new Octokit({
            auth: "token " + this.personalAccessToken,
        });
        var obj = Object.assign(options,{
            message: `writeObject`,
            content: Buffer.from(JSON.stringify(obj)).toString('base64'),
        })

        var current = await this.lowReadGithub(filename)
        if (current != null) {
            obj.sha = current.sha
        }
        return octokit.repos.createOrUpdateFileContents(
            obj
        )
        .then((data) => {
            return data
        }, (error) => {
            console.log("ERROR:" + error)
            return error
        })
    }
    this.lowReadGithub = async function (filename) {
        const options = this.getOptions(filename)
        const octokit = new Octokit({
            auth: "token " + this.personalAccessToken,
        });
        let res = null
        try {
            res = await octokit.repos.getContent(options)
        } catch(e) {
            return null     
        }
        if (!res) {
            return null
        }
    
        var content = Buffer.from(res.data.content, 'base64').toString()
        try {
            content = JSON.parse(content)
            return { content: content , sha: res.data.sha }            
        } catch (e) {
            return null
        }
    }
    this.lowDeleteGithub = async function (filename) {
        const options = this.getOptions(filename)
        const octokit = new Octokit({
            auth: "token " + this.personalAccessToken,
        });
        var obj = Object.assign(options,{
            message: `deleteObject`,
        })

        var current = await this.lowReadGithub(filename)
        if (current != null) {
            obj.sha = current.sha
            return octokit.repos.deleteFile(
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