// import express from 'express'
// import multer from 'multer'
// import path from 'path'
// import fs from 'fs'
// import XLSX from 'xlsx'
// import mime from 'mime-types'
// import QRCode from 'qrcode'
// import EventEmitter from 'events'
// import pkg from 'whatsapp-web.js'

// const { Client, LocalAuth, MessageMedia } = pkg

// const __dirname = path.resolve()
// const app = express()
// const upload = multer({ dest: 'uploads/' }) // Upload destination folder
// const progressEmitter = new EventEmitter()

// // Serve static files
// app.use(express.static(path.join(__dirname)))

// // Helper function to introduce delay
// const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

// // Function to replace placeholders in the message
// const replacePlaceholders = (template = '', contact, dynamicColumnsMap) => {
//   return Object.entries(dynamicColumnsMap).reduce(
//     (message, [placeholder, column]) => {
//       const value = contact[column] || '' // Use empty string if undefined
//       return message.replace(`{${placeholder}}`, value)
//     },
//     template
//   )
// }

// // Function to ensure the file has a proper extension
// const ensureImageExtension = (filePath) => {
//   const newFilePath = `${filePath}.jpg` // Append .jpg extension
//   fs.renameSync(filePath, newFilePath) // Rename the file
//   return newFilePath
// }

// // Endpoint to handle progress updates
// app.get('/progress', (req, res) => {
//   progressEmitter.once('update', (data) => {
//     res.json(data)
//   })
// })

// // Endpoint to handle form submission and file upload
// app.post(
//   '/send-messages',
//   upload.fields([{ name: 'file' }, { name: 'image' }]),
//   async (req, res) => {
//     try {
//       const filePath = req.files?.file?.[0]?.path
//       let imageFile = req.files?.image?.[0]?.path
//       const mobileColumn = req.body.mobile_column
//       const dynamicColumns = req.body.dynamic_columns || ''
//       const messageTemplate = req.body.message || '' // Default to empty string

//       if (!filePath || !mobileColumn) {
//         return res.status(400).json({
//           status: 'error',
//           message: 'File and mobile column are required.',
//         })
//       }

//       // Ensure the image file has a .jpg extension
//       if (imageFile) {
//         imageFile = ensureImageExtension(imageFile)
//       }

//       // Parse dynamic columns input into an object mapping
//       const dynamicColumnsMap = dynamicColumns
//         .split(',')
//         .reduce((map, pair) => {
//           const [placeholder, column] = pair.split(':').map((str) => str.trim())
//           if (placeholder && column) map[placeholder] = column
//           return map
//         }, {})

//       // Read the uploaded Excel or CSV file
//       const workbook = XLSX.readFile(filePath)
//       const sheetName = workbook.SheetNames[0]
//       const sheet = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName])

//       // Initialize WhatsApp client
//       const client = new Client({
//         authStrategy: new LocalAuth(),
//       })

//       // Generate QR code for WhatsApp authentication
//       client.on('qr', async (qr) => {
//         const qrImage = await QRCode.toDataURL(qr) // Convert QR code to base64 image
//         progressEmitter.emit('update', { status: 'qr', qrImage })
//       })

//       // When WhatsApp client is ready
//       client.on('ready', async () => {
//         progressEmitter.emit('update', {
//           status: 'ready',
//           message: 'WhatsApp client is ready!',
//         })

//         // Loop through the contacts and send messages
//         for (const [index, contact] of sheet.entries()) {
//           const phoneNumber = `${(contact[mobileColumn] || '')
//             .toString()
//             .replace(/[^\d]/g, '')}@c.us`

//           if (!phoneNumber.includes('@c.us')) {
//             progressEmitter.emit('update', {
//               status: 'error',
//               message: `Invalid phone number at row ${index + 1}`,
//             })
//             continue
//           }

//           const message = replacePlaceholders(
//             messageTemplate,
//             contact,
//             dynamicColumnsMap
//           )

//           try {
//             if (imageFile) {
//               // Ensure the file is properly encoded as a WhatsApp media object
//               const media = MessageMedia.fromFilePath(imageFile)

//               await client.sendMessage(phoneNumber, media, {
//                 caption: message || undefined, // Add a caption if a message exists
//               })
//             } else if (message) {
//               // Send only text message
//               await client.sendMessage(phoneNumber, message)
//             } else {
//               progressEmitter.emit('update', {
//                 status: 'error',
//                 message: `No message or image provided for row ${
//                   index + 1
//                 }. Skipping...`,
//               })
//               continue
//             }

