import TodoList from './components/TodoList'

export default function Home() {
  return (
    <main className="min-h-screen bg-[#F9F5F4] flex items-start justify-center gap-8 py-10 px-4">
      <TodoList />
    </main>
  )
}
