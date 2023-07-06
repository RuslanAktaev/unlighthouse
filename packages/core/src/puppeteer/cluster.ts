import { Cluster } from 'puppeteer-cluster'
import type { UnlighthousePuppeteerCluster } from '../types'
import { useUnlighthouse } from '../unlighthouse'

/**
 * Create an instance of puppeteer-cluster
 */
export async function launchPuppeteerCluster(): Promise<UnlighthousePuppeteerCluster> {
  const { hooks } = useUnlighthouse()

  const { resolvedConfig } = useUnlighthouse()

  const cluster = await Cluster.launch({
    puppeteerOptions: resolvedConfig.puppeteerOptions,
    ...resolvedConfig.puppeteerClusterOptions,
    concurrency: Cluster.CONCURRENCY_PAGE,
  })

  await (cluster as unknown as Cluster<any, any>).execute({}, ({ page }) => {
    return hooks.callHook('puppeteer-cluster:launched', page)
  })

  const unlighthouseCluster = cluster as unknown as UnlighthousePuppeteerCluster

  // hacky solution to mock the display which avoids spamming the console while still monitoring system stats
  unlighthouseCluster.display = {
    log() {},
    resetCursor() {},
  }


  return unlighthouseCluster
}
