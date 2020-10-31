/* Create element */
function Ghdb ( config ) {
    this.personalAccessToken = config.personalAccessToken;
    this.owner = config.user
    this.repo = config.repo;
    this.path =config.path;
    this.toString = function(){
        return JSON.stringify(this)
    }
}

module.exports = Ghdb;