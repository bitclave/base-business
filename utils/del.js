var fs = require('fs');
var path = require('path');

var deleteFolderRecursive = function (fsPath) {
    if (fs.existsSync(fsPath)) {
        fs.readdirSync(fsPath).forEach(function (file, index) {
            var curPath = fsPath + '/' + file;
            if (fs.lstatSync(curPath).isDirectory()) { // recurse
                deleteFolderRecursive(curPath);
            } else { // delete file
                fs.unlinkSync(curPath);
            }
        });
        fs.rmdirSync(fsPath);
        return true;
    }
    return false;
};

var i = 2;
while (i < process.argv.length && process.argv[i].length > 0) {
    var dirPath = path.resolve(path.resolve(path.dirname(fs.realpathSync(__filename)), '..'), process.argv[i]);
    if (deleteFolderRecursive(dirPath)) {
        console.log('Removed ' + dirPath);
    }
    i++;
}
