import { useEffect, useRef, useState } from 'react'
import { Save } from 'lucide-react'
import type { BeforeCloseRequest } from '../../../shared/types'
import { getApi } from '../lib/api'
import { useAppStore } from '../store'
import { Modal } from './Modal'

function messageOf(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
}

export function useCloseGuard() {
  const [request, setRequest] = useState<BeforeCloseRequest | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const api = window.mcstudio
    if (!api) return
    return api.app.onBeforeClose((next) => {
      setError(null)
      if (useAppStore.getState().dirty) {
        setRequest(next)
        return
      }
      setBusy(true)
      void useAppStore.getState().flushPersistence()
        .then(async () => {
          if (!useAppStore.getState().dirty) {
            await api.app.completeClose(next.requestId, true)
            setRequest(null)
          } else setRequest(next)
        })
        .catch((failure) => {
          setRequest(next)
          setError(`保存尚未完成：${messageOf(failure)}`)
        })
        .finally(() => setBusy(false))
    })
  }, [])

  const cancel = async (): Promise<void> => {
    if (!request || busy) return
    await getApi().app.completeClose(request.requestId, false)
    setRequest(null)
    setError(null)
  }

  const finish = async (save: boolean): Promise<void> => {
    if (!request || busy) return
    setBusy(true)
    setError(null)
    try {
      const store = useAppStore.getState()
      if (save) {
        if (!(await store.saveProject())) {
          setError('尚未完成保存。请重试，或取消退出以继续编辑。')
          return
        }
        await store.flushPersistence()
        if (useAppStore.getState().dirty) {
          setError('保存期间项目有新的修改，请再次保存。')
          return
        }
      } else {
        await store.flushPersistence().catch(() => undefined)
        await getApi().project.clearAutosave()
      }
      await getApi().app.completeClose(request.requestId, true)
      setRequest(null)
    } catch (failure) {
      setError(`无法完成保存：${messageOf(failure)}。请重试或取消退出。`)
    } finally {
      setBusy(false)
    }
  }

  return {
    closing: request !== null,
    dialog: request ? (
      <CloseProjectDialog
        request={request}
        busy={busy}
        error={error}
        onSave={() => void finish(true)}
        onDiscard={() => void finish(false)}
        onCancel={() => void cancel().catch((failure) => setError(messageOf(failure)))}
      />
    ) : null
  }
}

interface CloseProjectDialogProps {
  request: BeforeCloseRequest
  busy: boolean
  error: string | null
  onSave: () => void
  onDiscard: () => void
  onCancel: () => void
}

function CloseProjectDialog({ request, busy, error, onSave, onDiscard, onCancel }: CloseProjectDialogProps) {
  const projectName = useAppStore((state) => state.projectName)
  const body = useRef<HTMLDivElement>(null)
  const action = request.reason === 'update' ? '更新' : request.reason === 'relaunch' ? '重启' : '关闭'

  useEffect(() => {
    const modal = body.current?.closest<HTMLElement>('[role="dialog"]')
    if (!modal) return
    const previous = document.activeElement as HTMLElement | null
    modal.querySelector<HTMLButtonElement>('[data-close-cancel]')?.focus()
    const trapFocus = (event: KeyboardEvent): void => {
      if (event.key !== 'Tab') return
      const buttons = [...modal.querySelectorAll<HTMLButtonElement>('button:not(:disabled)')]
      const first = buttons[0]
      const last = buttons.at(-1)
      if (!first || !last) return
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }
    modal.addEventListener('keydown', trapFocus)
    return () => {
      modal.removeEventListener('keydown', trapFocus)
      previous?.focus()
    }
  }, [])

  return (
    <Modal
      title={`保存修改后${action}？`}
      icon={<Save size={17} />}
      narrow
      onClose={busy ? () => undefined : onCancel}
      footer={(
        <>
          <button type="button" className="btn" disabled={busy} onClick={onCancel} data-close-cancel>取消</button>
          <button type="button" className="btn btn-ghost" disabled={busy} onClick={onDiscard}>不保存</button>
          <button type="button" className="btn btn-primary" disabled={busy} onClick={onSave}>
            {busy ? '正在保存…' : `保存并${action}`}
          </button>
        </>
      )}
    >
      <div ref={body} aria-busy={busy}>
        <p style={{ overflowWrap: 'anywhere' }}>“{projectName}”有未保存的修改。</p>
        <p className="hint">选择“不保存”会放弃这些修改；选择“取消”可继续编辑。</p>
        {error ? <p role="alert" className="error-text">{error}</p> : null}
      </div>
    </Modal>
  )
}
