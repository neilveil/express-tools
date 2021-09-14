const fs = require('fs')

const packageJSON = require('../package.json')

const keys = ['name', 'description', 'author', 'version', 'main', 'dependencies']

const publicPackageJSON = {}

Object.keys(packageJSON).forEach(key => {
  if (keys.includes(key)) publicPackageJSON[key] = packageJSON[key]
})

fs.writeFileSync('package.public.json', JSON.stringify(publicPackageJSON))
