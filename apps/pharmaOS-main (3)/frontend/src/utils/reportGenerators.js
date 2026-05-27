import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

/**
 * Downloads a raw CSV string as a file.
 * Automatically extracts headers based on first object keys.
 */
export const downloadCSV = (title, data, filename) => {
  if (!data || data.length === 0) {
    alert("No data available to export.")
    return
  }

  // Extract explicit headers based on actual keys in first payload object
  const headers = Object.keys(data[0])
  
  // Format to standard CSV format 
  const csvRows = [
    headers.join(','),
    ...data.map(row => headers.map(header => {
      // Escape commas in strings wrapping them in quotes
      const val = row[header]
      if (typeof val === 'string' && val.includes(',')) {
        return `"${val}"`
      }
      return val ?? ''
    }).join(','))
  ]

  const csvString = csvRows.join('\n')
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' })
  
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.setAttribute('download', filename)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

/**
 * Generates and downloads a highly customized PDF containing standard tabular reports
 */
export const downloadPDF = (title, data, filename) => {
  if (!data || data.length === 0) {
    alert("No data available to export.")
    return
  }

  // Initialize jsPDF specifically natively scaling to the landscape (l) format for tables
  const doc = new jsPDF('l', 'pt', 'a4')

  // Inject Title Header
  doc.setFontSize(18)
  doc.text(title, 40, 40)
  
  // Inject metadata
  doc.setFontSize(10)
  doc.setTextColor(100)
  doc.text(`Generated on: ${new Date().toLocaleString()}`, 40, 55)

  const headers = Object.keys(data[0]).map(h => {
    // Capitalize and format keys like "unitPrice" to "Unit Price" cleanly
    return h.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())
  })
  
  const bodyData = data.map(row => Object.values(row).map(val => val ?? ''))

  autoTable(doc, {
    startY: 70,
    head: [headers],
    body: bodyData,
    theme: 'grid',
    styles: { fontSize: 9, cellPadding: 4 },
    headStyles: { fillColor: [13, 148, 136], textColor: [255, 255, 255] }, // Teal-600
    alternateRowStyles: { fillColor: [249, 250, 251] }, // Gray-50
    margin: { top: 70 }
  })

  // Start actual direct browser download
  doc.save(filename)
}