//             progressEmitter.emit('update', {
//               status: 'progress',
//               message: `Message sent to ${contact[mobileColumn]}`,
//             })
//           } catch (error) {
//             progressEmitter.emit('update', {
//               status: 'error',
//               message: `Failed to send message to ${contact[mobileColumn]}: ${error.message}`,
//             })
//           }

//           // Wait for 8 seconds before sending the next message
//           await delay(8000)
//         }

//         progressEmitter.emit('update', {
//           status: 'success',
//           message: 'All messages sent successfully!',
//         })
//       })

//       client.on('auth_failure', (error) => {
//         progressEmitter.emit('update', {
//           status: 'error',
//           message: 'Authentication failed. Please try again.',
//         })
//       })

//       client.on('disconnected', () => {
//         progressEmitter.emit('update', {
//           status: 'error',
//           message: 'WhatsApp client disconnected. Please reconnect.',
//         })
//       })

//       client.initialize()
//       res.json({
//         status: 'processing',
//         message: 'Processing your request. Please wait...',
//       })
//     } catch (error) {
//       res.status(500).json({
//         status: 'error',
//         message: 'An error occurred while processing your request.',
//       })
//     }
//   }
// )

// // Start the server
// app.listen(3000, '0.0.0.0', () => {
//   console.log('Server running on http://localhost:3000')
// })

// import express from 'express'
// import multer from 'multer'
// import path from 'path'
// import fs from 'fs'
// import XLSX from 'xlsx'
// import QRCode from 'qrcode'
// import EventEmitter from 'events'
// import pkg from 'whatsapp-web.js'

// const { Client, LocalAuth, MessageMedia } = pkg

// const __dirname = path.resolve()
// const app = express()
// const upload = multer({ dest: 'uploads/' })
// const progressEmitter = new EventEmitter()

// // Serve static files
// app.use(express.static(path.join(__dirname)))

// // Helper function to introduce delay
// const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

// // Function to replace placeholders in the message
// const replacePlaceholders = (template = '', contact, dynamicColumnsMap) => {
//   return Object.entries(dynamicColumnsMap).reduce(
//     (message, [placeholder, column]) => {
//       const value = contact[column] || ''
//       return message.replace(`{${placeholder}}`, value)
//     },
//     template
//   )
// }

// // Function to ensure the file has a proper extension
// const ensureImageExtension = (filePath) => {
//   const newFilePath = `${filePath}.jpg`
//   fs.renameSync(filePath, newFilePath)
//   return newFilePath
// }

// // Endpoint to handle progress updates
// app.get('/progress', (req, res) => {
//   progressEmitter.once('update', (data) => {
//     res.json(data)
//   })
// })

// // Function to initialize and process a batch
// const initializeClientAndProcessBatch = async (
//   filePath,
//   imageFile,
//   mobileColumn,
//   dynamicColumnsMap,
//   messageTemplate
// ) => {
//   return new Promise((resolve, reject) => {
//     const client = new Client({
//       authStrategy: new LocalAuth(),
//     })

//     client.on('qr', async (qr) => {
//       const qrImage = await QRCode.toDataURL(qr)
//       progressEmitter.emit('update', { status: 'qr', qrImage })
//     })

//     client.on('ready', async () => {
//       progressEmitter.emit('update', {
//         status: 'ready',
//         message: 'WhatsApp client is ready!',
//       })

//       try {
//         const workbook = XLSX.readFile(filePath)
//         const sheetName = workbook.SheetNames[0]
//         const sheet = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName])

//         for (const [index, contact] of sheet.entries()) {
//           const phoneNumber = `${(contact[mobileColumn] || '')
//             .toString()
//             .replace(/[^\d]/g, '')}@c.us`

//           if (!phoneNumber.includes('@c.us')) {
//             progressEmitter.emit('update', {
//               status: 'error',
//               message: `Invalid phone number at row ${index + 1}`,
//             })
//             continue
//           }

//           const message = replacePlaceholders(
//             messageTemplate,
//             contact,
//             dynamicColumnsMap
//           )

//           try {
//             if (imageFile) {
//               const media = MessageMedia.fromFilePath(imageFile)
//               await client.sendMessage(phoneNumber, media, {
//                 caption: message || undefined,
//               })
//             } else if (message) {
//               await client.sendMessage(phoneNumber, message)
//             }

//             progressEmitter.emit('update', {
//               status: 'progress',
//               message: `Message sent to ${contact[mobileColumn]}`,
//             })
//           } catch (error) {
//             progressEmitter.emit('update', {
//               status: 'error',
//               message: `Failed to send message to ${contact[mobileColumn]}: ${error.message}`,
//             })
//           }

