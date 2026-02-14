import { useState } from 'react'
import { useStore } from '../store/useStore'
import { IconSettings, IconStore, IconTarget, IconBox, IconReceipt, IconUsers, IconSave, IconDownload, IconUpload, IconTrash, IconDove } from '../components/Icons'
import './Parametres.css'

export default function Parametres() {
    const { settings, updateSettings, invoices, products, clients } = useStore()
    const [showExport, setShowExport] = useState(false)
    const [showSuccess, setShowSuccess] = useState(false)

    const handleExport = () => {
        const data = JSON.stringify({ invoices, products, clients, settings }, null, 2)
        const blob = new Blob([data], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `heavens-bakes-backup-${new Date().toISOString().split('T')[0]}.json`
        a.click()
        URL.revokeObjectURL(url)
    }

    const handleImport = (e) => {
        const file = e.target.files?.[0]
        if (!file) return
        const reader = new FileReader()
        reader.onload = (ev) => {
            try {
                const data = JSON.parse(ev.target.result)
                localStorage.setItem('heavens-bakes-data', JSON.stringify({
                    products: data.products || [],
                    invoices: data.invoices || [],
                    clients: data.clients || [],
                    settings: data.settings || settings,
                    cart: [],
                    selectedClient: null,
                }))
                window.location.reload()
            } catch (err) {
                alert('Fichier invalide')
            }
        }
        reader.readAsText(file)
    }

    const handleReset = () => {
        if (confirm('⚠️ Cela supprimera toutes les données. Êtes-vous sûr ?')) {
            localStorage.removeItem('heavens-bakes-data')
            window.location.reload()
        }
    }

    const handleSave = (key, value) => {
        updateSettings({ [key]: value })
        setShowSuccess(true)
        setTimeout(() => setShowSuccess(false), 1500)
    }

    return (
        <div className="page anim-fade">
            <div className="page-header">
                <h1 className="page-title"><IconSettings size={28} /> Paramètres</h1>
                <p className="page-subtitle">Configuration de l'application</p>
            </div>

            {/* Business Info */}
            <div className="section">
                <h3 className="section-title"><IconStore size={18} /> Entreprise</h3>
                <div className="card flex flex-col gap-12">
                    <div className="param-field">
                        <label className="param-label">Nom de l'entreprise</label>
                        <input
                            className="input"
                            value={settings.businessName}
                            onChange={e => handleSave('businessName', e.target.value)}
                        />
                    </div>
                    <div className="param-field">
                        <label className="param-label">Slogan</label>
                        <input
                            className="input"
                            value={settings.tagline}
                            onChange={e => handleSave('tagline', e.target.value)}
                        />
                    </div>
                    <div className="param-field">
                        <label className="param-label">Nom du propriétaire</label>
                        <input
                            className="input"
                            value={settings.ownerName}
                            onChange={e => handleSave('ownerName', e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* Thresholds */}
            <div className="section">
                <h3 className="section-title"><IconTarget size={18} /> Seuils</h3>
                <div className="card flex flex-col gap-12">
                    <div className="param-field">
                        <label className="param-label">Seuil de fidélité (nombre d'achats)</label>
                        <input
                            className="input"
                            type="number"
                            min="1"
                            value={settings.loyaltyThreshold}
                            onChange={e => handleSave('loyaltyThreshold', parseInt(e.target.value) || 10)}
                        />
                    </div>
                    <div className="param-field">
                        <label className="param-label">Seuil d'alerte stock faible</label>
                        <input
                            className="input"
                            type="number"
                            min="0"
                            value={settings.lowStockThreshold}
                            onChange={e => handleSave('lowStockThreshold', parseInt(e.target.value) || 5)}
                        />
                    </div>
                </div>
            </div>

            {/* Data Management */}
            <div className="section">
                <h3 className="section-title"><IconSave size={18} /> Données</h3>
                <div className="card flex flex-col gap-12">
                    <div className="param-data-stats">
                        <div className="param-data-stat">
                            <span className="param-data-stat-value">{products.length}</span>
                            <span className="param-data-stat-label"><IconBox size={12} /> Produits</span>
                        </div>
                        <div className="param-data-stat">
                            <span className="param-data-stat-value">{invoices.length}</span>
                            <span className="param-data-stat-label"><IconReceipt size={12} /> Factures</span>
                        </div>
                        <div className="param-data-stat">
                            <span className="param-data-stat-value">{clients.length}</span>
                            <span className="param-data-stat-label"><IconUsers size={12} /> Clients</span>
                        </div>
                    </div>

                    <button className="btn btn-secondary w-full" onClick={handleExport}>
                        <IconDownload size={18} /> Exporter les données (JSON)
                    </button>

                    <label className="btn btn-outline w-full" style={{ cursor: 'pointer' }}>
                        <IconUpload size={18} /> Importer des données
                        <input type="file" accept=".json" onChange={handleImport} style={{ display: 'none' }} />
                    </label>

                    <button
                        className="btn btn-outline w-full"
                        onClick={handleReset}
                        style={{ color: 'var(--danger)', borderColor: 'var(--danger)' }}
                    >
                        <IconTrash size={18} /> Réinitialiser toutes les données
                    </button>
                </div>
            </div>

            {/* App Info */}
            <div className="param-footer">
                <div className="param-footer-logo"><img src="/logo.png" alt="Logo" style={{ height: 32, width: 'auto' }} /></div>
                <p className="fw-600">Heaven's Bakes & Sips</p>
                <p className="text-xs text-muted">Version 1.0.0</p>
                <p className="text-xs text-muted font-display" style={{ fontStyle: 'italic', marginTop: 4 }}>
                    Un nuage de douceur, une vague de fraîcheur.
                </p>
            </div>

            {/* Save Success Toast */}
            {showSuccess && (
                <div className="toast toast-success">
                    <IconCheck size={16} color="white" /> Paramètre enregistré
                </div>
            )}
        </div>
    )
}
