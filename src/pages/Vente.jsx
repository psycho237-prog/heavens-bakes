import { useState, useMemo } from 'react'
import { useStore } from '../store/useStore'
import { IconSearch, IconCart, IconPlus, IconMinus, IconTrash, IconCheck, IconX, IconUser, IconChevronRight, IconReceipt } from '../components/Icons'
import './Vente.css'

export default function Vente() {
    const {
        products, cart, addToCart, updateCartQty, cartTotal, cartCount,
        clients, selectedClient, setSelectedClient, completeSale,
        topClients // Get top clients from store
    } = useStore()

    const [activeCat, setActiveCat] = useState('all')
    const [search, setSearch] = useState('')
    const [isCartOpen, setIsCartOpen] = useState(false)
    const [pendingProduct, setPendingProduct] = useState(null)
    const [pendingQty, setPendingQty] = useState(1)
    const [customClientName, setCustomClientName] = useState('')
    const [saleNote, setSaleNote] = useState('')
    const [showSuccess, setShowSuccess] = useState(false)

    // Derived state for categories to show
    const categoriesToShow = useMemo(() => {
        const cats = [
            { id: 'crepes-natures', label: 'Crêpes Natures' },
            { id: 'crepes-panees', label: 'Crêpes Panées' },
            { id: 'packs', label: 'Packs Spéciaux' },
            { id: 'jus', label: 'Jus Naturels' },
        ]
        if (activeCat === 'all') return cats
        return cats.filter(c => c.id === activeCat)
    }, [activeCat])

    const getProductsByCategory = (catId) => {
        return products.filter(p => p.category === catId && p.name.toLowerCase().includes(search.toLowerCase()))
    }

    const categoriesNav = [
        { id: 'all', label: 'Tout' },
        { id: 'crepes-natures', label: 'Crêpes Natures' },
        { id: 'crepes-panees', label: 'Crêpes Panées' },
        { id: 'packs', label: 'Packs' },
        { id: 'jus', label: 'Jus' },
    ]

    const handleQuickSale = () => {
        if (!pendingProduct) return

        const item = {
            id: pendingProduct.id,
            name: pendingProduct.name,
            price: pendingProduct.price,
            qty: pendingQty,
            total: pendingProduct.price * pendingQty
        }

        completeSale({
            items: [item],
            clientName: customClientName,
            notes: saleNote
        })

        setPendingProduct(null)
        setPendingQty(1)
        setCustomClientName('')
        setSaleNote('')
        setShowSuccess(true)
        setTimeout(() => setShowSuccess(false), 2000)
    }

    const handleAddToOrder = () => {
        if (!pendingProduct) return
        // Build array of items to add based on qty
        for (let i = 0; i < pendingQty; i++) {
            addToCart(pendingProduct.id)
        }
        setPendingProduct(null)
        setPendingQty(1)
        // We don't clear clientName/note here as they might want to use them for the whole order
    }

    const handleFinishCartOrder = () => {
        completeSale({
            clientName: customClientName,
            notes: saleNote
        })
        setIsCartOpen(false)
        setShowSuccess(true)
        setCustomClientName('')
        setSaleNote('')
        setTimeout(() => setShowSuccess(false), 2000)
    }

    const selectedClientObj = clients.find(c => c.id === selectedClient)

    return (
        <div className="page vente-page">
            {/* Header with Search & Profile */}
            <header className="page-header-refined">
                <div className="search-container">
                    <IconSearch size={18} color="#9EA3B0" />
                    <input
                        type="text"
                        placeholder="Rechercher..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="search-input"
                    />
                </div>
                <button className={`header-cart-btn ${cartCount > 0 ? 'has-items' : ''}`} onClick={() => setIsCartOpen(true)}>
                    <IconCart size={22} color="#3D2C5E" />
                    {cartCount > 0 && <span className="header-cart-badge">{cartCount}</span>}
                </button>
            </header>

            {/* Category Tabs */}
            <div className="cat-tabs-container">
                <div className="cat-tabs">
                    {categoriesNav.map(cat => (
                        <button
                            key={cat.id}
                            className={`cat-tab ${activeCat === cat.id ? 'active' : ''}`}
                            onClick={() => setActiveCat(cat.id)}
                        >
                            {cat.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Product Grid */}
            <div className="vente-content">
                {categoriesToShow.map(cat => {
                    const catProducts = getProductsByCategory(cat.id)
                    if (catProducts.length === 0) return null

                    return (
                        <section key={cat.id} className="product-section">
                            <h2 className="section-heading">{cat.label}</h2>
                            <div className="vente-grid">
                                {catProducts.map(p => {
                                    const inCart = cart.find(c => c.productId === p.id)
                                    return (
                                        <div key={p.id} className="v-card" onClick={() => {
                                            setPendingProduct(p)
                                            setPendingQty(1)
                                        }}>
                                            <div className="v-card-img-box">
                                                <img src={p.image} alt={p.name} className="v-card-img" loading="lazy" />
                                                {inCart && (
                                                    <div className="qty-badge-overlay">
                                                        {inCart.qty}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="v-card-info">
                                                <h3 className="v-card-title">{p.name}</h3>
                                                <div className="v-card-meta">
                                                    <span className="v-card-price">
                                                        {p.category.includes('pack') ? 'Pack ' : '+ '}{p.price} <small>FCFA</small>
                                                    </span>
                                                    <div className="v-card-action">
                                                        <div className="mini-circle"></div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </section>
                    )
                })}
            </div>

            {/* Floating Summary Bar (The "Cart" Trigger) */}
            {cartCount > 0 && !pendingProduct && !isCartOpen && (
                <div className="checkout-bar-trigger anim-slide-up" onClick={() => setIsCartOpen(true)}>
                    <div className="bar-info">
                        <span className="bar-qty">{cartCount} {cartCount > 1 ? 'articles' : 'article'}</span>
                        <span className="bar-total">{cartTotal.toLocaleString()} FCFA</span>
                    </div>
                    <div className="bar-action">
                        <span>Vérifier la commande</span>
                        <IconChevronRight size={18} />
                    </div>
                </div>
            )}

            {/* PRODUCT DETAILS & ACTION MODAL */}
            {pendingProduct && (
                <div className="modal-backdrop anim-fade" onClick={() => setPendingProduct(null)}>
                    <div className="checkout-sheet slide-up" onClick={e => e.stopPropagation()}>

                        <div className="sheet-handle-bar"></div>

                        <div className="sheet-header">
                            <h2 className="sheet-title">Détails du produit</h2>
                            <button className="icon-btn" onClick={() => setPendingProduct(null)}>
                                <IconX size={20} />
                            </button>
                        </div>

                        <div className="sheet-scroll-content">

                            {/* Product Summary */}
                            <div className="product-summary-card-pro">
                                <img src={pendingProduct.image} alt={pendingProduct.name} className="p-pro-img" />
                                <div className="p-pro-info">
                                    <h3 className="p-pro-name">{pendingProduct.name}</h3>
                                    <span className="p-pro-price">{pendingProduct.price.toLocaleString()} FCFA</span>
                                    <span className="p-pro-unit">/ unité</span>
                                </div>
                            </div>

                            {/* Quantity Selector - Refined */}
                            <div className="checkout-section">
                                <label className="section-label-pro">Quantité souhaitée</label>
                                <div className="qty-pill-container">
                                    <button className="qty-pill-btn" onClick={() => setPendingQty(Math.max(1, pendingQty - 1))}>
                                        <IconMinus size={20} />
                                    </button>
                                    <div className="qty-pill-value">
                                        <span className="qty-number">{pendingQty}</span>
                                        <span className="qty-label">{pendingQty > 1 ? 'unités' : 'unité'}</span>
                                    </div>
                                    <button className="qty-pill-btn" onClick={() => setPendingQty(pendingQty + 1)}>
                                        <IconPlus size={20} />
                                    </button>
                                </div>
                            </div>

                            <div className="checkout-section">
                                <label className="section-label-pro">Informations Client (Vente Directe)</label>
                                <div className="client-selector-card">
                                    <div className="client-icon-box">
                                        <IconUser size={20} color="#3D2C5E" />
                                    </div>
                                    <div className="client-info-box">
                                        <select
                                            className="client-select-native"
                                            value={selectedClient || ''}
                                            onChange={e => {
                                                setSelectedClient(e.target.value || null);
                                                if (e.target.value) setCustomClientName('');
                                            }}
                                        >
                                            <option value="">Nouveau / Anonyme</option>
                                            {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                        </select>
                                    </div>
                                </div>
                                {!selectedClient && (
                                    <div className="manual-client-input mt-3">
                                        <input
                                            type="text"
                                            placeholder="Nom du client (optionnel)"
                                            value={customClientName}
                                            onChange={e => setCustomClientName(e.target.value)}
                                            className="input-refined"
                                        />
                                    </div>
                                )}
                            </div>

                            <div className="checkout-section">
                                <label className="section-label-pro">Note particulière (Vente Directe)</label>
                                <textarea
                                    placeholder="Ajouter une note..."
                                    value={saleNote}
                                    onChange={e => setSaleNote(e.target.value)}
                                    className="textarea-refined"
                                    rows="2"
                                />
                            </div>
                        </div>

                        {/* Footer - Dual Actions */}
                        <div className="sheet-footer stack-vertical">
                            <button className="btn-checkout-final secondary" onClick={handleAddToOrder}>
                                <div className="btn-content">
                                    <span>Ajouter à la commande</span>
                                    <IconCart size={20} />
                                </div>
                            </button>

                            <button className="btn-checkout-final" onClick={handleQuickSale}>
                                <div className="btn-content">
                                    <span>Vendre immédiatement</span>
                                    <IconCheck size={20} />
                                </div>
                            </button>
                        </div>

                    </div>
                </div>
            )}

            {/* FULL CHECKOUT MODAL (For multi-item orders) */}
            {isCartOpen && (
                <div className="modal-backdrop anim-fade" onClick={() => setIsCartOpen(false)}>
                    <div className="checkout-sheet slide-up" onClick={e => e.stopPropagation()}>

                        <div className="sheet-handle-bar"></div>

                        <div className="sheet-header">
                            <h2 className="sheet-title">Résumé de la commande</h2>
                            <button className="icon-btn" onClick={() => setIsCartOpen(false)}>
                                <IconX size={20} />
                            </button>
                        </div>

                        <div className="sheet-scroll-content">
                            {/* Client & Sale Info */}
                            <div className="checkout-section">
                                <label className="section-label-pro">Informations Client</label>

                                {/* Top Clients Chips */}
                                {topClients.length > 0 && (
                                    <div className="client-chips-container">
                                        <span className="chips-label">Clients Fidèles :</span>
                                        <div className="chips-scroll">
                                            {topClients.map(client => (
                                                <button
                                                    key={client.id}
                                                    className={`client-chip ${selectedClient === client.id ? 'active' : ''}`}
                                                    onClick={() => {
                                                        setSelectedClient(client.id)
                                                        setCustomClientName('')
                                                    }}
                                                >
                                                    {client.name}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="client-selector-card">
                                    <div className="client-icon-box">
                                        <IconUser size={20} color="#3D2C5E" />
                                    </div>
                                    <div className="client-info-box">
                                        <select
                                            className="client-select-native"
                                            value={selectedClient || ''}
                                            onChange={e => {
                                                setSelectedClient(e.target.value || null);
                                                if (e.target.value) setCustomClientName('');
                                            }}
                                        >
                                            <option value="">Nouveau / Anonyme</option>
                                            {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                        </select>
                                    </div>
                                </div>
                                {!selectedClient && (
                                    <div className="manual-client-input mt-3">
                                        <input
                                            type="text"
                                            placeholder="Nom du client (optionnel)"
                                            value={customClientName}
                                            onChange={e => setCustomClientName(e.target.value)}
                                            className="input-refined"
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Cart List */}
                            <div className="checkout-section">
                                <label className="section-label-pro">Articles ({cartCount})</label>
                                <div className="checkout-items-list">
                                    {cart.map(item => {
                                        const product = products.find(p => p.id === item.productId)
                                        if (!product) return null
                                        return (
                                            <div key={item.productId} className="checkout-item">
                                                <div className="checkout-item-left">
                                                    <span className="checkout-qty-badge">{item.qty}x</span>
                                                    <div className="checkout-item-details">
                                                        <span className="checkout-item-name">{product.name}</span>
                                                        <span className="checkout-item-unit-price">{product.price} F</span>
                                                    </div>
                                                </div>
                                                <div className="qty-controls-mini">
                                                    <button onClick={() => updateCartQty(item.productId, item.qty - 1)}>-</button>
                                                    <button onClick={() => updateCartQty(item.productId, item.qty + 1)}>+</button>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>

                            <div className="checkout-section">
                                <label className="section-label-pro">Notes de vente</label>
                                <textarea
                                    placeholder="Ajouter une note..."
                                    value={saleNote}
                                    onChange={e => setSaleNote(e.target.value)}
                                    className="textarea-refined"
                                    rows="2"
                                />
                            </div>
                        </div>

                        <div className="sheet-footer">
                            <div className="summary-row display-total">
                                <span className="label">Total à payer</span>
                                <span className="value">{cartTotal.toLocaleString()} <small>FCFA</small></span>
                            </div>
                            <button className="btn-checkout-final" onClick={handleFinishCartOrder}>
                                <div className="btn-content">
                                    <span>Valider la commande</span>
                                    <IconCheck size={20} />
                                </div>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Success Animation Overlay */}
            {showSuccess && (
                <div className="success-overlay anim-fade">
                    <div className="success-card anim-pop">
                        <div className="success-icon">
                            <IconCheck size={40} color="#fff" />
                        </div>
                        <h3>Vente réussie !</h3>
                        <p>Facture générée avec succès.</p>
                    </div>
                </div>
            )}
        </div>
    )
}
