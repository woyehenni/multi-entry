import type { PluginOption } from 'vite'

type Replace = {
  from: string
  to: string
}

type TransformPluginOptions = {
  replaces: Replace[]
}

const replace = (code: string, replaces: Replace[]): string => {
  replaces.forEach((replace) => {
    const regex = new RegExp(`${replace.from}`, 'g')
    code = code.replace(regex, replace.to)
  })

  return code
}

export default function htmlTransform(options: TransformPluginOptions): PluginOption {
  return {
    name: 'htmlTransform',
    apply: 'build',
    enforce: 'post',
    transformIndexHtml: (html: string) => replace(html, options.replaces)
  }
}
