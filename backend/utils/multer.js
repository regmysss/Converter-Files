const multer = require('multer')
const uuid = require('uuid')
const fs = require('fs');

let dirName;

const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        if (!dirName || !fs.existsSync('./uploads/' + dirName)) {
            dirName = uuid.v4();
            fs.mkdirSync('./uploads/' + dirName);
            fs.mkdirSync('./outputs/' + dirName);
        }
        req.uploadDirectory = dirName;
        callback(null, './uploads/' + dirName)
    },
    filename: (req, file, callback) => {
        file.originalname = Buffer.from(file.originalname, 'latin1').toString('utf8')
        callback(null, file.originalname)
    }
})

module.exports = multer({ storage: storage }).array('files')