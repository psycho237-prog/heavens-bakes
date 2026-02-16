import jsPDF from 'jspdf'
import { getRandomProverb } from '../data/proverbs'

export function generateInvoicePDF(invoice) {
    const doc = new jsPDF({ unit: 'mm', format: 'a5' })
    const W = doc.internal.pageSize.getWidth()
    const margin = 14
    let y = 16

    // Header
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(16)
    doc.setTextColor(61, 44, 94)
    doc.text("HEAVEN'S BAKES & SIPS", W / 2, y, { align: 'center' })
    y += 6

    doc.setFont('helvetica', 'italic')
    doc.setFontSize(8)
    doc.setTextColor(139, 123, 168)
    doc.text('Un nuage de douceur, une vague de fraîcheur.', W / 2, y, { align: 'center' })
    y += 10

    // Divider
    doc.setDrawColor(232, 223, 245)
    doc.setLineWidth(0.5)
    doc.line(margin, y, W - margin, y)
    y += 8

    // Invoice info
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(13)
    doc.setTextColor(61, 44, 94)
    doc.text(`Facture #${String(invoice.number).padStart(4, '0')}`, W / 2, y, { align: 'center' })
    y += 8

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.setTextColor(100, 100, 100)

    const dateStr = new Date(invoice.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
    doc.text(invoice.clientName, margin, y)
    doc.text(dateStr, W - margin, y, { align: 'right' })
    y += 10

    // Divider
    doc.setDrawColor(232, 223, 245)
    doc.line(margin, y, W - margin, y)
    y += 6

    // Items
    invoice.items.forEach(item => {
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(9)
        doc.setTextColor(61, 44, 94)

        const label = item.qty > 1 ? `${item.name} (x${item.qty})` : item.name
        doc.text(label, margin, y)
        doc.text(`${item.total.toLocaleString()} FCFA`, W - margin, y, { align: 'right' })
        y += 6
    })

    y += 4
    doc.setDrawColor(232, 223, 245)
    doc.line(margin, y, W - margin, y)
    y += 8

    // Total
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(12)
    doc.setTextColor(155, 126, 200)
    doc.text('Total', margin, y)
    doc.text(`${invoice.total.toLocaleString()} FCFA`, W - margin, y, { align: 'right' })
    y += 14

    // Proverb
    doc.setFont('helvetica', 'italic')
    doc.setFontSize(7.5)
    doc.setTextColor(139, 123, 168)
    const proverb = invoice.proverb || getRandomProverb()
    const lines = doc.splitTextToSize(proverb, W - margin * 2)
    doc.text(lines, W / 2, y, { align: 'center' })

    // Return blob if requested, otherwise save
    if (invoice.returnBlob) {
        return doc.output('blob')
    }
    doc.save(`Facture-${String(invoice.number).padStart(4, '0')}.pdf`)
}
