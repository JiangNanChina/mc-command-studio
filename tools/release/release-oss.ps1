# Compatibility shim: the real implementation is release-oss.mjs (Node, no PowerShell 7 needed).
# Prefer: pnpm release:oss
node "$PSScriptRoot/release-oss.mjs" @args
exit $LASTEXITCODE
