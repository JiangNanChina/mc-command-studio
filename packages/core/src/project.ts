import { z } from 'zod'

export const PROJECT_SCHEMA_VERSION = 1

export const projectFileSchema = z.object({
  schemaVersion: z.literal(PROJECT_SCHEMA_VERSION),
  name: z.string().min(1).max(120),
  packId: z.string().min(1),
  createdAt: z.string(),
  updatedAt: z.string(),
  data: z.unknown()
})

export type ProjectFile = z.infer<typeof projectFileSchema>

export function createProjectFile(
  name: string,
  packId: string,
  data: unknown
): ProjectFile {
  const now = new Date().toISOString()
  return {
    schemaVersion: PROJECT_SCHEMA_VERSION,
    name: name.trim() || '未命名项目',
    packId,
    createdAt: now,
    updatedAt: now,
    data
  }
}

export interface ParseProjectResult {
  ok: boolean
  project?: ProjectFile
  error?: string
}

export function parseProjectFile(input: unknown): ParseProjectResult {
  const result = projectFileSchema.safeParse(input)
  if (!result.success) {
    return {
      ok: false,
      error: '项目文件格式不正确，可能来自不兼容的版本。'
    }
  }
  return { ok: true, project: result.data }
}
