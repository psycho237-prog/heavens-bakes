import { useState } from 'react'
import { useStore } from '../store/useStore'
import { IconAlert, IconX } from './Icons'
import './Toast.css'

export default function Toast() {
    const { lowStockProducts, error, dismissError } = useStore()
    const [dismissedStock, setDismissedStock] = useState([])

    // 1. High Priority: App Error (Modal Style)
    if (error) {
        return (
            <div className="toast-overlay">
                <div className="toast-modal">
                    <div className="toast-icon-circle error">
                        <IconAlert size={32} color="currentColor" />
                    </div>
                    <p className="toast-message">{error}</p>
                    <button className="toast-close-btn" onClick={dismissError}>
                        Compris
                    </button>
                </div>
            </div>
        )
    }

    // 2. Medium Priority: Stock Alerts (Modal Style)
    const visibleStock = lowStockProducts.filter(p => !dismissedStock.includes(p.id))
    if (visibleStock.length > 0) {
        const first = visibleStock[0]
        return (
            <div className="toast-overlay">
                <div className="toast-modal">
                    <div className="toast-icon-circle warning">
                        <IconAlert size={32} color="currentColor" />
                    </div>
                    <p className="toast-message">
                        Stock faible :<br />
                        <strong>{first.name}</strong><br />
                        <span style={{ fontSize: '0.9em', opacity: 0.7 }}>Plus que {first.stock} disponibles</span>
                    </p>
                    <button className="toast-close-btn" onClick={() => setDismissedStock(d => [...d, first.id])}>
                        C'est noté
                    </button>
                </div>
            </div>
        )
    }

    return null
}
