#! /usr/bin/env node

const fs = require('fs')
const chalk = require('chalk')

const { log } = console
const [, , ...args] = process.argv
const [path] = args

const REACT_LIFECYCLE_METHODS = ['render', 'componentDidMount']

const findAllFiles = (dir, filelist, filter) => {
  var fs = fs || require('fs'),
    files = fs.readdirSync(dir)
  filelist = filelist || []
  files.forEach((file) => {
    if (fs.statSync(`${dir}/${file}`).isDirectory()) {
      filelist = findAllFiles(`${dir}/${file}`, filelist, filter)
    } else {
      if (!filter || filter(file)) {
        filelist.push(`${dir}/${file}`)
      }
    }
  })
  return filelist
}

const jsFilesOnlyFilter = (fileName) => fileName.endsWith('.js') && !fileName.endsWith('.test.js') && !fileName.endsWith('.spec.js')
const scssFilesOnlyFilter = (fileName) => fileName.endsWith('.scss')

const readFile = (path) => fs.readFileSync(path, 'utf8')

const findUnusedConstFunctions = (fileContents) => {
  const definedMethodsRaw = fileContents.match(/^\s*const.*\=\s\(.*\=\>\s/gm)
  if (!definedMethodsRaw) {
    return []
  }
  const definedMethods = definedMethodsRaw.map((methodString) => {
    const [_1, keep] = methodString.split('const')
    const [_2, methodName] = keep.split(' ')
    return methodName
  })

  return definedMethods.reduce((agg, methodName) => {
    const occurances = (fileContents.match(new RegExp(`[^?!A-Za-z0-9]${methodName}[^?!A-Za-z0-9]`, 'g')) || []).length
    if (occurances === 1) {
      return [...agg, methodName]
    }
    return agg
  }, [])
}

const findUnusedReactClassMethods = (fileContents) => {
  const definedMethodsRaw = fileContents.match(/^\s*([A-Za-z0-9])*\s=\s\(.*\s\=\>\s/gm)
  /* eslint-disable */
  if (!definedMethodsRaw || !fileContents.includes("import React from 'react'")) {
    return []
  }
  /* eslint-enable */
  const definedMethods = definedMethodsRaw.map((methodString) => {
    const [splitMethodString] = methodString.split(' = ')
    return splitMethodString.replace(/\W/g, '')
  })
  return definedMethods.reduce((agg, methodName) => {
    const occurances = (fileContents.match(new RegExp(`this.${methodName}[^?!A-Za-z0-9]`, 'g')) || []).length
    if (occurances === 0 && !REACT_LIFECYCLE_METHODS.includes(methodName)) {
      return [...agg, methodName]
    }
    return agg
  }, [])
}

const findScssClassNames = (fileContents) => {
  const classNamesRaw = fileContents.match(/\.[A-z][A-z0-9]*/g)
  const allClassNames = classNamesRaw.reduce((agg, classNameRaw) => {
    const rowClassNames = classNameRaw.match(/\.[A-Za-z0-9]*/gm)
    return [...agg, ...rowClassNames]
  }, [])
  return allClassNames
}

const mainMethod = () => {
  /*
  const jsFileList = findAllFiles(path, [], jsFilesOnlyFilter)
  jsFileList.forEach(async (filePath) => {
    const fileContents = await readFile(filePath)
    const unusedConstFunctions = findUnusedConstFunctions(fileContents)
    const unusedClassMethods = findUnusedReactClassMethods(fileContents)

    if (unusedConstFunctions.length || unusedClassMethods.length) {
      console.log(chalk.grey(`  - ${chalk.red('✖')} ${filePath}`))
    } else {
      // console.log(`  - ${chalk.green('✔')} ${filePath}`)
    }

    if (unusedConstFunctions.length) {
      console.log(`    ${chalk.yellow('  Unused const funcs:')} ${unusedConstFunctions.join(', ')}`)
    }

    if (unusedClassMethods.length) {
      console.log(`    ${chalk.yellow('  Unused react class methods:')} ${unusedClassMethods.join(', ')}`)
    }
  })
  */

  // Find all scss files and class names inside of them
  const scssFilesList = findAllFiles(path, [], scssFilesOnlyFilter)
  const classDict = scssFilesList.reduce((agg, filePath) => {
    const fileContents = readFile(filePath)
    const classNames = findScssClassNames(fileContents)
    const uniqueClassNames = [...new Set(classNames)]
    return {
      ...agg,
      [filePath]: uniqueClassNames.reduce((agg, className) => ({ ...agg, [className]: false }), {}),
    }
  }, {})

  console.log(chalk.yellow('##### JS FILES #####'))
  console.log()
  const jsFileList = findAllFiles(path, [], jsFilesOnlyFilter)
  jsFileList.forEach((filePath) => {
    const fileContents = readFile(filePath)
    const styleImport = fileContents.match(/import\s[A-z0-9]*\sfrom\s\'.\/[A-z0-9]*\.scss\'/g)
    if (styleImport) {
      const fileSplit = styleImport[0].split(' ')
      const scssFilePath = fileSplit[3].replace(/\'/g, '')
      const styleObjectName = fileSplit[1]
      if (!scssFilePath.startsWith('./')) {
        console.error('scss file not relative import')
      }
      const scssFileName = scssFilePath.replace('./', '')
      const filePathSplit = filePath.split('/')
      const directory = filePathSplit.slice(0, filePathSplit.length - 1)
      const scssFileFullPath = directory.join('/') + '/' + scssFileName

      let fileExists = false
      try {
        readFile(scssFileFullPath)
        fileExists = true
      } catch (error) {
        // no such file
      }

      // Find all scss classes in js file and compare to scss file contents
      if (fileExists) {
        const regex = new RegExp(`${styleObjectName}\\.[A-z0-9]*`, 'g')
        const classesUsed = [...new Set(fileContents.match(regex))]
        const jsClasses = classesUsed.map((className) => className.replace(styleObjectName, ''))
        const scssClasses = Object.keys(classDict[scssFileFullPath])

        const classesInJsButNotScss = jsClasses.filter((className) => !scssClasses.includes(className))
        if (classesInJsButNotScss.length > 0) {
          console.log(` ${chalk.red('✖')} ${chalk.white(filePath)}`)
          console.log(`   ${chalk.grey('Following classnames are undefined:')}`)
          classesInJsButNotScss.forEach((className) => console.log(`     ${chalk.red(className)}`))
        } else {
          console.log(` ${chalk.green('✔')} ${filePath}`)
        }

        jsClasses.forEach((className) => {
          if (Object.keys(classDict[scssFileFullPath]).includes(className)) {
            classDict[scssFileFullPath][className] = true
          }
        })
      }
    }
  })

  console.log()
  console.log(chalk.yellow('##### SCSS FILES #####'))
  console.log()

  Object.keys(classDict).forEach((scssFilePath) => {
    const classes = Object.keys(classDict[scssFilePath])
    const unuseedClasses = classes.filter((className) => !classDict[scssFilePath][className])
    if (!unuseedClasses.length) {
      console.log(` ${chalk.green('✔')} ${scssFilePath}`)
    } else {
      console.log(` ${chalk.red('✖')} ${chalk.white(scssFilePath)}`)
      console.log(`   ${chalk.grey('Following classnames are unused:')}`)
      unuseedClasses.forEach((className) => console.log(`     ${chalk.red(className)}`))
    }
  })
}

mainMethod()
