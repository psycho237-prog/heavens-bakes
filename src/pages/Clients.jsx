import { useState } from 'react'
import { useStore } from '../store/useStore'
import { IconUsers, IconSearch, IconPlus, IconUser, IconStar, IconTrendUp, IconEdit, IconTrash, IconPhone, IconCheck, IconBox, IconReceipt, IconDownload, IconShare, IconChevronRight } from '../components/Icons'
import { jsPDF } from 'jspdf'
import './Clients.css'

export default function Clients() {
    const { clients, invoices, addClient, updateClient, deleteClient, settings } = useStore()
    const [search, setSearch] = useState('')
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [formData, setFormData] = useState({ name: '', phone: '' })
    const [editingId, setEditingId] = useState(null)
    const [viewMode, setViewMode] = useState('details') // 'details' or 'history'

    const filteredClients = clients.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.phone.includes(search)
    )

    const handleSubmit = (e) => {
        e.preventDefault()
        if (editingId) {
            updateClient(editingId, formData)
        } else {
            addClient(formData)
        }
        setIsModalOpen(false)
        resetForm()
    }

    const handleEdit = (client) => {
        setEditingId(client.id)
        setFormData({ name: client.name, phone: client.phone })
        setViewMode('details') // Reset to details view
        setIsModalOpen(true)
    }

    const handleDelete = () => {
        if (confirm('Voulez-vous vraiment supprimer ce client ?')) {
            deleteClient(editingId)
            setIsModalOpen(false)
            resetForm()
        }
    }

    const resetForm = () => {
        setEditingId(null)
        setFormData({ name: '', phone: '' })
        setViewMode('details')
    }

    // Helper to calculate stats on the fly
    const getClientStats = (clientId) => {
        const clientInvoices = invoices.filter(inv => inv.clientId === clientId)
        const totalOrders = clientInvoices.length
        const totalSpent = clientInvoices.reduce((sum, inv) => sum + (inv.total || 0), 0)
        const totalItems = clientInvoices.reduce((sum, inv) => {
            return sum + (inv.items?.reduce((s, item) => s + (item.qty || 0), 0) || 0)
        }, 0)
        return { totalOrders, totalSpent, totalItems }
    }

    const getClientInvoices = (clientId) => {
        return invoices.filter(inv => inv.clientId === clientId).sort((a, b) => new Date(b.date) - new Date(a.date))
    }

    // Reuse PDF logic from Factures (simplified for portability if needed, or just simple alert for now if complex)
    // ideally this logic should be a shared utility, but duplicate for safe speed is fine here as per constraints
    const generatePDF = (invoice) => {
        const doc = new jsPDF()
        doc.setFontSize(20)
        doc.text("Heaven's Bakes & Sips", 105, 20, { align: 'center' })
        doc.setFontSize(10)
        doc.text("Facture N°" + invoice.number, 105, 30, { align: 'center' })
        doc.save(`Facture-${invoice.number}.pdf`)
    }

    const shareInvoice = (invoice) => {
        const text = `Facture N°${invoice.number} pour ${invoice.clientName}. Total: ${invoice.total} ${settings.currency}.`
        const url = `https://wa.me/?text=${encodeURIComponent(text)}`
        window.open(url, '_blank')
    }

    return (
        <div className="page clients-page">
            {/* Header */}
            <header className="page-header-refined">
                <div className="search-container">
                    <IconSearch size={18} color="#9EA3B0" />
                    <input
                        type="text"
                        placeholder="Rechercher un client..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="search-input"
                    />
                </div>
                <button className="profile-btn">
                    <IconUser size={20} color="#3D2C5E" />
                </button>
            </header>

            <div className="clients-content">
                <div className="section-header-row">
                    <h2 className="section-heading-serif">Clients Fidèles</h2>
                    <div className="client-count-badge">{filteredClients.length} clients</div>
                </div>

                <div className="client-list">
                    {filteredClients.map(c => {
                        const stats = getClientStats(c.id)
                        return (
                            <div key={c.id} className="client-card-refined" onClick={() => handleEdit(c)}>
                                <div className="client-card-main">
                                    <div className="client-avatar-refined">
                                        <span className="avatar-initial">{c.name.charAt(0).toUpperCase()}</span>
                                    </div>

                                    <div className="client-info">
                                        <h3 className="client-name">{c.name}</h3>
                                        <div className="client-meta-row">
                                            <span className="client-phone">
                                                <IconPhone size={10} /> {c.phone || '—'}
                                            </span>
                                            {c.loyaltyStamps > 0 && (
                                                <div className="loyalty-pill-small">
                                                    <IconStar size={10} filled color="#E8C547" />
                                                    <span>{c.loyaltyStamps} pts</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <button className="btn-action-icon" onClick={(e) => { e.stopPropagation(); handleEdit(c); }}>
                                        <IconEdit size={18} />
                                    </button>
                                </div>

                                {/* Stats Row */}
                                <div className="client-stats-row">
                                    <div className="client-stat-item">
                                        <span className="stat-label">Commandes</span>
                                        <span className="stat-value">
                                            <IconReceipt size={12} /> {stats.totalOrders}
                                        </span>
                                    </div>
                                    <div className="client-stat-item">
                                        <span className="stat-label">Articles</span>
                                        <span className="stat-value">
                                            <IconBox size={12} /> {stats.totalItems}
                                        </span>
                                    </div>
                                    <div className="client-stat-item highlight">
                                        <span className="stat-label">Total Achat</span>
                                        <span className="stat-value">
                                            {stats.totalSpent.toLocaleString()} <small>FCFA</small>
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* FAB Add */}
            <button className="fab-add" onClick={() => { resetForm(); setIsModalOpen(true) }}>
                <IconPlus size={24} />
            </button>

            {/* Bottom Sheet Modal */}
            {isModalOpen && (
                <div className="modal-backdrop" onClick={() => setIsModalOpen(false)}>
                    <div className="modal-card" onClick={e => e.stopPropagation()}>

                        <div className="modal-handle-bar">
                            <div className="modal-handle-pill"></div>
                        </div>

                        <div className="modal-header">
                            <h3 className="modal-title">
                                {viewMode === 'history' ? 'Historique Achats' : (editingId ? 'Modifier client' : 'Nouveau Client')}
                            </h3>
                            <button className="icon-btn" onClick={() => setIsModalOpen(false)}>✕</button>
                        </div>

                        {viewMode === 'details' ? (
                            <form onSubmit={handleSubmit} className="modal-form-wrapper">
                                <div className="modal-scroll-content">
                                    <div className="form-group">
                                        <span>Nom complet</span>
                                        <input
                                            required
                                            value={formData.name}
                                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                                            className="input"
                                            placeholder="Ex: Marie Kouam"
                                        />
                                    </div>

                                    <div className="form-group">
                                        <span>Téléphone</span>
                                        <input
                                            type="tel"
                                            value={formData.phone}
                                            onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                            className="input"
                                            placeholder="Ex: 699..."
                                        />
                                    </div>

                                    {editingId && (
                                        <>
                                            <div className="stats-summary-box">
                                                <h4>Résumé des achats</h4>
                                                <div className="stats-grid-2">
                                                    <div className="stat-box">
                                                        <span className="label">Total dépensé</span>
                                                        <span className="value">{getClientStats(editingId).totalSpent.toLocaleString()} FCFA</span>
                                                    </div>
                                                    <div className="stat-box">
                                                        <span className="label">Articles achetés</span>
                                                        <span className="value">{getClientStats(editingId).totalItems}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Action Button to View History */}
                                            <button
                                                type="button"
                                                className="btn-history-link"
                                                onClick={() => setViewMode('history')}
                                            >
                                                <div className="history-icon-box">
                                                    <IconReceipt size={20} />
                                                </div>
                                                <div className="history-text">
                                                    <span className="history-title">Voir l'historique des factures</span>
                                                    <span className="history-sub">Consulter tous les reçus de ce client</span>
                                                </div>
                                                <IconChevronRight size={16} />
                                            </button>
                                        </>
                                    )}

                                    {editingId && (
                                        <div className="form-group mt-4">
                                            <button type="button" className="btn btn-danger-outline" onClick={handleDelete}>
                                                <IconTrash size={16} /> Supprimer ce client
                                            </button>
                                        </div>
                                    )}
                                </div>

                                <div className="modal-footer">
                                    <button type="submit" className="btn btn-primary w-full">
                                        {editingId ? 'Enregistrer' : 'Ajouter le client'}
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <div className="modal-history-wrapper">
                                <div className="modal-scroll-content">
                                    <div className="history-list">
                                        {getClientInvoices(editingId).length > 0 ? (
                                            getClientInvoices(editingId).map(inv => (
                                                <div key={inv.id} className="history-item">
                                                    <div className="history-left">
                                                        <span className="history-num">Facture #{inv.number}</span>
                                                        <span className="history-date">{new Date(inv.date).toLocaleDateString()}</span>
                                                    </div>
                                                    <div className="history-right">
                                                        <span className="history-amount">{inv.total.toLocaleString()} F</span>
                                                        <div className="history-actions">
                                                            <button onClick={() => shareInvoice(inv)} className="btn-icon-tiny share">
                                                                <IconShare size={14} />
                                                            </button>
                                                            <button onClick={() => generatePDF(inv)} className="btn-icon-tiny download">
                                                                <IconDownload size={14} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="empty-history">
                                                <IconReceipt size={48} color="#E5E7EB" />
                                                <p>Aucune facture trouvée pour ce client.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary w-full" onClick={() => setViewMode('details')}>
                                        Retour
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
