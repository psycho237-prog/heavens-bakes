import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { db } from '../lib/firebase'
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, writeBatch, query, orderBy, getDocs } from 'firebase/firestore'

const StoreContext = createContext()
const STORAGE_KEY = 'heavens-bakes-data'

const defaultSettings = {
    businessName: "Heaven's Bakes & Sips",
    tagline: 'Un nuage de douceur, une vague de fraîcheur.',
    ownerName: 'Sarah',
    loyaltyThreshold: 10,
    lowStockThreshold: 5,
    currency: 'FCFA',
    nextInvoiceNumber: 1,
}

const DEPLOYMENT_PRODUCTS = [
    { name: 'Crêpes natures', category: 'crepes-natures', price: 1500, stock: 50, image: '/images/crepes-natures.png', active: true },
    { name: 'Crêpes panées', category: 'crepes-panees', price: 2000, stock: 35, image: '/images/crepes-panees.png', active: true },
    { name: 'Pack Hallelyum', category: 'packs', price: 6000, stock: 15, desc: 'Pack spécial', image: '/images/crepes-natures.png', active: true },
    { name: 'Pack Névée', category: 'packs', price: 4500, stock: 12, desc: 'Pack spécial', image: '/images/crepes-panees.png', active: true },
    { name: 'Pack Korah', category: 'packs', price: 5500, stock: 18, desc: 'Pack spécial', image: '/images/crepes-natures.png', active: true },
    { name: 'Pack Miraa', category: 'packs', price: 5000, stock: 10, desc: 'Pack spécial', image: '/images/crepes-panees.png', active: true },
    { name: 'Pack Eloa', category: 'packs', price: 5500, stock: 8, desc: 'Pack spécial', image: '/images/crepes-natures.png', active: true },
    { name: 'Pack Fusion', category: 'packs', price: 7000, stock: 10, desc: 'Pack spécial', image: '/images/crepes-panees.png', active: true },
    { name: 'Jus Foléré', category: 'jus', price: 500, stock: 60, image: '/images/juice-folere.png', active: true },
    { name: 'Jus Baobab', category: 'jus', price: 1000, stock: 45, image: '/images/juice-baobab.png', active: true },
    { name: 'Jus Menthe', category: 'jus', price: 1000, stock: 50, image: '/images/juice-menthe.png', active: true },
]

