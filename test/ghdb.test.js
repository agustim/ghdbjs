const Ghdb = require("../src/ghdb");

test("Create object", () => {
    var ghdbObj = new Ghdb( { personalAccessToken:"pat", owner: "me", repo: "myrepo", path: "path" } )
    expect(ghdbObj.repo).toBe("myrepo");
});