const multer = require('multer')
const uuid = require('uuid')

const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, './uploads/')
    },
    filename: (req, file, callback) => {
        file.originalname = uuid.v4() + '.' + file.originalname.split('.').pop()
        callback(null, file.originalname)

    }
})

module.exports = multer({ storage: storage }).array('files')