//           await delay(8000)
//         }

//         progressEmitter.emit('update', {
//           status: 'success',
//           message: 'All messages sent successfully!',
//         })
//         resolve()
//       } catch (error) {
//         reject(error)
//       } finally {
//         client.destroy() // Cleanup client resources
//       }
//     })

//     client.on('auth_failure', (error) => {
//       progressEmitter.emit('update', {
//         status: 'error',
//         message: 'Authentication failed. Please try again.',
//       })
//       reject(error)
//     })

//     client.on('disconnected', () => {
//       progressEmitter.emit('update', {
//         status: 'error',
//         message: 'WhatsApp client disconnected.',
//       })
//       reject(new Error('WhatsApp client disconnected.'))
//     })

//     client.initialize()
//   })
// }

// // Endpoint to handle form submission and file upload
// app.post(
//   '/send-messages',
//   upload.fields([{ name: 'file' }, { name: 'image' }]),
//   async (req, res) => {
//     try {
//       const filePath = req.files?.file?.[0]?.path
//       let imageFile = req.files?.image?.[0]?.path
//       const mobileColumn = req.body.mobile_column
//       const dynamicColumns = req.body.dynamic_columns || ''
//       const messageTemplate = req.body.message || ''

//       if (!filePath || !mobileColumn) {
//         return res.status(400).json({
//           status: 'error',
//           message: 'File and mobile column are required.',
//         })
//       }

//       if (imageFile) {
//         imageFile = ensureImageExtension(imageFile)
//       }

//       const dynamicColumnsMap = dynamicColumns
//         .split(',')
//         .reduce((map, pair) => {
//           const [placeholder, column] = pair.split(':').map((str) => str.trim())
//           if (placeholder && column) map[placeholder] = column
//           return map
//         }, {})

//       await initializeClientAndProcessBatch(
//         filePath,
//         imageFile,
//         mobileColumn,
//         dynamicColumnsMap,
//         messageTemplate
//       )

//       res.json({
//         status: 'success',
//         message: 'Batch is being processed!',
//       })
//     } catch (error) {
//       res.status(500).json({
//         status: 'error',
//         message: error.message,
//       })
//     }
//   }
// )

