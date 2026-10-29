# Compatibility shim: the real implementation is setup-oss.mjs (Node, no PowerShell 7 needed).
# Prefer: pnpm oss:setup
node "$PSScriptRoot/setup-oss.mjs" @args
exit $LASTEXITCODE
