const multer = require("multer");
const storage = multer.memoryStorage();     // Utilisation de la mémoire tampon pour stocker temporairement le fichier

const sharp = require("sharp");

const upload = multer({ storage: storage });

const compressAndSaveImage = (file) => {
  return sharp(file.buffer)
    .jpeg({ quality: 60 })      // Vous pouvez ajuster la qualité de compression ici (de 0 à 100)
    .toBuffer()
    .then((buffer) => {
      
      const fs = require("fs");
      fs.writeFileSync("uploads/" + file.originalname, buffer);
    });
};

module.exports = { upload, compressAndSaveImage };
