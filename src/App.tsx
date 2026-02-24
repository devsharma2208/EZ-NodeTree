
import { useState } from 'react'
import { TreeView } from './components/TreeView/TreeView'
import { KanbanBoard } from './components/KanbanBoard/KanbanBoard'
import './App.css'

function App() {
    const [currentQuestion, setCurrentQuestion] = useState<1 | 2>(1);

    return (
        <div className="app-main">
            <header className="app-header">
                <div className="nav-container">
                    <button
                        className={`nav-btn ${currentQuestion === 1 ? 'active' : 'disactive'}`}
                        onClick={() => setCurrentQuestion(1)}
                    >
                        Question 1: Tree View
                    </button>
                    <button
                        className={`nav-btn ${currentQuestion === 2 ? 'active' : 'disactive'}`}
                        onClick={() => setCurrentQuestion(2)}
                    >
                        Question 2: Kanban Board
                    </button>
                </div>
            </header>

            <main className="content-container">
                {currentQuestion === 1 ? <TreeView /> : <KanbanBoard />}
            </main>
        </div>
    )
}

export default App