// // Start the server
// app.listen(3000, '0.0.0.0', () => {
//   console.log('Server running on http://localhost:3000')
// })
/*
import express from 'express'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import XLSX from 'xlsx'
import QRCode from 'qrcode'
import EventEmitter from 'events'
import pkg from 'whatsapp-web.js'

const { Client, LocalAuth, MessageMedia } = pkg

const __dirname = path.resolve()
const app = express()
const upload = multer({ dest: 'uploads/' })
const progressEmitter = new EventEmitter()

// Serve static files
app.use(express.static(path.join(__dirname)))

// Helper function to introduce delay
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

// Function to replace placeholders in the message
const replacePlaceholders = (template = '', contact, dynamicColumnsMap) => {
  return Object.entries(dynamicColumnsMap).reduce(
    (message, [placeholder, column]) => {
      const value = contact[column] || ''
      return message.replace(`{${placeholder}}`, value)
    },
    template
  )
}

// Function to ensure the file has a proper extension
const ensureImageExtension = (filePath) => {
  const newFilePath = `${filePath}.jpg`
  fs.renameSync(filePath, newFilePath)
  return newFilePath
}

// Store active connections
const clients = new Set() // Use a Set to ensure no duplicate connections

// Endpoint to handle progress updates
app.get('/progress', (req, res) => {
  console.log('Client connected for progress updates') // Debugging statement
  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')

  // Add the new client to the Set
  clients.add(res)

  // Send an update to this client
  const sendProgressUpdate = (data) => {
    res.write(`data: ${JSON.stringify(data)}\n\n`)
    console.log('Progress update sent to client:', data) // Debugging statement
  }

  // Attach a listener for this client
  progressEmitter.on('update', sendProgressUpdate)

  // Remove client and listener on disconnect
  req.on('close', () => {
    console.log('Client disconnected from progress updates') // Debugging statement
    clients.delete(res) // Remove the client from the Set
    progressEmitter.removeListener('update', sendProgressUpdate)
    res.end()
  })
})

// Function to initialize and process a batch
const initializeClientAndProcessBatch = async (
  filePath,
  imageFile,
  mobileColumn,
  dynamicColumnsMap,
  messageTemplate
) => {
  return new Promise((resolve, reject) => {
    const client = new Client({
      authStrategy: new LocalAuth(),
    })

    client.on('qr', async (qr) => {
      const qrImage = await QRCode.toDataURL(qr)
      progressEmitter.emit('update', { status: 'qr', qrImage })
    })

    client.on('ready', async () => {
      progressEmitter.emit('update', {
        status: 'ready',
        message: 'WhatsApp client is ready!',
      })

      try {
        const workbook = XLSX.readFile(filePath)
        const sheetName = workbook.SheetNames[0]
        const sheet = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName])

        for (const [index, contact] of sheet.entries()) {
          const phoneNumber = `${(contact[mobileColumn] || '')
            .toString()
            .replace(/[^\d]/g, '')}@c.us`

          console.log(
            `Processing row ${index + 1}: Phone Number - ${phoneNumber}`
          ) // Debugging statement

          if (!phoneNumber.includes('@c.us')) {
            progressEmitter.emit('update', {
              status: 'error',
              message: `Invalid phone number at row ${index + 1}`,
            })
            console.error(`Invalid phone number at row ${index + 1}`) // Debugging statement
            continue
          }

          const message = replacePlaceholders(
            messageTemplate,
            contact,
            dynamicColumnsMap
          )

          try {
            if (imageFile) {
              const media = MessageMedia.fromFilePath(imageFile)
              await client.sendMessage(phoneNumber, media, {
                caption: message || undefined,
              })
            } else if (message) {
              await client.sendMessage(phoneNumber, message)
            }

            progressEmitter.emit('update', {
              status: 'progress',
              message: `Message sent to ${contact[mobileColumn]}`,
            })
            console.log(`Message sent to ${contact[mobileColumn]}`) // Debugging statement
          } catch (error) {
            progressEmitter.emit('update', {
              status: 'error',
              message: `Failed to send message to ${contact[mobileColumn]}: ${error.message}`,
            })
            console.error(
              `Failed to send message to ${contact[mobileColumn]}: ${error.message}`
            ) // Debugging statement
          }

          await delay(8000)
        }

        progressEmitter.emit('update', {
          status: 'success',
          message: 'All messages sent successfully!',
        })
        console.log('All messages sent successfully!') // Debugging statement
        resolve()
      } catch (error) {
        progressEmitter.emit('update', {
          status: 'error',
          message: `Batch processing failed: ${error.message}`,
        })
        console.error(`Batch processing failed: ${error.message}`) // Debugging statement
        reject(error)
      } finally {
        client.destroy()
      }
    })

    client.on('auth_failure', (error) => {
      progressEmitter.emit('update', {
        status: 'error',
        message: 'Authentication failed. Please try again.',
      })
      console.error('Authentication failed:', error) // Debugging statement
      reject(error)
    })

    client.on('disconnected', () => {
      progressEmitter.emit('update', {
        status: 'error',
        message: 'WhatsApp client disconnected.',
      })
      console.error('WhatsApp client disconnected') // Debugging statement
      reject(new Error('WhatsApp client disconnected.'))
    })

    client.initialize()
  })
}

// Endpoint to handle form submission and file upload
app.post(
  '/send-messages',
  upload.fields([{ name: 'file' }, { name: 'image' }]),
  async (req, res) => {
    try {
      const filePath = req.files?.file?.[0]?.path
      let imageFile = req.files?.image?.[0]?.path
      const mobileColumn = req.body.mobile_column
      const dynamicColumns = req.body.dynamic_columns || ''
      const messageTemplate = req.body.message || ''

      if (!filePath || !mobileColumn) {
        return res.status(400).json({
          status: 'error',
          message: 'File and mobile column are required.',
        })
      }

      if (imageFile) {
        imageFile = ensureImageExtension(imageFile)
      }

      const dynamicColumnsMap = dynamicColumns
        .split(',')
        .reduce((map, pair) => {
          const [placeholder, column] = pair.split(':').map((str) => str.trim())
          if (placeholder && column) map[placeholder] = column
          return map
        }, {})

      progressEmitter.emit('update', {
        status: 'ready',
        message: `Processing your request. Please wait...`,
      })
      console.log('Starting batch processing...') // Debugging statement

      await initializeClientAndProcessBatch(
        filePath,
        imageFile,
        mobileColumn,
        dynamicColumnsMap,
        messageTemplate
      )

      res.json({
        status: 'success',
        message: 'Batch is being processed!',
      })
    } catch (error) {
      progressEmitter.emit('update', {
        status: 'error',
        message: `An error occurred: ${error.message}`,
      })
      console.error('Error during batch processing:', error) // Debugging statement
      res.status(500).json({
        status: 'error',
        message: error.message,
      })
    }
  }
)

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});
*/
// server.js
/*import express from 'express'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import XLSX from 'xlsx'
import QRCode from 'qrcode'
import EventEmitter from 'events'
import pkg from 'whatsapp-web.js'

const { Client, LocalAuth, MessageMedia } = pkg
const __dirname = path.resolve()
const app = express()
const upload = multer({ dest: 'uploads/' })
const progressEmitter = new EventEmitter()

// Global WhatsApp client and status
let whatsappClient = null
let clientReady = false

// Serve static files
app.use(express.static(path.join(__dirname)))

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const replacePlaceholders = (template = '', contact, dynamicColumnsMap) => {
  return Object.entries(dynamicColumnsMap).reduce((msg, [ph, col]) => {
    const value = contact[col] || ''
    return msg.replace(`{${ph}}`, value)
  }, template)
}

const ensureImageExtension = (filePath) => {
  const newPath = `${filePath}.jpg`
  fs.renameSync(filePath, newPath)
  return newPath
}

// Singleton WhatsApp client
const setupClient = () => {
  if (whatsappClient) return whatsappClient

  whatsappClient = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: { args: ['--no-sandbox', '--disable-setuid-sandbox'] },
  })

  whatsappClient.on('qr', async (qr) => {
    const qrImage = await QRCode.toDataURL(qr)
    progressEmitter.emit('update', { status: 'qr', qrImage })
  })

  whatsappClient.on('ready', () => {
    console.log('✅ WhatsApp client is ready')
    clientReady = true
    progressEmitter.emit('update', {
      status: 'ready',
      message: 'WhatsApp client is ready!',
    })
  })

  whatsappClient.on('auth_failure', (err) => {
    console.error('❌ Auth failed:', err)
    clientReady = false
    whatsappClient = null
    progressEmitter.emit('update', {
      status: 'error',
      message: 'Authentication failed. Please rescan QR.',
    })
  })

  whatsappClient.on('disconnected', () => {
    console.log('🔌 WhatsApp client disconnected')
    clientReady = false
    whatsappClient = null
    progressEmitter.emit('update', {
      status: 'error',
      message: 'WhatsApp client disconnected. Please rescan QR.',
    })
  })

  whatsappClient.initialize()
  return whatsappClient
}

app.get('/progress', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')

  const sendProgress = (data) => {
    res.write(`data: ${JSON.stringify(data)}\n\n`)
  }

  progressEmitter.on('update', sendProgress)
  req.on('close', () => {
    progressEmitter.removeListener('update', sendProgress)
    res.end()
  })
})

app.post('/send-messages', upload.fields([{ name: 'file' }, { name: 'image' }]), async (req, res) => {
  try {
    const filePath = req.files?.file?.[0]?.path
    let imageFile = req.files?.image?.[0]?.path
    const mobileColumn = req.body.mobile_column
    const dynamicColumns = req.body.dynamic_columns || ''
    const messageTemplate = req.body.message || ''

    if (!filePath || !mobileColumn) {
      return res.status(400).json({ status: 'error', message: 'Missing required inputs.' })
    }

    if (imageFile) imageFile = ensureImageExtension(imageFile)

    const dynamicColumnsMap = dynamicColumns.split(',').reduce((map, pair) => {
      const [key, col] = pair.split(':').map((s) => s.trim())
      if (key && col) map[key] = col
      return map
    }, {})

    const client = setupClient()
    if (!clientReady) {
      return res.status(400).json({ status: 'error', message: 'WhatsApp not ready. Please scan QR.' })
    }

    const workbook = XLSX.readFile(filePath)
    const sheet = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]])

    for (const [index, contact] of sheet.entries()) {
      const phone = `${(contact[mobileColumn] || '').toString().replace(/[^\d]/g, '')}@c.us`
      const msg = replacePlaceholders(messageTemplate, contact, dynamicColumnsMap)

      try {
        if (imageFile) {
          const media = MessageMedia.fromFilePath(imageFile)
          await client.sendMessage(phone, media, { caption: msg })
        } else {
          await client.sendMessage(phone, msg)
        }

        progressEmitter.emit('update', {
          status: 'progress',
          message: `Message sent to ${contact[mobileColumn]}`,
        })
      } catch (e) {
        progressEmitter.emit('update', {
          status: 'error',
          message: `Failed to send to ${contact[mobileColumn]}: ${e.message}`,
        })
      }

      await delay(8000)
    }

    progressEmitter.emit('update', {
      status: 'success',
      message: 'All messages sent successfully!'
    })

    res.json({ status: 'success', message: 'Batch processing started.' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ status: 'error', message: 'Internal error' })
  }
})

const PORT = process.env.PORT || 3000
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`)
})
*/
/*

import express from 'express'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import XLSX from 'xlsx'
import mime from 'mime-types'
import QRCode from 'qrcode'
import EventEmitter from 'events'
import pkg from 'whatsapp-web.js';
const { Client, LocalAuth, MessageMedia } = pkg;

const __dirname = path.resolve()
const app = express()
const upload = multer({ dest: 'uploads/' })
const progressEmitter = new EventEmitter()

// Serve static files (index.html, script.js, styles.css)
app.use(express.static(path.join(__dirname)))

// SSE endpoint
app.get('/events', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')

  const sendUpdate = (data) => {
    res.write(`data: ${JSON.stringify(data)}\n\n`)
    if (data.status === 'success' || data.status === 'error') {
      progressEmitter.off('update', sendUpdate)
      res.end()
    }
  }

  progressEmitter.on('update', sendUpdate)

  req.on('close', () => {
    progressEmitter.off('update', sendUpdate)
    res.end()
  })
})

// Helper delay
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

// Helper to replace {placeholders}
const replacePlaceholders = (template = '', contact, dynamicMap) => {
  return Object.entries(dynamicMap).reduce((msg, [placeholder, column]) => {
    const value = contact[column] || ''
    return msg.replace(new RegExp(`{${placeholder}}`, 'g'), value)
  }, template)
}

// Ensure file ends with .jpg
const ensureImageExtension = (filePath) => {
  const newFilePath = `${filePath}.jpg`
  fs.renameSync(filePath, newFilePath)
  return newFilePath
}

// Handle form POST
app.post('/send-messages', upload.fields([{ name: 'file' }, { name: 'image' }]), async (req, res) => {
  try {
    const filePath = req.files?.file?.[0]?.path
    let imageFile = req.files?.image?.[0]?.path
    const mobileColumn = req.body.mobile_column
    const dynamicColumns = req.body.dynamic_columns || ''
    const messageTemplate = req.body.message || ''

    if (!filePath || !mobileColumn) {
      return res.status(400).json({ status: 'error', message: 'File and mobile column are required.' })
    }

    if (imageFile) {
      imageFile = ensureImageExtension(imageFile)
    }

    const dynamicMap = dynamicColumns.split(',').reduce((map, pair) => {
      const [key, val] = pair.split(':').map((s) => s.trim())
      if (key && val) map[key] = val
      return map
    }, {})

    const workbook = XLSX.readFile(filePath)
    const sheetName = workbook.SheetNames[0]
    const sheet = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName])

    const client = new Client({ authStrategy: new LocalAuth() })

    client.on('qr', async (qr) => {
      const qrImage = await QRCode.toDataURL(qr)
      progressEmitter.emit('update', { status: 'qr', qrImage })
    })

    client.on('ready', async () => {
      progressEmitter.emit('update', { status: 'ready', message: 'WhatsApp client is ready!' })

      for (const [index, contact] of sheet.entries()) {
        const raw = contact[mobileColumn] || ''
        const phoneNumber = `${raw.toString().replace(/[^\d]/g, '')}@c.us`

        if (!phoneNumber.includes('@c.us')) {
          progressEmitter.emit('update', {
            status: 'error',
            message: `Invalid phone number at row ${index + 1}`
          })
          continue
        }

        const message = replacePlaceholders(messageTemplate, contact, dynamicMap)

        try {
          if (imageFile) {
            const media = MessageMedia.fromFilePath(imageFile)
            await client.sendMessage(phoneNumber, media, { caption: message || undefined })
          } else if (message) {
            await client.sendMessage(phoneNumber, message)
          } else {
            progressEmitter.emit('update', {
              status: 'error',
              message: `No message or image for row ${index + 1}. Skipping...`
            })
            continue
          }

          progressEmitter.emit('update', {
            status: 'progress',
            message: `Message sent to ${contact[mobileColumn]}`
          })
        } catch (err) {
          progressEmitter.emit('update', {
            status: 'error',
            message: `Failed to send to ${contact[mobileColumn]}: ${err.message}`
          })
        }

        await delay(8000)
      }

      progressEmitter.emit('update', {
        status: 'success',
        message: 'All messages sent successfully!'
      })
    })

    client.on('auth_failure', () => {
      progressEmitter.emit('update', {
        status: 'error',
        message: 'Authentication failed. Please try again.'
      })
    })

    client.on('disconnected', () => {
      progressEmitter.emit('update', {
        status: 'error',
        message: 'WhatsApp client disconnected.'
      })
    })

    client.initialize()
    res.json({ status: 'processing', message: 'Processing your request. Please wait...' })

  } catch (error) {
    console.error('Error:', error)
    res.status(500).json({ status: 'error', message: 'Internal server error.' })
  }
})

// Start the server
const PORT = process.env.PORT || 3000
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running at http://localhost:${PORT}`)
})
*/
// import express from 'express'
// import multer from 'multer'
// import path from 'path'
// import fs from 'fs'
// import XLSX from 'xlsx'
// import mime from 'mime-types'
// import QRCode from 'qrcode'
// import EventEmitter from 'events'
// import pkg from 'whatsapp-web.js'