export function StoreProvider({ children }) {
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    // Core Data State
    const [products, setProducts] = useState([])
    const [clients, setClients] = useState([])
    const [invoices, setInvoices] = useState([])
    const [settings, setSettings] = useState(defaultSettings)

    // Local UI State
    const [cart, setCart] = useState([])
    const [selectedClient, setSelectedClient] = useState(null)

    // Data Listeners & Initialization (Unconditional / Public Mode)
    useEffect(() => {
        setLoading(true)

        // Products Listener
        const unsubProducts = onSnapshot(collection(db, 'products'), (snap) => {
            const list = snap.docs.map(d => ({ id: d.id, ...d.data() }))
            setProducts(list)
            if (snap.empty) {
                // Determine if we should seed or just wait
            }
        }, (err) => {
            console.error("Products sync error:", err)
            setError("Problème de synchronisation des produits. (Vérifiez les règles Firestore)")
        })

        // Clients Listener
        const unsubClients = onSnapshot(collection(db, 'clients'), (snap) => {
            const list = snap.docs.map(d => ({ id: d.id, ...d.data() }))
            setClients(list)
        }, (err) => console.error("Clients sync error:", err))

        // Invoices Listener
        const qInvoices = query(collection(db, 'invoices'), orderBy('date', 'desc'))
        const unsubInvoices = onSnapshot(qInvoices, (snap) => {
            const list = snap.docs.map(d => ({ id: d.id, ...d.data() }))
            setInvoices(list)
        }, (err) => console.error("Invoices sync error:", err))

        // Settings Listener
        const unsubSettings = onSnapshot(doc(db, 'settings', 'general'), (snap) => {
            if (snap.exists()) {
                setSettings(snap.data())
            } else {
                migrateLocalStorageData()
            }
            setLoading(false)
        }, (err) => {
            console.error("Settings sync error:", err)
            setError("Impossible de charger les paramètres.")
            setLoading(false)
        })

        return () => {
            unsubProducts()
            unsubClients()
            unsubInvoices()
            unsubSettings()
        }
    }, [])

    const migrateLocalStorageData = async () => {
        const raw = localStorage.getItem(STORAGE_KEY)
        if (!raw) return
        try {
            const localData = JSON.parse(raw)
            const batch = writeBatch(db)
            const settingsRef = doc(db, 'settings', 'general')
            batch.set(settingsRef, localData.settings || defaultSettings)

            if (localData.clients) {
                localData.clients.forEach(c => {
                    batch.set(doc(collection(db, 'clients')), c)
                })
            }
            if (localData.invoices) {
                localData.invoices.forEach(i => {
                    batch.set(doc(collection(db, 'invoices')), i)
                })
            }

            if (localData.products && localData.products.length > 0) {
                localData.products.forEach(p => {
                    batch.set(doc(collection(db, 'products')), p)
                })
            } else {
                DEPLOYMENT_PRODUCTS.forEach(p => {
                    batch.set(doc(collection(db, 'products')), p)
                })
            }

            await batch.commit()
            localStorage.removeItem(STORAGE_KEY)
        } catch (e) {
            console.error("Migration failed:", e)
        }
    }

    const seedDatabase = async () => {
        setLoading(true)
        try {
            const batch = writeBatch(db)
            DEPLOYMENT_PRODUCTS.forEach(p => {
                const docRef = doc(collection(db, 'products'))
                batch.set(docRef, p)
            })
            batch.set(doc(db, 'settings', 'general'), defaultSettings, { merge: true })
            await batch.commit()
            // Success feedback
            alert("Produits réinitialisés avec succès !")
        } catch (err) {
            console.error("Seeding error:", err)
            setError("Échec de l'initialisation.")
        } finally {
            setLoading(false)
        }
    }

    // Explicit dismiss function for UI
    const dismissError = useCallback(() => {
        setError(null)
    }, [])

    const addProduct = useCallback(async (product) => {
        await addDoc(collection(db, 'products'), { ...product, active: true })
    }, [])

    const updateProduct = useCallback(async (id, changes) => {
        await updateDoc(doc(db, 'products', id), changes)
    }, [])

    const deleteProduct = useCallback(async (id) => {
        await deleteDoc(doc(db, 'products', id))
    }, [])

    const addClient = useCallback(async (client) => {
        await addDoc(collection(db, 'clients'), {
            ...client, purchases: 0, totalSpent: 0, loyaltyStamps: 0
        })
    }, [])

    const updateClient = useCallback(async (id, changes) => {
        await updateDoc(doc(db, 'clients', id), changes)
    }, [])

    const deleteClient = useCallback(async (id) => {
        await deleteDoc(doc(db, 'clients', id))
    }, [])

    const updateSettings = useCallback(async (changes) => {
        await updateDoc(doc(db, 'settings', 'general'), changes)
    }, [])

    const addToCart = useCallback((productId) => {
        setCart(prev => {
            const existing = prev.find(c => c.productId === productId)
            if (existing) {
                return prev.map(c => c.productId === productId ? { ...c, qty: c.qty + 1 } : c)
            }
            return [...prev, { productId, qty: 1 }]
        })
    }, [])

    const updateCartQty = useCallback((productId, qty) => {
        setCart(prev => {
            if (qty <= 0) return prev.filter(c => c.productId !== productId)
            return prev.map(c => c.productId === productId ? { ...c, qty } : c)
        })
    }, [])

    const clearCart = useCallback(() => {
        setCart([])
        setSelectedClient(null)
    }, [])

    const completeSale = useCallback(async (overrides = {}) => {
        const saleItems = overrides.items || cart.map(c => {
            const product = products.find(p => p.id === c.productId)
            return {
                id: c.productId,
                name: product?.name || 'Unknown',
                price: product?.price || 0,
                qty: c.qty,
                total: (product?.price || 0) * c.qty
            }
        })

        if (saleItems.length === 0) return

        const invoiceNumber = settings.nextInvoiceNumber
        const total = saleItems.reduce((s, i) => s + i.total, 0)

        // Use manual client name if provided, otherwise fallback to selected client or anonymous
        let clientName = overrides.clientName || 'Client anonyme'
        let clientId = selectedClient

        if (selectedClient) {
            const client = clients.find(c => c.id === selectedClient)
            if (client) clientName = client.name
        }

        const invoice = {
            number: invoiceNumber,
            date: new Date().toISOString(),
            clientName,
            clientId,
            items: saleItems,
            total,
            notes: overrides.notes || ''
        }

        const batch = writeBatch(db)
        batch.set(doc(collection(db, 'invoices')), invoice)
        batch.update(doc(db, 'settings', 'general'), { nextInvoiceNumber: invoiceNumber + 1 })

        saleItems.forEach(item => {
            const product = products.find(p => p.id === item.id)
            if (product) {
                const newStock = Math.max(0, product.stock - item.qty)
                batch.update(doc(db, 'products', item.id), { stock: newStock })
            }
        })

        if (selectedClient) {
            const client = clients.find(c => c.id === selectedClient)
            if (client) {
                batch.update(doc(db, 'clients', selectedClient), {
                    purchases: (client.purchases || 0) + 1,
                    totalSpent: (client.totalSpent || 0) + total,
                    loyaltyStamps: (client.loyaltyStamps || 0) + 1
                })
            }
        }

        await batch.commit()
        if (!overrides.items) clearCart() // Only clear cart if it was a cart sale
    }, [cart, products, clients, settings, selectedClient, clearCart])

    const todayInvoices = invoices.filter(inv => new Date(inv.date).toDateString() === new Date().toDateString())
    const todayTotal = todayInvoices.reduce((s, inv) => s + (inv.total || 0), 0)
    const lowStockProducts = products.filter(p => p.active && p.stock <= settings.lowStockThreshold)
    const cartTotal = cart.reduce((total, item) => {
        const product = products.find(p => p.id === item.productId)
        return total + (product?.price || 0) * item.qty
    }, 0)
    const cartCount = cart.reduce((sum, item) => sum + item.qty, 0)

    // Calculate Top Clients (Top 5 by purchases)
    const topClients = clients
        .filter(c => c.purchases > 0)
        .sort((a, b) => b.purchases - a.purchases)
        .slice(0, 5)

    const value = {
        products, clients, invoices, settings,
        todayInvoices, todayTotal, lowStockProducts, cartTotal, cartCount,
        cart, selectedClient, loading, error, topClients,
        addProduct, updateProduct, deleteProduct,
        addClient, updateClient, deleteClient,
        updateSettings, addToCart, updateCartQty, clearCart,
        setSelectedClient, completeSale,
        seedDatabase, dismissError // Exposed for Toast
    }

    return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useStore() {
    const ctx = useContext(StoreContext)
    if (!ctx) throw new Error('useStore must be used within StoreProvider')
    return ctx
}
