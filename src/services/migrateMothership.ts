import { MOTHERSHIP_NAME, MOTHERSHIP_SEMVER } from '$constants'
import { PocketbaseService } from '$services'
import { LoggerService } from '$shared'

const migrateMothership = async () => {
  const logger = LoggerService().create(`migrateMothership`)
  const { dbg, error, info, warn } = logger

  const pbService = await PocketbaseService()
  info(`Migrating mothership`)
  await (
    await pbService.spawn({
      command: 'migrate',
      isMothership: true,
      version: MOTHERSHIP_SEMVER,
      name: MOTHERSHIP_NAME,
      slug: MOTHERSHIP_NAME,
    })
  ).exitCode
  info(`Migrating done`)
}
