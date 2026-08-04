import { v4 as uuidv4 } from 'uuid'
// import bcrypt from 'bcrypt'
import { PostgresCreateHistoryRepository } from '../repositories/postgres/create-history.js'
import cloudinary from '../config/cloudinary.js'
import { Readable } from 'node:stream'
import { readFile } from 'node:fs/promises'

export class CreateHistoryUseCase {
    async execute(createHistoryParams) {
        //TODO: verify if inputs are valid - requires get user repository to be ready

        //Generate unique ID
        const id = uuidv4()

        let fileServiceReportUrl = []

        const missingCloudinaryConfig =
            !process.env.CLOUDINARY_CLOUD_NAME ||
            !process.env.CLOUDINARY_API_KEY ||
            !process.env.CLOUDINARY_API_SECRET

        if (missingCloudinaryConfig) {
            throw new Error(
                'Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.',
            )
        }

        try {
            if (createHistoryParams.files) {
                console.log(
                    '=======================Files and Buffer===========================',
                )
                // console.log(createHistoryParams.files)
                // Upload each provided file one by one
                const uploadedUrls = []

                for (const file of createHistoryParams.files) {
                    const uploadResult = await new Promise(
                        (resolve, reject) => {
                            const uploadStream =
                                cloudinary.uploader.upload_stream(
                                    {
                                        folder: 'Service_Reports',
                                        resource_type: 'image',
                                        public_id: `${Date.now()}-${Math.round(Math.random() * 1e9)}-${(file.originalname || 'service-report').split('.')[0]}`,
                                    },
                                    (error, result) => {
                                        if (error) reject(error)
                                        else resolve(result)
                                    },
                                )

                            const bufferStream = Readable.from(file.buffer)
                            bufferStream.pipe(uploadStream)
                        },
                    )

                    uploadedUrls.push({
                        id: uuidv4(),
                        secure_url: uploadResult.secure_url,
                        name: uploadResult.public_id,
                    })
                }

                fileServiceReportUrl = uploadedUrls
            } else if (
                createHistoryParams.imageBase64 ||
                createHistoryParams.image
            ) {
                console.log('====ImageBase64 or Image=====')
                const rawBase64 =
                    createHistoryParams.imageBase64 || createHistoryParams.image
                const base64Payload = rawBase64.includes('base64,')
                    ? rawBase64.split('base64,')[1]
                    : rawBase64
                const imageBuffer = Buffer.from(base64Payload, 'base64')

                const uploadResult = await new Promise((resolve, reject) => {
                    const uploadStream = cloudinary.uploader.upload_stream(
                        {
                            folder: 'Service_Reports',
                            resource_type: 'image',
                            public_id: `${Date.now()}-${Math.round(Math.random() * 1e9)}-mobile-upload`,
                        },
                        (error, result) => {
                            if (error) reject(error)
                            else resolve(result)
                        },
                    )

                    const bufferStream = Readable.from(imageBuffer)
                    bufferStream.pipe(uploadStream)
                })

                fileServiceReportUrl = uploadResult.secure_url
                console.log('=======================', fileServiceReportUrl)
            } else if (
                createHistoryParams.file_service_report &&
                (typeof createHistoryParams.file_service_report === 'object' ||
                    typeof createHistoryParams.file_service_report === 'string')
            ) {
                console.log('=========file_service_report=========')
                const mobileFile =
                    typeof createHistoryParams.file_service_report === 'string'
                        ? { uri: createHistoryParams.file_service_report }
                        : createHistoryParams.file_service_report
                const inputUri = mobileFile.uri
                const fileName = mobileFile.name || 'service-report'

                let imageBuffer

                if (
                    typeof inputUri === 'string' &&
                    inputUri.startsWith('data:')
                ) {
                    const base64Payload = inputUri.split('base64,')[1]
                    imageBuffer = Buffer.from(base64Payload, 'base64')
                } else if (
                    typeof inputUri === 'string' &&
                    inputUri.startsWith('http://')
                ) {
                    const response = await fetch(inputUri)
                    if (!response.ok) {
                        throw new Error('Unable to download image from uri')
                    }
                    imageBuffer = Buffer.from(await response.arrayBuffer())
                } else if (
                    typeof inputUri === 'string' &&
                    inputUri.startsWith('https://')
                ) {
                    const response = await fetch(inputUri)
                    if (!response.ok) {
                        throw new Error('Unable to download image from uri')
                    }
                    imageBuffer = Buffer.from(await response.arrayBuffer())
                } else if (typeof inputUri === 'string') {
                    const trimmedUri = inputUri.trim()
                    const looksLikeBase64 = /^[A-Za-z0-9+/]+=*$/.test(
                        trimmedUri,
                    )

                    if (looksLikeBase64) {
                        imageBuffer = Buffer.from(trimmedUri, 'base64')
                    } else if (trimmedUri.startsWith('file://')) {
                        const filePath = trimmedUri.replace('file://', '')
                        try {
                            imageBuffer = await readFile(filePath)
                        } catch {
                            throw new Error(
                                'The image uri points to a file on the mobile device, which the server cannot access. Please send the image as a base64 data URI or use multipart form-data.',
                            )
                        }
                    } else if (trimmedUri.startsWith('/')) {
                        try {
                            imageBuffer = await readFile(trimmedUri)
                        } catch {
                            throw new Error(
                                'The image uri points to a local file that is not accessible on the server. Please send the image as a base64 data URI or use multipart form-data.',
                            )
                        }
                    } else {
                        throw new Error('Unsupported image uri format')
                    }
                } else {
                    throw new Error('Unsupported image uri format')
                }

                const uploadResult = await new Promise((resolve, reject) => {
                    const uploadStream = cloudinary.uploader.upload_stream(
                        {
                            folder: 'Service_Reports',
                            resource_type: 'image',
                            public_id: `${Date.now()}-${Math.round(Math.random() * 1e9)}-${fileName.split('.')[0]}`,
                        },
                        (error, result) => {
                            if (error) reject(error)
                            else resolve(result)
                        },
                    )

                    const bufferStream = Readable.from(imageBuffer)
                    bufferStream.pipe(uploadStream)
                })

                fileServiceReportUrl = uploadResult.secure_url
                console.log('==========================', fileServiceReportUrl)
            }
        } catch (error) {
            console.log(error)
            throw new Error('Error trying to upload image')
        }

        //store user in database
        const history = {
            ...createHistoryParams,
            ID: id,
            files_service_report: fileServiceReportUrl,

            // password: hashedPassword,
        }

        delete history.files
        delete history.imageBase64
        delete history.image

        // Use repository to create user
        const postgresCreateHistoryRepository =
            new PostgresCreateHistoryRepository()
        const createdHistory =
            await postgresCreateHistoryRepository.execute(history)
        return createdHistory
    }
}
