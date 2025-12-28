/* This is a script to create a new post markdown file with front-matter */

import fs from "fs"
import path from "path"

function getDate() {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, "0")
  const day = String(today.getDate()).padStart(2, "0")

  return `${year}-${month}-${day}`
}

const args = process.argv.slice(2)

if (args.length === 0) {
  console.error(`Error: No folder name provided
Usage: pnpm new-post <folder-name>`)
  process.exit(1)
}

const folderName = args[0]
const targetDir = "./src/content/posts/"
const folderPath = path.join(targetDir, folderName)
const fullPath = path.join(folderPath, "index.md")

if (fs.existsSync(folderPath)) {
  console.error(`Error: Folder ${folderPath} already exists`)
  process.exit(1)
}

fs.mkdirSync(folderPath, { recursive: true })

const content = `---
title: ${args[0]}
published: ${getDate()}
description: ''
image: ''
tags: []
category: ''
draft: false 
lang: ''
---
`

fs.writeFileSync(fullPath, content)

console.log(`Post created: ${fullPath}`)
