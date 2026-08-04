import multer from 'multer'

//Use memory storage to keep the file in memory and send it derectly to cloudinary
export default {
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 4 * 1024 * 1024, //5mb
    },
    fileFilter: (req, file, cb) => {
        const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png']

        if (allowedMimes.includes(file.mimetype)) {
            cb(null, true)
        } else {
            cb(new Error('Image Format not valid, only allowed JPEG, JPG, PNG'))
        }
    },
}
