'use strict'
const gracefulFs = require('graceful-fs')

module.exports = (existingPath, newPath, customFs) => {
  const fs = customFs || gracefulFs
  return new Promise((resolve, reject) => {
    fs.link(existingPath, newPath, err => {
      if (!err) {
        fs.unlink(newPath, () => {})
        resolve(true)
        return
      }
      if (err.code === 'EXDEV' || err.code === 'EACCES' || err.code === 'EPERM') {
        resolve(false)
        return
      }
      reject(err)
    })
  })
}

module.exports.sync = (existingPath, newPath, customFs) => {
  const fs = customFs || gracefulFs
  try {
    fs.linkSync(existingPath, newPath)
    fs.unlinkSync(newPath)
    return true
  } catch (err) {
    if (err.code === 'EXDEV' || err.code === 'EACCES' || err.code === 'EPERM') {
      return false
    }
    throw err
  }
}
