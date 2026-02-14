export function shareWhatsApp(invoice) {
    const items = invoice.items.map(i => `  • ${i.name} x${i.qty} — ${i.total.toLocaleString()} FCFA`).join('\n')
    const text = `🕊️ *Heaven's Bakes & Sips*\n_Un nuage de douceur, une vague de fraîcheur._\n\n📄 *Facture #${String(invoice.number).padStart(4, '0')}*\nClient: ${invoice.clientName}\nDate: ${new Date(invoice.date).toLocaleDateString('fr-FR')}\n\n${items}\n\n💰 *Total: ${invoice.total.toLocaleString()} FCFA*\n\nMerci pour votre fidélité ! 💜`

    const url = `https://wa.me/?text=${encodeURIComponent(text)}`
    window.open(url, '_blank')
}

export function formatCurrency(amount) {
    return amount.toLocaleString('fr-FR')
}

export function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    })
}

export function formatDateShort(dateStr) {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    })
}
