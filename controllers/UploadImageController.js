// UploadImageController.js
const { initializeApp } = require("firebase/app");
const {
  getFirestore,
  ref,
  getDownloadURL,
  uploadBytesResumable,
  getStorage,
} = require("firebase/storage");
const config = require("../db/firebase.config.js");

initializeApp(config.firebaseConfig);

const storage = getStorage();

const uploadImage = async (req, res) => {
  try {
    const storageRef = ref(storage, `images/${req.file.originalname}`);
    const metadata = {
      contentType: req.file.mimetype,
    };

    const snapshot = await uploadBytesResumable(
      storageRef,
      req.file.buffer,
      metadata
    );
    const downloadURL = await getDownloadURL(snapshot.ref);

    console.log(downloadURL);

    return res.status(200).json({
      message: "file uploaded",
      name: req.file.originalname,
      type: req.file.mimetype,
      downloadURL: downloadURL,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = { uploadImage };
