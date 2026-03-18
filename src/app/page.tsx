'use client'

import { useState, useRef } from 'react'
import styles from './page.module.css'

type Todo = {
  id: number
  text: string
  completed: boolean
}

export default function Home() {
  const [todos, setTodos] = useState<Todo[]>([
    { id: 1, text: 'Next.jsを学ぶ', completed: false },
    { id: 2, text: 'TODOアプリを完成させる', completed: true },
  ])
  const [inputValue, setInputValue] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const addTodo = () => {
    const text = inputValue.trim()
    if (!text) return
    setTodos(prev => [
      ...prev,
      { id: Date.now(), text, completed: false },
    ])
    setInputValue('')
    inputRef.current?.focus()
  }

  const toggleTodo = (id: number) => {
    setTodos(prev =>
      prev.map(todo =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    )
  }

  const deleteTodo = (id: number) => {
    setTodos(prev => prev.filter(todo => todo.id !== id))
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') addTodo()
  }

  const remaining = todos.filter(t => !t.completed).length
  const total = todos.length

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <header className={styles.header}>
          <h1 className={styles.title}>タスク管理</h1>
          {total > 0 && (
            <p className={styles.count}>
              {remaining > 0
                ? `残り ${remaining} / ${total} 件`
                : `全 ${total} 件完了 🎉`}
            </p>
          )}
        </header>

        {/* 入力エリア */}
        <div className={styles.inputArea}>
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

        {/* タスクリスト */}
        <ul className={styles.list}>
          {todos.length === 0 && (
            <li className={styles.empty}>
              <span className={styles.emptyIcon}>✓</span>
              <span>タスクがありません</span>
            </li>
          )}
          {todos.map(todo => (
            <li key={todo.id} className={`${styles.item} ${todo.completed ? styles.itemCompleted : ''}`}>
              <button
                onClick={() => toggleTodo(todo.id)}
                className={`${styles.checkbox} ${todo.completed ? styles.checkboxChecked : ''}`}
                aria-label={todo.completed ? '未完了に戻す' : '完了にする'}
              >
                {todo.completed && (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </button>
              <span className={styles.itemText}>{todo.text}</span>
              <button
                onClick={() => deleteTodo(todo.id)}
                className={styles.deleteButton}
                aria-label="削除"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
                  <path d="M10 11v6M14 11v6" />
                  <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
                </svg>
              </button>
            </li>
          ))}
        </ul>

        {/* 完了済みをまとめて削除 */}
        {todos.some(t => t.completed) && (
          <div className={styles.footer}>
            <button
              onClick={() => setTodos(prev => prev.filter(t => !t.completed))}
              className={styles.clearButton}
            >
              完了済みを削除
            </button>
          </div>
        )}
      </div>
    </main>
  )
}