// const { Client, LocalAuth, MessageMedia } = pkg
// const __dirname = path.resolve()
// const app = express()
// const upload = multer({ dest: 'uploads/' })
// const progressEmitter = new EventEmitter()

// // Serve static files
// app.use(express.static(path.join(__dirname)))

// // Polling endpoint
// app.get('/progress', (req, res) => {
//   let responded = false

//   const timeout = setTimeout(() => {
//     if (!responded) {
//       responded = true
//       res.json({ status: 'waiting', message: 'Still waiting for updates...' })
//     }
//   }, 10000) // 10s fallback

//   progressEmitter.once('update', (data) => {
//     if (!responded) {
//       responded = true
//       clearTimeout(timeout)
//       res.json(data)
//     }
//   })

//   req.on('close', () => {
//     if (!responded) {
//       responded = true
//       clearTimeout(timeout)
//     }
//   })
// })


// // Delay helper
// const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

// // Replace placeholders
// const replacePlaceholders = (template = '', contact, map) => {
//   return Object.entries(map).reduce((msg, [placeholder, col]) => {
//     const value = contact[col] || ''
//     return msg.replace(new RegExp(`{${placeholder}}`, 'g'), value)
//   }, template)
// }

// // Ensure image has .jpg
// const ensureImageExtension = (filePath) => {
//   const newFilePath = `${filePath}.jpg`
//   fs.renameSync(filePath, newFilePath)
//   return newFilePath
// }

