
import { useState } from 'react'
import { TreeView } from './components/TreeView/TreeView'
import { KanbanBoard } from './components/KanbanBoard/KanbanBoard'

function App() {
    const [currentQuestion, setCurrentQuestion] = useState<1 | 2>(1);

    return (
        <div className="min-h-screen flex flex-col bg-slate-100">
            <header className="p-6 flex justify-center sticky top-0 z-50">
                <div className="flex gap-4 bg-slate-200 p-2 rounded-xl">
                    <button
                        className={`px-6 py-3 rounded-lg text-sm font-semibold transition-all ${currentQuestion === 1
                                ? 'bg-white text-blue-600 shadow-sm'
                                : 'bg-[#848485] text-white'
                            }`}
                        onClick={() => setCurrentQuestion(1)}
                    >
                        Question 1: Tree View
                    </button>
                    <button
                        className={`px-6 py-3 rounded-lg text-sm font-semibold transition-all ${currentQuestion === 2
                                ? 'bg-white text-blue-600 shadow-sm'
                                : 'bg-[#848485] text-white'
                            }`}
                        onClick={() => setCurrentQuestion(2)}
                    >
                        Question 2: Kanban Board
                    </button>
                </div>
            </header>

            <main className="flex-grow flex justify-center">
                <div className="w-full max-w-[1440px] px-4">
                    {currentQuestion === 1 ? <TreeView /> : <KanbanBoard />}
                </div>
            </main>
        </div>
    )
}

export default App
