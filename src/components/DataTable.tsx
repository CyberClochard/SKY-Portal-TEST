import React, { useState, useEffect } from 'react'
import { Search, Filter, Download, RefreshCw, Eye, Edit, Trash2, Plus, ChevronLeft, ChevronRight, FileText, AlertCircle } from 'lucide-react'
import { supabase } from '../lib/supabase'
import CasePage from './CasePage'

interface MasterRecord {
  [key: string]: any
}

const DataTable: React.FC = () => {
  const [data, setData] = useState<MasterRecord[]>([])
  const [filteredData, setFilteredData] = useState<MasterRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortField, setSortField] = useState<string>('DATE')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set())
  const [showCasePage, setShowCasePage] = useState<string | null>(null)
  const [tableColumns, setTableColumns] = useState<string[]>([])

  // Load data from Supabase MASTER table
  useEffect(() => {
    loadMasterData()
  }, [])

  const loadMasterData = async () => {
    try {
      setLoading(true)
      setError(null)

      console.log('Loading data from MASTER table...')
      
      const { data: masterData, error: masterError } = await supabase
        .from('MASTER')
        .select('*')
        .order('DATE', { ascending: false })

      if (masterError) {
        console.error('Error loading MASTER data:', masterError)
        setError(`Erreur lors du chargement des données: ${masterError.message}`)
        return
      }

      console.log('MASTER data loaded:', masterData?.length || 0, 'records')
      
      if (masterData && masterData.length > 0) {
        // Get column names from the first record
        const columns = Object.keys(masterData[0]).filter(key => key !== 'id')
        setTableColumns(columns)
        
        setData(masterData)
        setFilteredData(masterData)
      } else {
        setData([])
        setFilteredData([])
        setError('Aucune donnée trouvée dans la table MASTER')
      }

    } catch (err) {
      console.error('Failed to load MASTER data:', err)
      setError('Erreur de connexion à la base de données')
    } finally {
      setLoading(false)
    }
  }

  // Search and filter
  useEffect(() => {
    let filtered = data.filter(record =>
      Object.values(record).some(value => {
        if (value === null || value === undefined) return false
        return value.toString().toLowerCase().includes(searchTerm.toLowerCase())
      })
    )

    // Sort
    if (sortField && filtered.length > 0) {
      filtered.sort((a, b) => {
        const aValue = a[sortField]
        const bValue = b[sortField]
        
        // Handle null/undefined values
        if (aValue === null || aValue === undefined) return 1
        if (bValue === null || bValue === undefined) return -1
        
        if (sortDirection === 'asc') {
          return aValue > bValue ? 1 : -1
        } else {
          return aValue < bValue ? 1 : -1
        }
      })
    }

    setFilteredData(filtered)
    setCurrentPage(1)
  }, [data, searchTerm, sortField, sortDirection])

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const handleRowSelect = (id: string) => {
    const newSelected = new Set(selectedRows)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedRows(newSelected)
  }

  const handleSelectAll = () => {
    if (selectedRows.size === currentPageData.length) {
      setSelectedRows(new Set())
    } else {
      setSelectedRows(new Set(currentPageData.map(record => record.id || record.DOSSIER)))
    }
  }

  const handleViewCase = (dossier: string) => {
    setShowCasePage(dossier)
  }

  const handleBackFromCase = () => {
    setShowCasePage(null)
  }

  const exportToCSV = () => {
    if (tableColumns.length === 0) return

    const headers = tableColumns
    const csvContent = [
      headers.join(','),
      ...filteredData.map(record => 
        headers.map(header => {
          const value = record[header]
          return `"${value || ''}"`
        }).join(',')
      )
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `operations_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const formatCellValue = (value: any, columnName: string) => {
    if (value === null || value === undefined) return '-'
    
    // Handle text date fields (DATE and DATE2) - display as-is since they're text
    if ((columnName === 'DATE' || columnName === 'DATE2') && typeof value === 'string') {
      return value // Display the text date as stored
    }
    
    // Format currency
    if (columnName.toLowerCase().includes('payable') || columnName.toLowerCase().includes('amount')) {
      if (typeof value === 'number') {
        return new Intl.NumberFormat('fr-FR', {
          style: 'currency',
          currency: 'EUR'
        }).format(value)
      }
    }
    
    return value.toString()
  }

  // Pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentPageData = filteredData.slice(startIndex, endIndex)

  // If showing case page, render it instead
  if (showCasePage) {
    return <CasePage dossier={showCasePage} onBack={handleBackFromCase} />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Opérations</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Gestion des dossiers et opérations logistiques - Table MASTER
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={exportToCSV}
            disabled={filteredData.length === 0}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Exporter</span>
          </button>
          <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
            <Plus className="w-4 h-4" />
            <span>Nouveau dossier</span>
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-4">
          <div className="flex items-center space-x-2 text-red-600 dark:text-red-400">
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Filters and Search */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Rechercher dans les opérations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-80 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button className="flex items-center space-x-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors">
              <Filter className="w-4 h-4" />
              <span>Filtres</span>
            </button>
          </div>
          
          <div className="flex items-center space-x-3">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {filteredData.length} résultat{filteredData.length > 1 ? 's' : ''}
            </span>
            {selectedRows.size > 0 && (
              <span className="text-sm text-blue-600 dark:text-blue-400">
                {selectedRows.size} sélectionné{selectedRows.size > 1 ? 's' : ''}
              </span>
            )}
            <button
              onClick={loadMasterData}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              title="Actualiser"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <RefreshCw className="w-8 h-8 text-gray-400 animate-spin mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">Chargement des données MASTER...</p>
            </div>
          </div>
        ) : filteredData.length === 0 ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <FileText className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Aucune donnée</h3>
              <p className="text-gray-600 dark:text-gray-400">
                {error ? 'Erreur de chargement des données' : 'Aucun enregistrement trouvé dans la table MASTER'}
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <div className="relative">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-900">
                    <tr>
                      <th className="sticky left-0 z-20 px-6 py-3 text-left bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700">
                        <input
                          type="checkbox"
                          checked={selectedRows.size === currentPageData.length && currentPageData.length > 0}
                          onChange={handleSelectAll}
                          className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                        />
                      </th>
                      {tableColumns.map((column) => (
                        <th
                          key={column}
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors whitespace-nowrap"
                          onClick={() => handleSort(column)}
                        >
                          <div className="flex items-center space-x-1">
                            <span>{column}</span>
                            {sortField === column && (
                              <span className="text-blue-500">
                                {sortDirection === 'asc' ? '↑' : '↓'}
                              </span>
                            )}
                          </div>
                        </th>
                      ))}
                      <th className="sticky right-0 z-20 px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider bg-gray-50 dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700 shadow-lg">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {currentPageData.map((record, index) => {
                      const recordId = record.id || record.DOSSIER || index.toString()
                      const dossier = record.DOSSIER || `Record-${index + 1}`
                      
                      return (
                        <tr
                          key={recordId}
                          className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                          <td className="sticky left-0 z-10 px-6 py-4 whitespace-nowrap bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
                            <input
                              type="checkbox"
                              checked={selectedRows.has(recordId)}
                              onChange={() => handleRowSelect(recordId)}
                              className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                            />
                          </td>
                          {tableColumns.map((column) => (
                            <td key={column} className="px-6 py-4 whitespace-nowrap">
                              <div className={`text-sm ${
                                column === 'DOSSIER' ? 'font-medium text-gray-900 dark:text-white' :
                                column === 'DATE' || column === 'DATE2' ? 'text-gray-900 dark:text-white font-mono' :
                                column.toLowerCase().includes('payable') ? 'font-medium text-gray-900 dark:text-white' :
                                column === 'DEPART' || column === 'ARRIVEE' ? 'font-mono text-gray-900 dark:text-white' :
                                'text-gray-900 dark:text-white'
                              }`}>
                                {formatCellValue(record[column], column)}
                              </div>
                            </td>
                          ))}
                          <td className="sticky right-0 z-10 px-6 py-4 whitespace-nowrap text-sm font-medium bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 shadow-lg">
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => handleViewCase(dossier)}
                                className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 transition-colors p-1 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20"
                                title="Voir le dossier"
                              >
                                <FileText className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleViewCase(dossier)}
                                className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 transition-colors p-1 rounded hover:bg-green-50 dark:hover:bg-green-900/20"
                                title="Voir les détails"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300 transition-colors p-1 rounded hover:bg-gray-50 dark:hover:bg-gray-900/20"
                                title="Modifier"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 transition-colors p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20"
                                title="Supprimer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="bg-white dark:bg-gray-800 px-6 py-3 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-700 dark:text-gray-300">
                    Affichage de {startIndex + 1} à {Math.min(endIndex, filteredData.length)} sur {filteredData.length} résultats
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    
                    <div className="flex items-center space-x-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        const pageNum = i + 1
                        return (
                          <button
                            key={pageNum}
                            onClick={() => setCurrentPage(pageNum)}
                            className={`px-3 py-1 text-sm rounded transition-colors ${
                              currentPage === pageNum
                                ? 'bg-blue-600 text-white'
                                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                            }`}
                          >
                            {pageNum}
                          </button>
                        )
                      })}
                    </div>
                    
                    <button
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Bulk Actions */}
      {selectedRows.size > 0 && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {selectedRows.size} élément{selectedRows.size > 1 ? 's' : ''} sélectionné{selectedRows.size > 1 ? 's' : ''}
            </span>
            <div className="flex items-center space-x-2">
              <button className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition-colors">
                Exporter sélection
              </button>
              <button className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm transition-colors">
                Supprimer
              </button>
              <button
                onClick={() => setSelectedRows(new Set())}
                className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded text-sm transition-colors"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default DataTable