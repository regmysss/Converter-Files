const express = require('express');
const cors = require('cors');
const ffmpeg = require('fluent-ffmpeg');
let uploads = require('./utils/multer.js');
const fs = require('fs');
const app = express();
const mime = require('mime-types');


app.use(cors())

ffmpeg.setFfmpegPath('./ffmpeg/ffmpeg.exe');
ffmpeg.setFfprobePath('./ffmpeg/ffprobe.exe');

function reformatFile(file, toFormat, fromFormat) {
  return new Promise((res, rej) => {
    let fmg = ffmpeg(file.path)

    if (fromFormat === 'image') {
      fmg.frames(1)
    }

    if (fromFormat === 'video' && toFormat[1] === 'image') {
      fmg.frames(1)
    }

    fmg.save(`./outputs/${file.originalname.split('.')[0]}.${toFormat[0]}`)
      .on('end', () => {
        fs.readFile(`./outputs/${file.originalname.split('.')[0]}.${toFormat[0]}`, (err, data) => {
          if (err) {
            console.error(err);
            return;
          }

          res(data.toString('base64'))
        });
      })
      .on("error", (err) => {
        console.error("Error:", err);
        rej()
      })
      .run();
  })
}

async function clearFiles(files, toFormat) {
  try {
    await Promise.all(files.map(async (file) => {
      let uplFile = file.originalname;
      let outFile = file.originalname.split('.')[0] + '.' + toFormat;
      await fs.promises.unlink('./uploads/' + uplFile);
      await fs.promises.unlink('./outputs/' + outFile);
    }));
    console.log("All files deleted successfully.");
  } catch (error) {
    console.error("Error deleting files:", error);
  }
}


app.post('/', uploads, function (req, res) {
  const toFormat = req.body.toFormat.toLowerCase().split(',');
  const fromFormat = req.body.fromFormat;
  const files = req.files;

  let json = {};
  let promises = [];

  files.forEach((file) => {
    promises.push(new Promise((res) => {
      reformatFile(file, toFormat, fromFormat).then((base64) => {
        let fileName = file.originalname.split('.')[0];
        json[fileName] = { base64data: base64, mimetype: mime.lookup(`./outputs/${fileName}.${toFormat[0]}`) };
        res();
      })
    }))
  })

  Promise.all(promises)
    .then(() => {
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(json));
    })
    .then(() => {
      clearFiles(files, toFormat[0]);
    })
})

app.listen(3000, () => {
  console.log('Server start');
})