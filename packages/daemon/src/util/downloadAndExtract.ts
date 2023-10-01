import { Logger, singletonAsyncExecutionGuard } from '@pockethost/common'
import decompress from 'decompress'
import decompressUnzip from 'decompress-unzip'
import { chmodSync, createWriteStream } from 'fs'
import fetch from 'node-fetch'
import { dirname } from 'path'
import { assert } from './assert'

const downloadFile = async (url: string, path: string) => {
  const { body } = await fetch(url)
  assert(body, `Body is null`)
  const fileStream = createWriteStream(path)
  await new Promise<void>((resolve, reject) => {
    body.pipe(fileStream)
    body.on('error', reject)
    fileStream.on('finish', resolve)
  })
}

const _unsafe_downloadAndExtract = async (
  url: string,
  binPath: string,
  logger: Logger,
) => {
  const { info, error } = logger.create('downloadAndExtract')

  info(`Fetching ${url}`)
  const res = await fetch(url)
  const { body } = res
  if (!body) {
    throw new Error(`Body expected for ${url}`)
  }
  const versionPath = dirname(binPath)
  const zipPath = `${versionPath}.zip`
  info(`Downloading ${url} to ${zipPath}`)
  await downloadFile(url, zipPath)
  // const tmpPath = tmpNameSync({ dir: TMP_DIR })
  info(`Extracting ${zipPath} to ${versionPath}`)
  await decompress(zipPath, versionPath, { plugins: [decompressUnzip()] })
  // renameSync(tmpPath, versionPath)
  chmodSync(binPath, 0o775)
}

export const downloadAndExtract = singletonAsyncExecutionGuard(
  _unsafe_downloadAndExtract,
  (url) => url,
)