// // Main message sending logic
// app.post('/send-messages', upload.fields([{ name: 'file' }, { name: 'image' }]), async (req, res) => {
//   try {
//     const filePath = req.files?.file?.[0]?.path
//     let imageFile = req.files?.image?.[0]?.path
//     const mobileColumn = req.body.mobile_column
//     const dynamicColumns = req.body.dynamic_columns || ''
//     const messageTemplate = req.body.message || ''

//     if (!filePath || !mobileColumn) {
//       return res.status(400).json({ status: 'error', message: 'File and mobile column are required.' })
//     }

//     if (imageFile) {
//       imageFile = ensureImageExtension(imageFile)
//     }

//     const dynamicMap = dynamicColumns.split(',').reduce((map, pair) => {
//       const [key, val] = pair.split(':').map((s) => s.trim())
//       if (key && val) map[key] = val
//       return map
//     }, {})

//     const workbook = XLSX.readFile(filePath)
//     const sheetName = workbook.SheetNames[0]
//     const sheet = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName])

//     const client = new Client({ authStrategy: new LocalAuth() })

//     client.on('qr', async (qr) => {
//       const qrImage = await QRCode.toDataURL(qr)
//       progressEmitter.emit('update', { status: 'qr', qrImage })
//     })

//     client.on('ready', async () => {
//       progressEmitter.emit('update', { status: 'ready', message: 'WhatsApp client is ready!' })

