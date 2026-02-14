import { Link } from 'react-router-dom'
import { useStore } from '../store/useStore'
import { IconDove, IconReceipt, IconChevronRight, IconBell, IconTrendUp, IconAlert, IconRefresh } from '../components/Icons'
import './Dashboard.css'
import { useMemo } from 'react'

export default function Dashboard() {
    const { settings, todayTotal, todayInvoices, products, loading, seedDatabase, invoices, lowStockProducts } = useStore()

    // Calculate real popular products based on Sales History
    const popular = useMemo(() => {
        if (!products || products.length === 0 || !invoices || invoices.length === 0) return []

        const salesCount = {}

        invoices.forEach(inv => {
            if (inv.items && Array.isArray(inv.items)) {
                inv.items.forEach(item => {
                    if (item.name) {
                        salesCount[item.name] = (salesCount[item.name] || 0) + (item.qty || 0)
                    }
                })
            }
        })

        return products
            .map(p => ({ ...p, sales: salesCount[p.name] || 0 }))
            .filter(p => p.sales > 0)
            .sort((a, b) => b.sales - a.sales)
            .slice(0, 1) // Only top 1 for the highlight card
    }, [products, invoices])

    // Specific low stock item to show (take the first one)
    const criticalStockItem = lowStockProducts.length > 0 ? lowStockProducts[0] : null

    return (
        <div className="page anim-fade">
            {/* 1. Header Bar */}
            <header className="dash-header-bar">
                <div className="dash-header-logo">
                    <img src="/logo.png" alt="Logo" className="header-logo-img" style={{ height: 32, width: 'auto' }} />
                    <span className="header-logo-text">HEAVEN'S</span>
                </div>
                <button className="header-profile-btn">
                    <IconBell size={20} />
                    <span className="notif-badge"></span>
                </button>
            </header>

            {/* 2. Greeting */}
            <div className="dash-greeting">
                <h1 className="greeting-title">Bonjour {settings.ownerName}!</h1>
                <p className="greeting-subtitle">{settings.tagline}</p>
            </div>

            {/* 3. Main Action */}
            <div className="dash-action-section">
                <Link to="/vente" className="btn-vendre">
                    VENDRE
                </Link>
            </div>

            {/* Empty State / Init */}
            {!loading && products.length === 0 && (
                <div className="dash-section">
                    <div className="bg-purple-50 p-6 rounded-xl text-center border border-purple-100">
                        <p className="text-purple-900 font-semibold mb-2">Aucun produit trouvé</p>
                        <button
                            onClick={seedDatabase}
                            className="bg-purple-600 text-white px-6 py-2 rounded-full font-bold shadow-lg hover:bg-purple-700 transition mt-2 text-sm flex items-center gap-2 mx-auto"
                        >
                            <IconRefresh size={14} /> Initialiser
                        </button>
                    </div>
                </div>
            )}

            {/* 4. Stats Grid */}
            <div className="dash-stats-section">
                <div className="stats-row">
                    {/* Sales Card */}
                    <div className="stat-box left">
                        <span className="stat-label-small">Total Ventes</span>
                        <span className="stat-value-big">
                            {todayTotal.toLocaleString()}
                            <span className="stat-currency"> {settings.currency}</span>
                        </span>
                        {/* Decorative background strokes could go here */}
                    </div>

                    {/* Invoices Card */}
                    <Link to="/factures" className="stat-box right">
                        <span className="stat-value-big" style={{ fontSize: '1.8rem', marginBottom: '4px' }}>
                            {todayInvoices.length.toString().padStart(2, '0')}
                        </span>
                        <span className="stat-label-small" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            Factures <IconReceipt size={14} color="#9B7EC8" />
                        </span>
                    </Link>
                </div>
            </div>

            {/* 5. Highlight / Popular */}
            {popular.length > 0 && (
                <div className="dash-highlight-section">
                    <div className="highlight-card">
                        <div className="highlight-content">
                            <div className="highlight-icon">
                                <IconTrendUp size={18} />
                            </div>
                            <div>
                                <div className="highlight-text">{popular[0].name}</div>
                                <div className="highlight-sub">Le plus vendus ({popular[0].sales})</div>
                            </div>
                        </div>
                        <img src={popular[0].image} alt="" className="highlight-img" />
                    </div>
                </div>
            )}

            {/* 6. Stock Section (Only if low stock) */}
            {criticalStockItem && (
                <div className="dash-stock-section">
                    <h3 className="section-label">Stock faible:</h3>
                    <Link to="/produits" className="stock-card">
                        <div className="stock-info">
                            <div className="stock-icon">
                                {/* Use a generic cupcake icon or the product image if available */}
                                {criticalStockItem.image ? (
                                    <img src={criticalStockItem.image} alt="" style={{ width: 40, height: 40, objectFit: 'contain' }} />
                                ) : (
                                    <IconAlert size={24} color="#EF4444" />
                                )}
                            </div>
                            <div className="stock-details">
                                <h4>{criticalStockItem.name}</h4>
                                <p>({criticalStockItem.stock} restants)</p>
                            </div>
                        </div>
                        <div className="stock-action">
                            <IconChevronRight size={16} />
                        </div>
                    </Link>
                </div>
            )}
        </div>
    )
}
