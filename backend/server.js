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
            rej(err);
            return;
          }

          res(data.toString('base64'))
        });
      })
      .on("error", (err) => {
        console.error("Error:", err);
        rej(err);
      })
      .run();
  })
}

async function waitForFileExists(filePath, currentTime = 0, timeout = 3000) {
  if (fs.existsSync(filePath)) {
    return true;
  }

  if (currentTime === timeout)
    return false;

  await new Promise((res) => setTimeout(() => res(), 1000))

  return waitForFileExists(filePath, currentTime + 1000, timeout);
}

function deleteFile(filePath, currentTime = 0, timeout = 5000) {
  fs.unlink(filePath, async (err) => {
    if (err) {
      if (currentTime == timeout)
        return console.error('Error deleting file:', err)

      if (err.code == 'EBUSY' || err.code == 'ENOENT') {
        await new Promise((res) => setTimeout(() => res(), 1000));

        console.log(currentTime)

        return deleteFile(filePath, currentTime + 1000, timeout);
      }
    }
  })
}

async function clearFiles(files, toFormat) {
  for (let i = 0; i < files.length; i++) {
    let uplfile = `./uploads/${files[i].originalname}`
    let outfile = `./outputs/${files[i].originalname.split('.')[0]}.${toFormat}`

    if (await waitForFileExists(uplfile)) {
      deleteFile(uplfile);
    }

    if (await waitForFileExists(outfile)) {
      deleteFile(outfile);
    }
  }
}

app.post('/', uploads, async function (req, res) {
  const toFormat = req.body.toFormat.toLowerCase().split(',');
  const fromFormat = req.body.fromFormat;
  const files = req.files;

  let json = {};
  let promises = [];

  files.forEach((file) => {
    promises.push(new Promise((res, rej) => {
      reformatFile(file, toFormat, fromFormat).then((base64) => {
        let fileName = file.originalname.split('.')[0];
        json[fileName] = { base64data: base64, mimetype: mime.lookup(`./outputs/${fileName}.${toFormat[0]}`) };
        res();
      }).catch((err) => rej(err));
    }))
  });


  Promise.all(promises)
    .then(() => {
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(json));
    })
    .catch(() => {
      res.status(500).send("Internal Server Error");
    })
    .finally(() => {
      clearFiles(files, toFormat[0]);
    })
});


app.listen(3000, () => {
  console.log('Server start');
})