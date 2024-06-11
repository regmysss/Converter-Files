import express from "express";
import multer from "multer";
import cors from "cors";
import ffmpeg from "fluent-ffmpeg";
import mime from "mime";
import fs from "fs";

const app = express();
const upload = multer({ dest: "uploads/" });

app.use(cors());

function reformatFile(file, toFormat) {
	return new Promise((resolve, reject) => {
		const to = toFormat.split(',');
		const from = file.mimetype.split("/")[0];
		let command = ffmpeg(file.path);

		if (
			from === "image" ||
			(from === "video" && to[1] === "image")
		) {
			command.frames(1);
		}

		if (!fs.existsSync("./outputs")) {
			fs.mkdirSync("./outputs");
		}

		const destination = `./outputs/${file.filename}.${to[0]}`;
		command
			.on("end", () => {
				fs.readFile(destination, (err, data) => {
					if (err) return reject(err);
					const base64 = data.toString("base64");
					resolve({ base64, destination });
				});
			})
			.on("error", (err) => {
				reject(err);
			})
			.save(destination);
	});
}

app.post("/", upload.array("files"), (req, res) => {
	const toFormat = req.body.toFormat.toLowerCase();
	const files = req.files;

	const response = {};
	const queue = files.map((file) => {
		return new Promise((resolve, reject) => {
			return reformatFile(file, toFormat)
				.then(({ base64, destination }) => {
					response[file.originalname] = {
						base64,
						mimetype: mime.getType(destination),
					};
					fs.unlinkSync(file.path);
					fs.unlinkSync(destination);
					resolve();
				})
				.catch((err) => {
					reject(err);
				});
		});
	});

	Promise.all(queue)
		.then(() => {
			res.json(response);
		})
		.catch((err) => {
			console.log(err);
			res.status(500).send("Internal Server Error");
		});
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
	console.log(`Server is running on port ${port}`);
});
