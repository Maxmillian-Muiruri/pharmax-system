import { useState } from 'react'
import { FileText, FileDown, TrendingUp, PackageSearch, ShieldAlert } from 'lucide-react'
import PageWrapper from '../components/layout/PageWrapper'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import { useToast } from '../context/ToastContext'
import { reportsApi } from '../services/api'
import { downloadCSV, downloadPDF } from '../utils/reportGenerators'

export default function Reports() {
  const toast = useToast()
  const [loading, setLoading] = useState({})

  const availableReports = [
    {
      id: 'inventory',
      title: 'Inventory Valuation Report',
      icon: <PackageSearch size={24} className="text-teal-600" />,
      description: 'Comprehensive report detailing all active products, stock quantities, unit prices, and total calculated asset value.',
      apiFunction: reportsApi.getInventory,
      filename: 'pharma_inventory_valuation'
    },
    {
      id: 'expiry',
      title: 'Expiry Risk & Procurement',
      icon: <ShieldAlert size={24} className="text-orange-500" />,
      description: 'Critical analysis flagging products that are near their expiration dates. Vital for minimizing waste and ensuring regulatory compliance.',
      apiFunction: reportsApi.getExpiry,
      filename: 'pharma_expiry_risk_report'
    },
    {
      id: 'sales',
      title: 'Sales & Revenue History',
      icon: <TrendingUp size={24} className="text-blue-500" />,
      description: 'Complete log of every tracked sale order. Ideal for quarterly reviews, auditing transactions, and mapping customer volume.',
      apiFunction: reportsApi.getSales,
      filename: 'pharma_sales_history'
    }
  ]

  const handleDownload = async (report, format) => {
    try {
      // Mark specific button as loading
      setLoading(prev => ({ ...prev, [`${report.id}-${format}`]: true }))
      
      const payload = await report.apiFunction()
      const data = payload.data || payload // Handle standardized backend response

      if (!data || data.length === 0) {
        toast.error(`No data available to generate the ${report.title}`)
        return
      }

      const exactFilename = `${report.filename}_${new Date().toISOString().split('T')[0]}.${format}`

      if (format === 'csv') {
        downloadCSV(report.title, data, exactFilename)
      } else {
        downloadPDF(report.title, data, exactFilename)
      }

      toast.success(`${format.toUpperCase()} generated successfully!`)
    } catch (err) {
      console.error('Report Generation Error:', err)
      toast.error('Failed to generate report. Please try again.')
    } finally {
      setLoading(prev => ({ ...prev, [`${report.id}-${format}`]: false }))
    }
  }

  return (
    <PageWrapper title="Analytics & Reports">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900">Standard Reports</h2>
          <p className="text-gray-500 text-sm mt-1">
            Generate and securely download automated business analytics straight to your local device.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {availableReports.map((report) => (
            <Card key={report.id} className="flex flex-col h-full hover:shadow-lg transition-shadow border border-gray-100">
              <div className="p-6 flex-1">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-gray-50 rounded-xl shadow-sm">
                    {report.icon}
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 leading-tight">
                    {report.title}
                  </h3>
                </div>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {report.description}
                </p>
              </div>
              
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 rounded-b-xl flex gap-3 mt-auto">
                <Button 
                  className="flex-1 shadow-sm"
                  variant="primary"
                  onClick={() => handleDownload(report, 'pdf')}
                  loading={loading[`${report.id}-pdf`]}
                  disabled={loading[`${report.id}-csv`]}
                >
                  <FileText size={16} className="mr-2" />
                  PDF
                </Button>
                <Button 
                  className="flex-1 bg-teal-50 text-teal-700 hover:bg-teal-100 border-teal-200"
                  onClick={() => handleDownload(report, 'csv')}
                  loading={loading[`${report.id}-csv`]}
                  disabled={loading[`${report.id}-pdf`]}
                >
                  <FileDown size={16} className="mr-2" />
                  CSV
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </PageWrapper>
  )
}
