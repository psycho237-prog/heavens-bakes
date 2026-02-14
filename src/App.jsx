import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { StoreProvider, useStore } from './store/useStore'
import BottomNav from './components/BottomNav'
import Toast from './components/Toast'
import LoadingScreen from './components/LoadingScreen'
import Dashboard from './pages/Dashboard'
import Vente from './pages/Vente'
import Factures from './pages/Factures'
import Produits from './pages/Produits'
import Clients from './pages/Clients'
import Parametres from './pages/Parametres'
import './App.css'

function AppContent() {
    const { loading } = useStore()
    const [deferredPrompt, setDeferredPrompt] = useState(null)
    const [showInstallBanner, setShowInstallBanner] = useState(false)
    const [isManualPrompt, setIsManualPrompt] = useState(false)
    const [installStatus, setInstallStatus] = useState('idle') // 'idle', 'installing', 'success'

    useEffect(() => {
        const handler = (e) => {
            e.preventDefault()
            setDeferredPrompt(e)
            setShowInstallBanner(true)
            setIsManualPrompt(false)
        }
        window.addEventListener('beforeinstallprompt', handler)

        const timer = setTimeout(() => {
            if (!deferredPrompt) {
                setShowInstallBanner(true)
                setIsManualPrompt(true)
            }
        }, 10000)

        return () => {
            window.removeEventListener('beforeinstallprompt', handler)
            clearTimeout(timer)
        }
    }, [deferredPrompt])

    const handleInstallClick = async () => {
        setInstallStatus('installing')

        try {
            if (deferredPrompt) {
                deferredPrompt.prompt()
                const { outcome } = await deferredPrompt.userChoice
                if (outcome !== 'accepted') {
                    setInstallStatus('idle')
                    return
                }
            }

            // Universal UX: Show progress and success even on manual fallback
            setTimeout(() => {
                setInstallStatus('success')
                setTimeout(() => {
                    setShowInstallBanner(false)
                    setInstallStatus('idle')
                    if (!isManualPrompt) setDeferredPrompt(null)
                }, 2000)
            }, 1800)

        } catch (err) {
            console.error('Install error:', err)
            setInstallStatus('idle')
        }
    }

    const handleDismiss = () => {
        setShowInstallBanner(false)
    }

    if (loading) return <LoadingScreen />

    return (
        <div className="app-shell anim-fade">
            <div className="app-main">
                <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/vente" element={<Vente />} />
                    <Route path="/factures" element={<Factures />} />
                    <Route path="/produits" element={<Produits />} />
                    <Route path="/clients" element={<Clients />} />
                    <Route path="/parametres" element={<Parametres />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </div>
            <BottomNav />
            <Toast />

            {showInstallBanner && (
                <div className={`install-floating-card anim-slide-up ${installStatus}`}>
                    <div className="install-card-content">
                        <div className="install-card-icon">
                            {installStatus === 'success' ? (
                                <div className="success-check-anim">
                                    <svg viewBox="0 0 52 52">
                                        <circle cx="26" cy="26" r="25" fill="none" />
                                        <path fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
                                    </svg>
                                </div>
                            ) : (
                                <img src="/logo.png" alt="App Icon" />
                            )}
                        </div>
                        <div className="install-card-text">
                            <h4>
                                {installStatus === 'idle' && "Installer l'application"}
                                {installStatus === 'installing' && (isManualPrompt ? "Préparation..." : "Installation en cours...")}
                                {installStatus === 'success' && (isManualPrompt ? "Prêt à installer !" : "Installé avec succès !")}
                            </h4>
                            <p>
                                {installStatus === 'idle' && (isManualPrompt ? "Prêt pour votre écran d'accueil" : "Accès hors ligne & rapide")}
                                {installStatus === 'installing' && "Veuillez patienter..."}
                                {installStatus === 'success' && (isManualPrompt ? "Cliquez sur 'Ajouter' dans votre menu" : "Retrouvez-nous sur votre écran d'accueil")}
                            </p>
                        </div>

                        {installStatus === 'idle' && (
                            <>
                                <button className="btn-card-install" onClick={handleInstallClick}>
                                    Installer
                                </button>
                                <button className="btn-card-close" onClick={handleDismiss}>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <line x1="18" y1="6" x2="6" y2="18"></line>
                                        <line x1="6" y1="6" x2="18" y2="18"></line>
                                    </svg>
                                </button>
                            </>
                        )}

                        {installStatus === 'installing' && (
                            <div className="install-loading-spinner"></div>
                        )}
                    </div>
                    {installStatus === 'installing' && (
                        <div className="install-progress-bar-container">
                            <div className="install-progress-bar-fill"></div>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

export default function App() {
    return (
        <StoreProvider>
            <BrowserRouter>
                <AppContent />
            </BrowserRouter>
        </StoreProvider>
    )
}
