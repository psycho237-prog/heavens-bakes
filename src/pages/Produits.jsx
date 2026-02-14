import { useState } from 'react'
import { useStore } from '../store/useStore'
import { IconSearch, IconPlus, IconEdit, IconTrash, IconBox, IconUpload, IconAlert, IconUser } from '../components/Icons'
import './Produits.css'

export default function Produits() {
    const { products, addProduct, updateProduct, deleteProduct, settings } = useStore()
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingId, setEditingId] = useState(null)
    const [search, setSearch] = useState('')
    const [activeCat, setActiveCat] = useState('all')

    // Form state
    const [formData, setFormData] = useState({
        name: '', category: 'crepes-natures', price: '', stock: '', image: '/images/crepes-natures.png'
    })

    // Pre-defined images for selection
    const imageOptions = [
        { label: 'Crêpes Natures', value: '/images/crepes-natures.png' },
        { label: 'Crêpes Panées', value: '/images/crepes-panees.png' },
        { label: 'Crêpes + Jus', value: '/images/combo-crepes-juice.png' }, // Added placeholder if needed
        { label: 'Jus Foléré', value: '/images/juice-folere.png' },
        { label: 'Jus Baobab', value: '/images/juice-baobab.png' },
        { label: 'Jus Menthe', value: '/images/juice-menthe.png' }
    ]

    const handleSubmit = (e) => {
        e.preventDefault()
        const productData = {
            ...formData,
            price: parseInt(formData.price),
            stock: parseInt(formData.stock),
            active: true
        }

        if (editingId) {
            updateProduct(editingId, productData)
        } else {
            addProduct(productData)
        }
        setIsModalOpen(false)
        resetForm()
    }

    const handleEdit = (product) => {
        setEditingId(product.id)
        setFormData({
            name: product.name,
            category: product.category,
            price: product.price,
            stock: product.stock,
            image: product.image
        })
        setIsModalOpen(true)
    }

    const resetForm = () => {
        setEditingId(null)
        setFormData({ name: '', category: 'crepes-natures', price: '', stock: '', image: '/images/crepes-natures.png' })
    }

    const handleDelete = (id) => {
        if (confirm('Supprimer ce produit ?')) deleteProduct(id)
    }

    const categoriesNav = [
        { id: 'all', label: 'Tout' },
        { id: 'crepes-natures', label: 'Crêpes Natures' },
        { id: 'crepes-panees', label: 'Crêpes Panées' },
        { id: 'packs', label: 'Packs' },
        { id: 'jus', label: 'Jus' },
    ]

    const getProductsByCategory = (catId) => {
        return products.filter(p => p.category === catId && p.name.toLowerCase().includes(search.toLowerCase()))
    }

    return (
        <div className="page produits-page">
            {/* Header */}
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
                <button className="profile-btn">
                    <IconUser size={20} color="#3D2C5E" />
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

            <div className="produits-content">
                <div className="section-header-row">
                    <h2 className="section-heading-serif">Produits & Stock</h2>
                </div>

                {/* Main List Layout */}
                <div className="prod-list-container">
                    {['crepes-natures', 'crepes-panees', 'packs'].map((catId) => {
                        const catProducts = getProductsByCategory(catId)
                        if (activeCat !== 'all' && activeCat !== catId) return null
                        if (catProducts.length === 0) return null

                        return catProducts.map(p => (
                            <div key={p.id} className="prod-card-horizontal">
                                <div className="prod-card-img-wrapper">
                                    <img src={p.image} alt={p.name} className="prod-card-img" />
                                </div>
                                <div className="prod-card-info">
                                    <h3 className="prod-card-title">{p.name}</h3>
                                    <p className={`prod-card-stock ${p.stock <= settings.lowStockThreshold ? 'stock-low' : ''}`}>
                                        Stock: {p.stock}
                                        {p.stock <= settings.lowStockThreshold && <span> (Faible)</span>}
                                    </p>
                                    {p.category.includes('pack') && <p className="prod-card-sub">+ cercles précieux</p>}
                                </div>
                                <div className="prod-card-end">
                                    <span className="prod-card-price">{p.price} <small>FCFA</small></span>
                                    <button className="btn-action-pill" onClick={() => handleEdit(p)}>
                                        Editer
                                    </button>
                                </div>
                            </div>
                        ))
                    })}
                </div>

                {/* Grid Layout (Jus) */}
                {(activeCat === 'all' || activeCat === 'jus') && getProductsByCategory('jus').length > 0 && (
                    <div className="jus-section mt-6">
                        <h2 className="section-heading-serif">Jus Naturels</h2>
                        <div className="jus-grid">
                            {getProductsByCategory('jus').map(p => (
                                <div key={p.id} className="jus-card">
                                    <div className="jus-img-box">
                                        <img src={p.image} alt={p.name} className="jus-img" />
                                    </div>
                                    <div className="jus-info">
                                        <h3 className="jus-name">{p.name}</h3>
                                        <p className="jus-stock mb-1">Stock: {p.stock}</p>
                                        <div className="jus-price-row">
                                            <div className="mini-diamond"></div>
                                            <span>{p.price} FCFA</span>
                                        </div>
                                        <button className="btn-gold-pill" onClick={() => handleEdit(p)}>
                                            Editer
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* FAB Add */}
            <button className="fab-add" onClick={() => { resetForm(); setIsModalOpen(true) }}>
                <IconPlus size={24} />
            </button>

            {/* Modal / Bottom Sheet Form */}
            {isModalOpen && (
                <div className="modal-backdrop" onClick={() => setIsModalOpen(false)}>
                    {/* Stop propagation on click to backdrop stays */}
                    <div className="modal-card" onClick={e => e.stopPropagation()}>

                        {/* Visual Handle for "pull up" feel */}
                        <div className="modal-handle-bar">
                            <div className="modal-handle-pill"></div>
                        </div>

                        <div className="modal-header">
                            <h3 className="modal-title">{editingId ? 'Modifier' : 'Nouveau Produit'}</h3>
                            <button className="icon-btn" onClick={() => setIsModalOpen(false)}>✕</button>
                        </div>

                        {/* Scrollable Form Content */}
                        <form onSubmit={handleSubmit} className="modal-form-wrapper">
                            <div className="modal-scroll-content">
                                <label className="form-group">
                                    <span>Nom du produit</span>
                                    <input required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="input" placeholder="Ex: Crêpes..." />
                                </label>

                                <div className="form-row">
                                    <label className="form-group">
                                        <span>Prix</span>
                                        <input type="number" required value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} className="input" placeholder="0" />
                                    </label>
                                    <label className="form-group">
                                        <span>Stock Initial</span>
                                        <input type="number" required value={formData.stock} onChange={e => setFormData({ ...formData, stock: e.target.value })} className="input" placeholder="0" />
                                    </label>
                                </div>

                                <label className="form-group">
                                    <span>Catégorie</span>
                                    <select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} className="input">
                                        <option value="crepes-natures">Crêpes Natures</option>
                                        <option value="crepes-panees">Crêpes Panées</option>
                                        <option value="packs">Packs</option>
                                        <option value="jus">Jus</option>
                                    </select>
                                </label>

                                <label className="form-group">
                                    <span>Image</span>
                                    <div className="image-selector">
                                        {imageOptions.map(opt => (
                                            <div
                                                key={opt.value}
                                                className={`image-option ${formData.image === opt.value ? 'selected' : ''}`}
                                                onClick={() => setFormData({ ...formData, image: opt.value })}
                                            >
                                                <img src={opt.value} alt={opt.label} />
                                            </div>
                                        ))}
                                    </div>
                                </label>

                                {editingId && (
                                    <div className="form-group">
                                        <button type="button" className="btn btn-danger-outline" onClick={() => handleDelete(editingId)}>
                                            <IconTrash size={16} /> Supprimer
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Fixed Footer for Primary Action */}
                            <div className="modal-footer">
                                <button type="submit" className="btn btn-primary w-full">
                                    {editingId ? 'Mettre à jour' : 'Ajouter le produit'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
