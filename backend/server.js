const express = require('express')
const cors = require('cors')
const ffmpeg = require('fluent-ffmpeg')
let uploads = require('./utils/multer.js')
const fs = require('fs')
const app = express()

app.use(cors())

ffmpeg.setFfmpegPath('./ffmpeg/ffmpeg.exe');
ffmpeg.setFfprobePath('./ffmpeg/ffprobe.exe');

function reformatFiles(files, toFormat, fromFormat, nameDir, callback) {
  let json = {};
  let promises = [];

  for (let index = 0; index < files.length; index++) {
    let nameFile = files[index].originalname.split('.');
    nameFile.length = nameFile.length - 1;
    nameFile = nameFile.join('');

    let promise = new Promise((resolve, reject) => {
      var fmg = ffmpeg(files[index].path);

      if (fromFormat === 'image') {
        fmg.frames(1)
      }

      if (fromFormat === 'video' && toFormat[1] === 'image') {
        fmg.frames(1)
      }

      fmg.save(`./outputs/${nameDir}/${nameFile}.${toFormat[0]}`)
        .on('end', () => {
          fs.readFile(`./outputs/${nameDir}/${nameFile}.${toFormat[0]}`, (err, data) => {
            if (err) {
              console.error(err);
              reject(err);
              return;
            }

            const base64Data = data.toString('base64');

            json[nameFile] = base64Data;
            resolve();
          });
        })
        .on("error", (err) => {
          console.error("Error:", err);
          reject(err);
        })
        .run();
    });

    promises.push(promise);
  }

  Promise.all(promises)
    .then(() => {
      callback(json);
    })
    .then(() => {
      clearFiles([`./uploads/${nameDir}/`, `./outputs/${nameDir}/`])
    })
    .catch((err) => {
      console.error(err);
    });
}

function clearFiles(dir) {
  setTimeout(() => {
    for (let index = 0; index < dir.length; index++) {
      fs.rm(dir[index], { recursive: true }, err => {
        if (err) {
          throw err;
        }
      });
    }
  }, 5000)
}

app.post('/', uploads, function (req, res) {
  const toFormat = req.body.toFormat.toLowerCase().split(',');
  const fromFormat = req.body.fromFormat;
  const nameDir = req.uploadDirectory


  reformatFiles(req.files, toFormat, fromFormat, nameDir, (json) => {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(json))
  });
})

app.listen(3000, () => {
  console.log('Server start');
})