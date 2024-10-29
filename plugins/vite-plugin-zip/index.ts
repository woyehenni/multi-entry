import type { PluginOption } from 'vite'
import fs from 'fs'
import path from 'path'
import JSZip from 'jszip'
import matchObject from './ModuleFilenameHelpers'

type AnalyzeHtmlFunction = (htmlPath: string) => ReadonlyArray<string | RegExp> | undefined;

export interface Options {
  /**
   * Input Directory
   * @default `dist`
   */
  inDir?: string
  /**
   * Output Directory
   * @default `dist-zip`
   */
  outDir?: string
  /**
   * Zip Archive Name
   * @default `dist.zip`
   */
  outFileName?: string
  /**
   * Include file paths or patterns.
   * Defaults to including all files in the webpack output path.
   */
  include?: string | RegExp | ReadonlyArray<string | RegExp> | undefined
  /**
   * Exclude file paths or patterns. Takes precedence over include. Defaults to no excluding.
   */
  exclude?: string | RegExp | ReadonlyArray<string | RegExp> | undefined

  moduleName: string
  // analyzeHtml?: (htmlPath: string) => ReadonlyArray<string | RegExp> | undefined
  analyzeHtml?: AnalyzeHtmlFunction
}

export default function zipPack(options?: Options): PluginOption {
  const inDir = options?.inDir || 'dist'
  const outDir = options?.outDir || 'dist-zip'
  const outFileName = options?.outFileName || 'dist.zip'
  const include = options?.include || undefined
  const exclude = options?.exclude || undefined

  function addFilesToZipArchive(zip: JSZip | null, inDir: string, parentPath = '') {
    const listOfFiles = fs.readdirSync(inDir)

    listOfFiles.forEach((fileName) => {
      const filePath = path.join(inDir, fileName)
      const file = fs.statSync(filePath)
      const zipFileName = parentPath + fileName

      if (file?.isDirectory()) {
        if (!matchObject({ exclude }, filePath)) return
        // const dir = zip!.folder(fileName)
        addFilesToZipArchive(zip, filePath, zipFileName + '/')
      } else {
        if (!matchObject({ include, exclude }, filePath)) return
        zip!.file(zipFileName, fs.readFileSync(filePath), { createFolders: true })
      }
    })
  }

  function createZipArchive(zip: JSZip) {
    zip
      .generateAsync({
        type: 'nodebuffer',
        compression: 'DEFLATE',
        compressionOptions: {
          level: 9
        }
      })
      .then((file) => {
        const fileName = path.join(outDir, outFileName)

        if (fs.existsSync(fileName)) {
          fs.unlinkSync(fileName)
        }

        fs.writeFileSync(fileName, file)
      })
  }

  return {
    name: 'vite-plugin-zip-pack',
    apply: 'build',
    closeBundle() {
      try {
        console.log('\x1b[36m%s\x1b[0m', `Zip packing - "${inDir}" folder :`)
        if (fs.existsSync(inDir)) {
          if (!fs.existsSync(outDir)) {
            fs.mkdirSync(outDir)
          }
          const zip = new JSZip()

          if (options && options.analyzeHtml) {
            const results = options.analyzeHtml(options.moduleName)
            if (results) {
              (options.include! as (string | RegExp)[]).push(...results)
            }
          }

          console.log('\x1b[32m%s\x1b[0m', '  - Preparing files.')
          addFilesToZipArchive(zip, inDir, '')

          console.log('\x1b[32m%s\x1b[0m', '  - Creating zip archive.')
          createZipArchive(zip)

          console.log('\x1b[32m%s\x1b[0m', '  - Done.')
        } else {
          console.log('\x1b[31m%s\x1b[0m', `  - "${inDir}" folder does not exist!`)
        }
      } catch (error) {
        console.log('\x1b[31m%s\x1b[0m', '  - Something went wrong while building zip file!')
      }
    }
  }
}
