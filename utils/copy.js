var fs = require('fs');
var path = require('path');

function copyRecursiveSync (src, dest) {
    var exists = fs.existsSync(src);
    var stats = exists && fs.statSync(src);
    var isDirectory = exists && stats.isDirectory();
    if (exists && isDirectory) {
        fs.mkdirSync(dest);
        fs.readdirSync(src).forEach(function (childItemName) {
            copyRecursiveSync(
                path.join(src, childItemName),
                path.join(dest, childItemName));
        });
    } else {
        fs.linkSync(src, dest);
    }
}

var dirPathFrom = path.resolve(path.resolve(path.dirname(fs.realpathSync(__filename)), '..'), process.argv[2]);
var dirPathTo = path.resolve(path.resolve(path.dirname(fs.realpathSync(__filename)), '..'), process.argv[3]);
copyRecursiveSync(dirPathFrom, dirPathTo);
