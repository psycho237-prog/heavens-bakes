import { IconDove } from './Icons'
import './LoadingScreen.css'

export default function LoadingScreen() {
    return (
        <div className="loading-overlay">
            <div className="loading-logo-container">
                <div className="loading-halo"></div>
                <div className="loading-logo">
                    <img src="/logo.png" alt="Logo" className="loading-logo-img" style={{ height: 48, width: 'auto' }} />
                </div>
            </div>
            <p className="loading-text">Chargement des délices...</p>
        </div>
    )
}
