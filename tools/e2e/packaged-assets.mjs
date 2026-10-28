/** Confirm a packaged app can load every version from its own resources. */
export async function verifyPackagedAssets(application, page) {
  const bundled = await page.evaluate(async () => ({
    info: await window.mcstudio.app.info(),
    packs: await window.mcstudio.packs.list()
  }))
  const expected = await application.evaluate(({ app }) => ({
    packaged: app.isPackaged,
    packs: `${process.resourcesPath}/packs`.replace(/\\/g, '/')
  }))
  if (!expected.packaged || bundled.info.packDir.replace(/\\/g, '/') !== expected.packs) {
    throw new Error(`打包测试必须读取安装包资源：${bundled.info.packDir}`)
  }
  if (bundled.packs.length !== 54) {
    throw new Error(`安装包版本目录应包含54个版本，实际${bundled.packs.length}`)
  }
  for (const pack of bundled.packs) {
    const result = await page.evaluate((id) => window.mcstudio.packs.load(id), pack.id)
    if (!result.ok) throw new Error(`安装包资源${pack.id}加载失败：${result.error}`)
  }
  console.log(`✓ 安装包自带资源校验通过（${bundled.packs.length} 个版本）`)
}