//       for (const [index, contact] of sheet.entries()) {
//         const phoneNumber = `${(contact[mobileColumn] || '').toString().replace(/[^\d]/g, '')}@c.us`

//         if (!phoneNumber.includes('@c.us')) {
//           progressEmitter.emit('update', {
//             status: 'error',
//             message: `Invalid phone number at row ${index + 1}`
//           })
//           continue
//         }

//         const message = replacePlaceholders(messageTemplate, contact, dynamicMap)

//         try {
//           if (imageFile) {
//             const media = MessageMedia.fromFilePath(imageFile)
//             await client.sendMessage(phoneNumber, media, { caption: message || undefined })
//           } else if (message) {
//             await client.sendMessage(phoneNumber, message)
//           } else {
//             progressEmitter.emit('update', {
//               status: 'error',
//               message: `No message or image for row ${index + 1}. Skipping...`
//             })
//             continue
//           }

//           progressEmitter.emit('update', {
//             status: 'progress',
//             message: `Message sent to ${contact[mobileColumn]}`
//           })
//         } catch (err) {
//           progressEmitter.emit('update', {
//             status: 'error',
//             message: `Failed to send to ${contact[mobileColumn]}: ${err.message}`
//           })
//         }

//         await delay(8000)
//       }

//       progressEmitter.emit('update', {
//         status: 'success',
//         message: 'All messages sent successfully!'
//       })
//     })

