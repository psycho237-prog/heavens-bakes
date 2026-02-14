import { NavLink, useLocation } from 'react-router-dom'
import { IconHome, IconCart, IconReceipt, IconBox, IconUsers } from './Icons'
import './BottomNav.css'

const navItems = [
    { path: '/', icon: IconHome, label: 'Accueil' },
    { path: '/vente', icon: IconCart, label: 'Vente' },
    { path: '/factures', icon: IconReceipt, label: 'Factures' },
    { path: '/produits', icon: IconBox, label: 'Produits' },
    { path: '/clients', icon: IconUsers, label: 'Clients' },
]

export default function BottomNav() {
    const location = useLocation()

    return (
        <nav className="bottom-nav" role="navigation" aria-label="Navigation principale">
            <div className="bottom-nav-inner">
                {navItems.map((item, i) => {
                    const isActive = location.pathname === item.path ||
                        (item.path !== '/' && location.pathname.startsWith(item.path))
                    const Icon = item.icon
                    return (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={`bottom-nav-item ${isActive ? 'active' : ''}`}
                            style={{ '--i': i }}
                        >
                            <span className="bottom-nav-icon">
                                <Icon size={20} color={isActive ? '#9B7EC8' : '#B8ADCC'} />
                            </span>
                            <span className="bottom-nav-label">{item.label}</span>
                            {isActive && <span className="bottom-nav-indicator" />}
                        </NavLink>
                    )
                })}
            </div>
        </nav>
    )
}
