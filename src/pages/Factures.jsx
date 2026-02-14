import { useState, useEffect } from 'react'
import { useStore } from '../store/useStore'
import { IconSearch, IconDownload, IconShare, IconReceipt, IconDove, IconPlus, IconUser, IconChevronRight } from '../components/Icons'
import { Link } from 'react-router-dom'
import { jsPDF } from 'jspdf'
import './Factures.css'

export default function Factures() {
    const { invoices, settings } = useStore()
    const [search, setSearch] = useState('')
    const [selectedInvoice, setSelectedInvoice] = useState(null)
    const [randomVerse, setRandomVerse] = useState('')

    const verses = [
        "Car je connais les projets que j'ai formés sur vous, dit l'Éternel, projets de paix et non de malheur. — Jérémie 29:11",
        "L'Éternel est mon berger: je ne manquerai de rien. — Psaumes 23:1",
        "Je puis tout par celui qui me fortifie. — Philippiens 4:13",
        "Ne crains rien, car je suis avec toi; ne promène pas des regards inquiets, car je suis ton Dieu. — Ésaïe 41:10",
        "Confie-toi en l'Éternel de tout ton cœur, et ne t'appuie pas sur ta sagesse. — Proverbes 3:5",
        "L'amour est patient, il est plein de bonté. — 1 Corinthiens 13:4",
        "Soyez forts et prenez courage, car l'Éternel votre Dieu est avec vous. — Josué 1:9",
        "Recommandez vos œuvres à l'Éternel, et vos projets réussiront. — Proverbes 16:3",
        "Que tout ce que vous faites soit fait avec amour. — 1 Corinthiens 16:14",
        "L'Éternel combattra pour vous; et vous, gardez le silence. — Exode 14:14"
    ]

    useEffect(() => {
        if (selectedInvoice) {
            setRandomVerse(verses[Math.floor(Math.random() * verses.length)])
            // Lock body scroll when modal is open
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = ''
        }
        return () => { document.body.style.overflow = '' }
    }, [selectedInvoice])

    const filteredInvoices = invoices.filter(inv =>
        inv.clientName.toLowerCase().includes(search.toLowerCase()) ||
        inv.number.toString().includes(search)
    )

    const generatePDF = (invoice) => {
        // ... (PDF generation logic - minimal update for now)
        const doc = new jsPDF()
        doc.setFontSize(20)
        doc.text("Heaven's Bakes & Sips", 105, 20, { align: 'center' })
        doc.setFontSize(10)
        doc.text("Facture N°" + invoice.number, 105, 30, { align: 'center' })
        doc.save(`Facture-${invoice.number}.pdf`)
    }

    const shareInvoice = (invoice) => {
        const text = `Facture N°${invoice.number} pour ${invoice.clientName}. Total: ${invoice.total} ${settings.currency}. ${randomVerse}`
        const url = `https://wa.me/?text=${encodeURIComponent(text)}`
        window.open(url, '_blank')
    }

    return (
        <div className="page factures-page">
            {/* Consistent Header */}
            <header className="page-header-refined">
                <div className="search-container">
                    <IconSearch size={18} color="#9EA3B0" />
                    <input
                        type="text"
                        placeholder="Rechercher une facture..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="search-input"
                    />
                </div>
                <button className="profile-btn">
                    <IconUser size={20} color="#3D2C5E" />
                </button>
            </header>

            <div className="factures-content">
                <div className="section-header-row">
                    <h2 className="section-heading-serif">Historique</h2>
                    <div className="client-count-badge">{filteredInvoices.length} factures</div>
                </div>

                <div className="invoice-list-refined">
                    {filteredInvoices.map(inv => (
                        <div key={inv.id} className="invoice-card-refined" onClick={() => setSelectedInvoice(inv)}>
                            <div className="inv-icon-box">
                                <IconReceipt size={24} color="#9B7EC8" />
                            </div>

                            <div className="inv-info-refined">
                                <h3 className="inv-client-name">{inv.clientName}</h3>
                                <div className="inv-meta">
                                    <span className="inv-number">#{inv.number}</span>
                                    <span className="inv-sep">•</span>
                                    <span className="inv-date">{new Date(inv.date).toLocaleDateString()}</span>
                                </div>
                            </div>

                            <div className="inv-end">
                                <span className="inv-total-refined">{inv.total.toLocaleString()} <small>FCFA</small></span>
                                <IconChevronRight size={16} color="#D1D5DB" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* FAB New Invoice (Redirects to Vente) */}
            <Link to="/vente" className="fab-add">
                <IconPlus size={24} />
            </Link>

            {/* Invoice Detail Overlay (Kept as overlay but improved transition) */}
            {selectedInvoice && (
                <div className="invoice-detail-overlay anim-fade">
                    <div className="ref-header">
                        <button className="close-btn-top" onClick={() => setSelectedInvoice(null)}>✕</button>
                        <div className="brand-logo-container">
                            <img src="/logo.png" alt="Logo" style={{ height: 64, width: 'auto', marginBottom: 12 }} />
                        </div>
                        <h1 className="brand-title">HEAVEN'S BAKES & SIPS</h1>
                        <p className="brand-tagline">Un nuage de douceur, une vague de fraîcheur.</p>
                    </div>

                    <div className="ticket-card slide-up">
                        <div className="ticket-header-row">
                            <div className="ticket-line"></div>
                            <span className="ticket-title">Facture #{selectedInvoice.number.toString().padStart(4, '0')}</span>
                            <div className="ticket-line"></div>
                        </div>

                        <div className="ticket-meta-row">
                            <span className="ticket-client"><IconUser size={14} /> {selectedInvoice.clientName}</span>
                            <span className="ticket-date">{new Date(selectedInvoice.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                        </div>

                        <div className="ticket-items">
                            {selectedInvoice.items.map((item, i) => (
                                <div key={i} className="ticket-item-row">
                                    <div className="item-left">
                                        <span className="item-name">{item.name} {item.qty > 1 && `(x${item.qty})`}</span>
                                    </div>
                                    <div className="item-right">
                                        <span className="item-price">{item.total.toLocaleString()} <small>FCFA</small></span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="ticket-divider"></div>

                        <div className="ticket-total-row">
                            <span className="label-total">Total</span>
                            <span className="value-total">{selectedInvoice.total.toLocaleString()} <small>FCFA</small></span>
                        </div>

                        {selectedInvoice.notes && (
                            <div className="ticket-notes">
                                <span className="notes-label">Notes:</span>
                                <p className="notes-content">{selectedInvoice.notes}</p>
                            </div>
                        )}

                        <p className="ticket-footer-quote">
                            {randomVerse}
                        </p>
                    </div>

                    <div className="detail-actions">
                        <button className="btn-outline-rounded" onClick={() => generatePDF(selectedInvoice)}>
                            <IconDownload size={18} /> Télécharger PDF
                        </button>
                        <button className="btn-gold-rounded" onClick={() => shareInvoice(selectedInvoice)}>
                            <IconShare size={18} /> Partager WhatsApp
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