//     client.on('auth_failure', () => {
//       progressEmitter.emit('update', {
//         status: 'error',
//         message: 'Authentication failed. Please try again.'
//       })
//     })

//     client.on('disconnected', () => {
//       progressEmitter.emit('update', {
//         status: 'error',
//         message: 'WhatsApp client disconnected.'
//       })
//     })

//     client.initialize()
//     res.json({ status: 'processing', message: 'Processing your request. Please wait...' })
//   } catch (err) {
//     console.error('Error:', err)
//     res.status(500).json({ status: 'error', message: 'Internal server error.' })
//   }
// })

// const PORT = process.env.PORT || 3000
// app.listen(PORT, '0.0.0.0', () => {
//   console.log(`Server running at http://localhost:${PORT}`)
// })

import express from 'express';
import multer from 'multer';
import mime from 'mime-types';
import xlsx from 'xlsx';
import QRCode from 'qrcode';
import EventEmitter from 'events';
import path from 'path';
import fs from 'fs';
import pkg from 'whatsapp-web.js';
const { Client, LocalAuth, MessageMedia } = pkg;

const app = express();
const port = process.env.PORT || 3000;
const upload = multer();
const __dirname = path.resolve();
const progressEmitter = new EventEmitter();

let client;

app.use(express.static('public'));
app.use(express.json());

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/progress', (req, res) => {
  let responded = false;

  const timeout = setTimeout(() => {
    if (!responded) {
      responded = true;
      res.json({ status: 'waiting', message: 'Still waiting for update...' });
    }
  }, 10000);

  progressEmitter.once('update', (data) => {
    if (!responded) {
      responded = true;
      clearTimeout(timeout);
      res.json(data);
    }
  });

  req.on('close', () => {
    if (!responded) {
      responded = true;
      clearTimeout(timeout);
    }
  });
});

app.post('/send-messages', upload.single('excel'), async (req, res) => {
  try {
    const fileBuffer = req.file.buffer;

    if (!client) {
      client = new Client({
        authStrategy: new LocalAuth({
          dataPath: './web_auth',
        }),
        puppeteer: {
          headless: true,
          args: ['--no-sandbox'],
        },
      });

      client.on('qr', async (qr) => {
        const qrImage = await QRCode.toDataURL(qr);
        progressEmitter.emit('update', { status: 'qr', qrImage });
      });

      client.on('ready', async () => {
        progressEmitter.emit('update', {
          status: 'ready',
          message: 'WhatsApp client is ready!',
        });

        const workbook = xlsx.read(fileBuffer);
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const data = xlsx.utils.sheet_to_json(sheet);

        for (const entry of data) {
          const number = entry.Number.toString().replace(/\D/g, '') + '@c.us';
          const message = entry.Message;

          await client.sendMessage(number, message);
          progressEmitter.emit('update', {
            status: 'progress',
            message: `✅ Message sent to ${entry.Number}`,
          });
        }

        progressEmitter.emit('update', {
          status: 'success',
          message: '✅ All messages sent!',
        });
      });

      client.on('auth_failure', () => {
        progressEmitter.emit('update', {
          status: 'error',
          message: '❌ Authentication failed!',
        });
      });

      client.initialize();
    } else {
      progressEmitter.emit('update', {
        status: 'ready',
        message: 'WhatsApp already initialized. Sending messages...',
      });

      const workbook = xlsx.read(fileBuffer);
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const data = xlsx.utils.sheet_to_json(sheet);

      for (const entry of data) {
        const number = entry.Number.toString().replace(/\D/g, '') + '@c.us';
        const message = entry.Message;

        await client.sendMessage(number, message);
        progressEmitter.emit('update', {
          status: 'progress',
          message: `✅ Message sent to ${entry.Number}`,
        });
      }

      progressEmitter.emit('update', {
        status: 'success',
        message: '✅ All messages sent!',
      });
    }

    res.status(200).json({ status: 'processing' });
  } catch (error) {
    console.error('Error in /send-messages:', error);
    progressEmitter.emit('update', {
      status: 'error',
      message: '❌ Error: ' + error.message,
    });
    res.status(500).json({ status: 'error', message: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

