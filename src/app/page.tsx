'use client'

import { useState, useRef } from 'react'
import styles from './page.module.css'

type Priority = 'high' | 'medium' | 'low'
type Category = '仕事' | 'プライベート' | 'その他'

type Todo = {
  id: number
  text: string
  completed: boolean
  category: Category
  priority: Priority
  deadline: string
}

const CATEGORIES: Category[] = ['仕事', 'プライベート', 'その他']

const PRIORITY_CONFIG: Record<Priority, { label: string; color: string; bg: string }> = {
  high:   { label: '高', color: '#c0392b', bg: '#fde8e8' },
  medium: { label: '中', color: '#b8860b', bg: '#fef6d9' },
  low:    { label: '低', color: '#2e7d5a', bg: '#e8f5ef' },
}

const CATEGORY_CONFIG: Record<Category, { color: string; bg: string }> = {
  '仕事':       { color: '#1565c0', bg: '#e3f0ff' },
  'プライベート': { color: '#6a1b9a', bg: '#f3e8ff' },
  'その他':     { color: '#4a5568', bg: '#edf2f7' },
}

const INITIAL_TODOS: Todo[] = [
  { id: 1, text: 'Next.jsを学ぶ',         completed: false, category: '仕事',       priority: 'high',   deadline: '' },
  { id: 2, text: 'TODOアプリを完成させる', completed: true,  category: 'プライベート', priority: 'medium', deadline: '' },
]

