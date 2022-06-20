const sharp = require("sharp");
const compress_images = require("compress-images");
const fs = require("fs");
const client = require('https');
let initialImageFilePath = 'imagem.png'
let path = process.argv[2];
let width = Number(process.argv[3]);

function isValidurl (string){
    const matchpattern = /^https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/gm;
    return matchpattern.test(string);
}

function downloadImage(url, filepath) {
    return new Promise((resolve, reject) => {
        client.get(url, (res) => {
            if (res.statusCode === 200) {
                res.pipe(fs.createWriteStream(filepath))
                    .on('error', reject)
                    .once('close', () => resolve(filepath));
            } else {
                // Consume response data to free up memory
                res.resume();
                reject(new Error(`Request Failed With a Status Code: ${res.statusCode}`));
            }
        });
    });
}

function resize(inputPath, outputPath, width) {
  sharp(inputPath)
    .resize({ width: width })
    .toFile(outputPath, (err) => {
      if (err) {
        console.log(err);
      } else {
        console.log("Imagem redimensionada");
        compress(outputPath, "./compressed/");
      }
    });
}

function compress(pathInput, outputPath) {
  compress_images(
    pathInput,
    outputPath,
    { compress_force: false, statistic: true, autoupdate: true },
    false,
    { jpg: { engine: "mozjpeg", command: ["-quality", "60"] } },
    { png: { engine: "pngquant", command: ["--quality=20-50", "-o"] } },
    { svg: { engine: "svgo", command: "--multipass" } },
    {
      gif: { engine: "gifsicle", command: ["--colors", "64", "--use-col=web"] },
    },
    function (error, completed, statistic) {
      console.log("-------------");
      console.log(error);
      console.log(completed);
      console.log(statistic);
      console.log("-------------");

      fs.unlink(pathInput, (error)=>{
        if(error){
            console.log(error)
        }else{
            console.log(pathInput, " apagado")
        }
      })
    }
  );
}
async function executeDownloadAndResizeInARow(){
    await downloadImage(path, initialImageFilePath).then(console.log).catch(console.error);
    resize(initialImageFilePath, './temp/output_resized.png', width);
}

if(isValidurl(path) === false){
    resize(path, './temp/output_resized.png', width)
}else{
    executeDownloadAndResizeInARow();
}



