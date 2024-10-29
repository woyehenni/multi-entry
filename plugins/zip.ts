import fs from 'fs'
import zipPack from './vite-plugin-zip'

function analyzeHtml(htmlFilePath: string) {
  const data = fs.readFileSync(htmlFilePath, 'utf8');

  // Find script tags matching the pattern
  const linkRegexp =/<link\s+(?:[^>]+\s+)?href="([./js/common/|./assets/][^"]+)">/g
  // const entryRegexp =/<script\s+(?:[^>]+\s+)?src="(./js/[^"]+)">/g
  // const files = [...data.matchAll(regexp), ...data.matchAll(entryRegexp)]
  const files = [...data.matchAll(linkRegexp)]
  const results = files.map(item => {
    return new RegExp(`${item[1]}`.replace('/.', ''))
  })
  return results
}

export default function zip(pages: Record<string, object>) {
  return Object.keys(pages).map((module) => {
    return zipPack({
      moduleName: `dist/${module}.html`,
      outDir: 'build-zip',
      outFileName: `${module}.zip`,
      include: [
        `dist/${module}.html`,
        new RegExp(`js/${module}.js`, 'i'),
        new RegExp(`imgs/${module}/.*`, 'i'),
        new RegExp(`json/.*`, 'i'),
        new RegExp(`lottie/.*`, 'i')
      ],
      exclude: [
        // new RegExp(`dist/json/`, 'i'),
        // new RegExp(`js/(?!${module}|common/).*/`, 'i'),
        // new RegExp(`assets/img/(?!${module}/).*/`, 'i')
      ],
      analyzeHtml
    })
  })
}