export default function Home() {
  const [todos,          setTodos]          = useState<Todo[]>(INITIAL_TODOS)
  const [inputValue,     setInputValue]     = useState('')
  const [category,       setCategory]       = useState<Category>('その他')
  const [priority,       setPriority]       = useState<Priority>('medium')
  const [deadline,       setDeadline]       = useState('')
  const [filterCategory, setFilterCategory] = useState<Category | 'all'>('all')
  const [filterPriority, setFilterPriority] = useState<Priority | 'all'>('all')
  const [removingIds,    setRemovingIds]    = useState<Set<number>>(new Set())
  const [completingIds,  setCompletingIds]  = useState<Set<number>>(new Set())
  const [newIds,         setNewIds]         = useState<Set<number>>(new Set())
  const inputRef = useRef<HTMLInputElement>(null)

  const addTodo = () => {
    const text = inputValue.trim()
    if (!text) return
    const id = Date.now()
    setTodos(prev => [{ id, text, completed: false, category, priority, deadline }, ...prev])
    setNewIds(prev => new Set([...prev, id]))
    setTimeout(() => {
      setNewIds(prev => { const n = new Set(prev); n.delete(id); return n })
    }, 500)
    setInputValue('')
    inputRef.current?.focus()
  }

  const toggleTodo = (id: number) => {
    setCompletingIds(prev => new Set([...prev, id]))
    setTimeout(() => {
      setTodos(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t))
      setCompletingIds(prev => { const n = new Set(prev); n.delete(id); return n })
    }, 250)
  }

  const deleteTodo = (id: number) => {
    setRemovingIds(prev => new Set([...prev, id]))
    setTimeout(() => {
      setTodos(prev => prev.filter(t => t.id !== id))
      setRemovingIds(prev => { const n = new Set(prev); n.delete(id); return n })
    }, 300)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') addTodo()
  }

  const filteredTodos = todos.filter(todo => {
    if (filterCategory !== 'all' && todo.category !== filterCategory) return false
    if (filterPriority !== 'all' && todo.priority !== filterPriority) return false
    return true
  })

  const completedCount = todos.filter(t => t.completed).length
  const total          = todos.length
  const rate           = total > 0 ? Math.round((completedCount / total) * 100) : 0

  const isOverdue = (todo: Todo) =>
    todo.deadline && !todo.completed && new Date(todo.deadline) < new Date(new Date().toDateString())

  return (
    <main className={styles.main}>
      <div className={styles.container}>

        {/* ── ヘッダー ── */}
        <header className={styles.header}>
          <div className={styles.headerTop}>
            <h1 className={styles.title}>タスク管理</h1>
            <span className={styles.badge}>
              {completedCount} / {total}
            </span>
          </div>
          <p className={styles.subtitle}>
            {total === 0
              ? 'タスクを追加してください'
              : rate === 100
              ? '🎉 すべて完了！'
              : `あと ${total - completedCount} 件残っています`}
          </p>
        </header>

        {/* ── 完了率グラフ ── */}
        {total > 0 && (
          <div className={styles.progressCard}>
            <div className={styles.progressHeader}>
              <span className={styles.progressLabel}>完了率</span>
              <span className={styles.progressRate}>{rate}%</span>
            </div>
            <div className={styles.progressTrack}>
              <div
                className={styles.progressFill}
                style={{ width: `${rate}%` }}
                role="progressbar"
                aria-valuenow={rate}
                aria-valuemin={0}
                aria-valuemax={100}
              />
            </div>
            <div className={styles.progressSegments}>
              {Array.from({ length: 10 }).map((_, i) => (
                <div
                  key={i}
                  className={`${styles.progressSegment} ${rate >= (i + 1) * 10 ? styles.progressSegmentFilled : ''}`}
                />
              ))}
            </div>
          </div>
        )}

        {/* ── 入力エリア ── */}
        <div className={styles.inputCard}>
          <div className={styles.inputRow}>
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="新しいタスクを入力..."
              className={styles.input}
              maxLength={100}
            />
            <button
              onClick={addTodo}
              className={styles.addButton}
              disabled={!inputValue.trim()}
              aria-label="タスクを追加"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </button>
          </div>

          <div className={styles.metaRow}>
            {/* カテゴリ */}
            <div className={styles.metaGroup}>
              <span className={styles.metaLabel}>カテゴリ</span>
              <div className={styles.chips}>
                {CATEGORIES.map(c => (
                  <button
                    key={c}
                    onClick={() => setCategory(c)}
                    className={`${styles.chip} ${category === c ? styles.chipActive : ''}`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            {/* 優先度 */}
            <div className={styles.metaGroup}>
              <span className={styles.metaLabel}>優先度</span>
              <div className={styles.chips}>
                {(Object.entries(PRIORITY_CONFIG) as [Priority, typeof PRIORITY_CONFIG[Priority]][]).map(([val, cfg]) => (
                  <button
                    key={val}
                    onClick={() => setPriority(val)}
                    className={`${styles.chip} ${priority === val ? styles.chipActive : ''}`}
                  >
                    {cfg.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 締切日 */}
            <div className={styles.metaGroup}>
              <span className={styles.metaLabel}>締切日</span>
              <input
                type="date"
                value={deadline}
                onChange={e => setDeadline(e.target.value)}
                className={styles.dateInput}
              />
            </div>
          </div>
        </div>

        {/* ── フィルター ── */}
        <div className={styles.filterBar}>
          <div className={styles.filterGroup}>
            <button
              onClick={() => setFilterCategory('all')}
              className={`${styles.filterChip} ${filterCategory === 'all' ? styles.filterChipActive : ''}`}
            >
              すべて
            </button>
            {CATEGORIES.map(c => (
              <button
                key={c}
                onClick={() => setFilterCategory(c)}
                className={`${styles.filterChip} ${filterCategory === c ? styles.filterChipActive : ''}`}
              >
                {c}
              </button>
            ))}
          </div>
          <div className={styles.filterGroup}>
            <button
              onClick={() => setFilterPriority('all')}
              className={`${styles.filterChip} ${filterPriority === 'all' ? styles.filterChipActive : ''}`}
            >
              全優先度
            </button>
            {(Object.entries(PRIORITY_CONFIG) as [Priority, typeof PRIORITY_CONFIG[Priority]][]).map(([val, cfg]) => (
              <button
                key={val}
                onClick={() => setFilterPriority(val)}
                className={`${styles.filterChip} ${filterPriority === val ? styles.filterChipActive : ''}`}
              >
                優先 {cfg.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── タスクリスト ── */}
        <ul className={styles.list}>
          {filteredTodos.length === 0 && (
            <li className={styles.empty}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.3">
                <path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
              </svg>
              <span>タスクがありません</span>
            </li>
          )}
          {filteredTodos.map(todo => {
            const overdue   = isOverdue(todo)
            const catCfg    = CATEGORY_CONFIG[todo.category]
            const priCfg    = PRIORITY_CONFIG[todo.priority]
            const isNew     = newIds.has(todo.id)
            const isRemoving   = removingIds.has(todo.id)
            const isCompleting = completingIds.has(todo.id)

            return (
              <li
                key={todo.id}
                className={[
                  styles.item,
                  todo.completed  ? styles.itemCompleted  : '',
                  isRemoving      ? styles.itemRemoving   : '',
                  isCompleting    ? styles.itemCompleting : '',
                  isNew           ? styles.itemNew        : '',
                ].join(' ')}
              >
                {/* 優先度インジケーター */}
                <div
                  className={styles.priorityBar}
                  style={{ background: priCfg.color }}
                />

                {/* チェックボックス */}
                <button
                  onClick={() => toggleTodo(todo.id)}
                  className={`${styles.checkbox} ${todo.completed ? styles.checkboxChecked : ''}`}
                  aria-label={todo.completed ? '未完了に戻す' : '完了にする'}
                >
                  {todo.completed && (
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </button>

                {/* コンテンツ */}
                <div className={styles.itemContent}>
                  <span className={styles.itemText}>{todo.text}</span>
                  <div className={styles.itemMeta}>
                    <span
                      className={styles.catBadge}
                      style={{ color: catCfg.color, background: catCfg.bg }}
                    >
                      {todo.category}
                    </span>
                    <span
                      className={styles.priBadge}
                      style={{ color: priCfg.color, background: priCfg.bg }}
                    >
                      {priCfg.label}優先
                    </span>
                    {todo.deadline && (
                      <span className={`${styles.deadlineBadge} ${overdue ? styles.deadlineOverdue : ''}`}>
                        {overdue ? '⚠ ' : '📅 '}
                        {new Date(todo.deadline).toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' })}
                      </span>
                    )}
                  </div>
                </div>

                {/* 削除ボタン */}
                <button
                  onClick={() => deleteTodo(todo.id)}
                  className={styles.deleteButton}
                  aria-label="削除"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
                    <path d="M10 11v6M14 11v6" />
                    <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
                  </svg>
                </button>
              </li>
            )
          })}
        </ul>

        {/* ── フッター ── */}
        {todos.some(t => t.completed) && (
          <div className={styles.footer}>
            <button
              onClick={() => setTodos(prev => prev.filter(t => !t.completed))}
              className={styles.clearButton}
            >
              完了済みを一括削除
            </button>
          </div>
        )}

      </div>
    </main>
  )
}
