import React, { useState, useEffect, useCallback, useRef } from 'react'
import { Search, RefreshCw, Filter, Download, ChevronLeft, ChevronRight, Eye, EyeOff, X, Save, Edit3, Check, AlertCircle, Plus, Minus, Trash2 } from 'lucide-react'
import { supabase, MasterRecord } from '../lib/supabase'

const DataTable: React.FC = () => {
  const [data, setData] = useState<MasterRecord[]>([])
  const [columns, setColumns] = useState<string[]>([])
  const [visibleColumns, setVisibleColumns] = useState<string[]>([])
  const [showColumnFilter, setShowColumnFilter] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [activeSearchTerm, setActiveSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(20)
  const [sortField, setSortField] = useState<string>('DOSSIER')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')
  
  // États pour l'édition
  const [editingCell, setEditingCell] = useState<{rowIndex: number, column: string} | null>(null)
  const [editValue, setEditValue] = useState<string>('')
  const [savingCells, setSavingCells] = useState<Set<string>>(new Set())
  const [saveErrors, setSaveErrors] = useState<Map<string, string>>(new Map())
  const [saveSuccess, setSaveSuccess] = useState<Set<string>>(new Set())
  
  // États pour l'ajout de nouvelles lignes
  const [showAddForm, setShowAddForm] = useState(false)
  const [newRecord, setNewRecord] = useState<Record<string, string>>({})
  const [addingRecord, setAddingRecord] = useState(false)
  const [addError, setAddError] = useState<string | null>(null)
  
  // États pour la confirmation d'édition du DOSSIER
  const [showDossierConfirm, setShowDossierConfirm] = useState(false)
  const [dossierEditData, setDossierEditData] = useState<{rowIndex: number, oldValue: string, newValue: string} | null>(null)
  
  // États pour la suppression
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteData, setDeleteData] = useState<{rowIndex: number, record: MasterRecord} | null>(null)
  const [deletingRecord, setDeletingRecord] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  
  // Référence pour maintenir le focus sur le champ de recherche
  const searchInputRef = useRef<HTMLInputElement>(null)
  const columnsInitialized = useRef(false)
  const columnFilterRef = useRef<HTMLDivElement>(null)
  const editInputRef = useRef<HTMLInputElement>(null)
  const addFormRef = useRef<HTMLDivElement>(null)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Check if Supabase is properly configured
      if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
        throw new Error('Configuration Supabase manquante. Vérifiez vos variables d\'environnement.')
      }
      
      let query = supabase
        .from('MASTER')
        .select('*')
        .order(sortField, { ascending: sortDirection === 'asc' })
      
      if (activeSearchTerm && columns.length > 0) {
        // Construire la recherche dynamiquement sur toutes les colonnes
        const searchConditions = columns.map(col => `${col}.ilike.%${activeSearchTerm}%`).join(',')
        if (searchConditions) {
          query = query.or(searchConditions)
        }
      }

      const { data: records, error } = await query
      
      if (error) throw error
      
      setData(records || [])
      
      // Extraire les colonnes dynamiquement du premier enregistrement (seulement la première fois)
      if (records && records.length > 0 && !columnsInitialized.current) {
        const dynamicColumns = Object.keys(records[0]).filter(key => 
          records[0][key] !== null && records[0][key] !== undefined
        )
        setColumns(dynamicColumns)
        setVisibleColumns(dynamicColumns) // Par défaut, toutes les colonnes sont visibles
        columnsInitialized.current = true
        
        // Définir le tri par défaut sur DOSSIER (décroissant pour avoir les plus récents en premier)
        if (dynamicColumns.includes('DOSSIER')) {
          setSortField('DOSSIER')
          setSortDirection('desc')
        } else if (dynamicColumns.includes('DATE')) {
          setSortField('DATE')
          setSortDirection('desc')
        } else if (dynamicColumns.length > 0) {
          setSortField(dynamicColumns[0])
          setSortDirection('desc')
        }
      }
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du chargement des données'
      setError(errorMessage)
      console.error('Erreur Supabase:', err)
    } finally {
      setLoading(false)
    }
  }, [activeSearchTerm, sortField, sortDirection, columns.length])

  // Effet initial pour charger les données
  useEffect(() => {
    fetchData()
  }, [])

  // Effet pour recharger les données quand les paramètres de recherche/tri changent
  useEffect(() => {
    if (columnsInitialized.current) {
      fetchData()
    }
  }, [activeSearchTerm, sortField, sortDirection])

  // Fermer le filtre de colonnes quand on clique à l'extérieur
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (columnFilterRef.current && !columnFilterRef.current.contains(event.target as Node)) {
        setShowColumnFilter(false)
      }
      if (addFormRef.current && !addFormRef.current.contains(event.target as Node)) {
        // Ne fermer le formulaire que si on clique vraiment à l'extérieur
        const target = event.target as Element
        if (!target.closest('.add-form-container')) {
          setShowAddForm(false)
          setNewRecord({})
          setAddError(null)
        }
      }
    }

    if (showColumnFilter || showAddForm) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showColumnFilter, showAddForm])

  // Focus sur l'input d'édition quand une cellule est en cours d'édition
  useEffect(() => {
    if (editingCell && editInputRef.current) {
      editInputRef.current.focus()
      editInputRef.current.select()
    }
  }, [editingCell])

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      // Pour DOSSIER, commencer par décroissant (plus récents en premier)
      setSortDirection(field === 'DOSSIER' ? 'desc' : 'asc')
    }
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }

  const handleSearchSubmit = () => {
    setActiveSearchTerm(searchTerm)
    setCurrentPage(1)
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearchSubmit()
    }
  }

  const handleRefresh = () => {
    columnsInitialized.current = false
    setColumns([])
    setVisibleColumns([])
    setData([])
    setEditingCell(null)
    setSavingCells(new Set())
    setSaveErrors(new Map())
    setSaveSuccess(new Set())
    setShowAddForm(false)
    setNewRecord({})
    setAddError(null)
    setShowDossierConfirm(false)
    setDossierEditData(null)
    setShowDeleteConfirm(false)
    setDeleteData(null)
    setDeleteError(null)
    fetchData()
  }

  const toggleColumnVisibility = (columnName: string) => {
    setVisibleColumns(prev => {
      if (prev.includes(columnName)) {
        // Ne pas permettre de masquer toutes les colonnes
        if (prev.length === 1) return prev
        return prev.filter(col => col !== columnName)
      } else {
        return [...prev, columnName]
      }
    })
  }

  const showAllColumns = () => {
    setVisibleColumns([...columns])
  }

  const hideAllColumns = () => {
    // Garder au moins une colonne visible
    if (columns.length > 0) {
      setVisibleColumns([columns[0]])
    }
  }

  const resetColumnVisibility = () => {
    setVisibleColumns([...columns])
  }

  // Fonction pour générer le prochain numéro de dossier
  const generateNextDossierNumber = () => {
    if (data.length === 0) {
      const year = new Date().getFullYear().toString().slice(-2)
      return `AE${year}/0001`
    }

    // Trouver le dernier numéro de dossier
    const dossierNumbers = data
      .map(record => record.DOSSIER)
      .filter(dossier => dossier && typeof dossier === 'string' && dossier.match(/^AE\d{2}\/\d{4}$/))
      .sort()

    if (dossierNumbers.length === 0) {
      const year = new Date().getFullYear().toString().slice(-2)
      return `AE${year}/0001`
    }

    const lastDossier = dossierNumbers[dossierNumbers.length - 1]
    const match = lastDossier.match(/^AE(\d{2})\/(\d{4})$/)
    
    if (match) {
      const year = match[1]
      const number = parseInt(match[2])
      const nextNumber = (number + 1).toString().padStart(4, '0')
      return `AE${year}/${nextNumber}`
    }

    // Fallback
    const year = new Date().getFullYear().toString().slice(-2)
    return `AE${year}/0001`
  }

  // Fonctions pour l'ajout de nouvelles lignes
  const openAddForm = () => {
    setShowAddForm(true)
    setNewRecord({})
    setAddError(null)
    
    // Initialiser le nouveau record avec des valeurs par défaut pour les champs requis
    const defaultRecord: Record<string, string> = {
      'DATE': new Date().toISOString().split('T')[0],
      'DOSSIER': generateNextDossierNumber(),
      'LTA': '',
      'CLIENT': '',
      'DEPART': '',
      'ARRIVEE': '',
      'NOM': ''
    }
    
    setNewRecord(defaultRecord)
  }

  const closeAddForm = () => {
    setShowAddForm(false)
    setNewRecord({})
    setAddError(null)
  }

  const handleNewRecordChange = (column: string, value: string) => {
    setNewRecord(prev => ({
      ...prev,
      [column]: value
    }))
  }

  const validateNewRecord = () => {
    // Vérifier que DOSSIER est rempli
    if (!newRecord.DOSSIER || newRecord.DOSSIER.trim() === '') {
      return 'Le numéro de dossier est obligatoire'
    }

    // Vérifier que le dossier n'existe pas déjà
    if (data.some(record => record.DOSSIER === newRecord.DOSSIER.trim())) {
      return 'Ce numéro de dossier existe déjà'
    }

    return null
  }

  const saveNewRecord = async () => {
    const validationError = validateNewRecord()
    if (validationError) {
      setAddError(validationError)
      return
    }

    setAddingRecord(true)
    setAddError(null)

    try {
      // Préparer les données à insérer
      const recordToInsert: Record<string, any> = {}
      
      // Ajouter seulement les champs du formulaire
      const formFields = ['DATE', 'DOSSIER', 'LTA', 'CLIENT', 'DEPART', 'ARRIVEE', 'NOM']
      formFields.forEach(field => {
        const value = newRecord[field]?.trim()
        recordToInsert[field] = value || null
      })

      // Insérer dans Supabase
      const { data: insertedData, error } = await supabase
        .from('MASTER')
        .insert([recordToInsert])
        .select()

      if (error) throw error

      // Ajouter aux données locales
      if (insertedData && insertedData.length > 0) {
        setData(prevData => [insertedData[0], ...prevData])
      }

      // Fermer le formulaire
      closeAddForm()

      // Afficher un message de succès temporaire
      const successKey = 'new-record-success'
      setSaveSuccess(prev => new Set(prev.add(successKey)))
      setTimeout(() => {
        setSaveSuccess(prev => {
          const newSet = new Set(prev)
          newSet.delete(successKey)
          return newSet
        })
      }, 3000)

    } catch (err) {
      console.error('Erreur lors de l\'ajout:', err)
      setAddError(err instanceof Error ? err.message : 'Erreur lors de l\'ajout du record')
    } finally {
      setAddingRecord(false)
    }
  }

  const handleAddFormKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      saveNewRecord()
    } else if (e.key === 'Escape') {
      closeAddForm()
    }
  }

  // Fonctions d'édition
  const startEditing = (rowIndex: number, column: string, currentValue: any) => {
    if (column === 'DOSSIER') {
      // Pour DOSSIER, demander confirmation
      setDossierEditData({
        rowIndex,
        oldValue: currentValue?.toString() || '',
        newValue: currentValue?.toString() || ''
      })
      setShowDossierConfirm(true)
      return
    }
    
    setEditingCell({ rowIndex, column })
    setEditValue(currentValue?.toString() || '')
  }

  const cancelEditing = () => {
    setEditingCell(null)
    setEditValue('')
  }

  const confirmDossierEdit = () => {
    if (dossierEditData) {
      setEditingCell({ rowIndex: dossierEditData.rowIndex, column: 'DOSSIER' })
      setEditValue(dossierEditData.oldValue)
      setShowDossierConfirm(false)
      setDossierEditData(null)
    }
  }

  const cancelDossierEdit = () => {
    setShowDossierConfirm(false)
    setDossierEditData(null)
  }

  const saveEdit = async (rowIndex: number, column: string) => {
    const record = currentData[rowIndex]
    if (!record || !record.DOSSIER) {
      setSaveErrors(prev => new Map(prev.set(`${rowIndex}-${column}`, 'Impossible de sauvegarder: DOSSIER manquant')))
      return
    }

    const cellKey = `${rowIndex}-${column}`
    setSavingCells(prev => new Set(prev.add(cellKey)))
    setSaveErrors(prev => {
      const newMap = new Map(prev)
      newMap.delete(cellKey)
      return newMap
    })

    try {
      // Mettre à jour dans Supabase en utilisant DOSSIER comme clé
      const { error } = await supabase
        .from('MASTER')
        .update({ [column]: editValue || null })
        .eq('DOSSIER', record.DOSSIER)

      if (error) throw error

      // Mettre à jour les données locales
      setData(prevData => 
        prevData.map(item => 
          item.DOSSIER === record.DOSSIER 
            ? { ...item, [column]: editValue || null }
            : item
        )
      )

      // Marquer comme succès
      setSaveSuccess(prev => new Set(prev.add(cellKey)))
      setTimeout(() => {
        setSaveSuccess(prev => {
          const newSet = new Set(prev)
          newSet.delete(cellKey)
          return newSet
        })
      }, 2000)

      setEditingCell(null)
      setEditValue('')

    } catch (err) {
      console.error('Erreur lors de la sauvegarde:', err)
      setSaveErrors(prev => new Map(prev.set(cellKey, err instanceof Error ? err.message : 'Erreur de sauvegarde')))
    } finally {
      setSavingCells(prev => {
        const newSet = new Set(prev)
        newSet.delete(cellKey)
        return newSet
      })
    }
  }

  const handleEditKeyPress = (e: React.KeyboardEvent<HTMLInputElement>, rowIndex: number, column: string) => {
    if (e.key === 'Enter') {
      saveEdit(rowIndex, column)
    } else if (e.key === 'Escape') {
      cancelEditing()
    }
  }

  // Fonctions de suppression
  const openDeleteConfirm = (rowIndex: number, record: MasterRecord) => {
    setDeleteData({ rowIndex, record })
    setShowDeleteConfirm(true)
    setDeleteError(null)
  }

  const closeDeleteConfirm = () => {
    setShowDeleteConfirm(false)
    setDeleteData(null)
    setDeleteError(null)
  }

  const confirmDelete = async () => {
    if (!deleteData || !deleteData.record.DOSSIER) {
      setDeleteError('Impossible de supprimer: DOSSIER manquant')
      return
    }

    setDeletingRecord(true)
    setDeleteError(null)

    try {
      // Supprimer de Supabase en utilisant DOSSIER comme clé
      const { error } = await supabase
        .from('MASTER')
        .delete()
        .eq('DOSSIER', deleteData.record.DOSSIER)

      if (error) throw error

      // Supprimer des données locales
      setData(prevData => 
        prevData.filter(item => item.DOSSIER !== deleteData.record.DOSSIER)
      )

      // Fermer la modal
      closeDeleteConfirm()

      // Afficher un message de succès temporaire
      const successKey = 'delete-record-success'
      setSaveSuccess(prev => new Set(prev.add(successKey)))
      setTimeout(() => {
        setSaveSuccess(prev => {
          const newSet = new Set(prev)
          newSet.delete(successKey)
          return newSet
        })
      }, 3000)

    } catch (err) {
      console.error('Erreur lors de la suppression:', err)
      setDeleteError(err instanceof Error ? err.message : 'Erreur lors de la suppression')
    } finally {
      setDeletingRecord(false)
    }
  }

  const totalPages = Math.ceil(data.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentData = data.slice(startIndex, endIndex)

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString || dateString.trim() === '') return '-'
    
    const cleanDateString = dateString.trim()
    
    try {
      let date: Date | null = null
      
      // Format ISO standard (YYYY-MM-DD ou YYYY-MM-DDTHH:mm:ss)
      if (/^\d{4}-\d{2}-\d{2}/.test(cleanDateString)) {
        date = new Date(cleanDateString)
      }
      // Format français DD/MM/YYYY
      else if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(cleanDateString)) {
        const [day, month, year] = cleanDateString.split('/')
        date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
      }
      // Format DD-MM-YYYY
      else if (/^\d{1,2}-\d{1,2}-\d{4}$/.test(cleanDateString)) {
        const [day, month, year] = cleanDateString.split('-')
        date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
      }
      // Format MM/DD/YYYY (américain)
      else if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(cleanDateString)) {
        const parts = cleanDateString.split('/')
        const day = parseInt(parts[0])
        const month = parseInt(parts[1])
        
        if (day > 12) {
          date = new Date(parseInt(parts[2]), month - 1, day)
        } else {
          date = new Date(parseInt(parts[2]), day - 1, month)
        }
      }
      // Format YYYY/MM/DD
      else if (/^\d{4}\/\d{1,2}\/\d{1,2}$/.test(cleanDateString)) {
        const [year, month, day] = cleanDateString.split('/')
        date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
      }
      // Format DD.MM.YYYY
      else if (/^\d{1,2}\.\d{1,2}\.\d{4}$/.test(cleanDateString)) {
        const [day, month, year] = cleanDateString.split('.')
        date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
      }
      // Timestamp numérique
      else if (/^\d+$/.test(cleanDateString)) {
        const timestamp = parseInt(cleanDateString)
        date = new Date(timestamp < 10000000000 ? timestamp * 1000 : timestamp)
      }
      // Formats texte en anglais
      else if (/^[A-Za-z]{3,9}\s+\d{1,2},?\s+\d{4}$/.test(cleanDateString)) {
        date = new Date(cleanDateString)
      }
      // Autres formats
      else {
        date = new Date(cleanDateString)
      }
      
      if (!date || isNaN(date.getTime())) {
        return cleanDateString
      }
      
      return date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      })
      
    } catch (error) {
      return cleanDateString
    }
  }

  const formatCellValue = (value: any, columnName: string) => {
    if (value === null || value === undefined) return '-'
    
    if (columnName.toUpperCase().includes('DATE') && typeof value === 'string') {
      return formatDate(value)
    }
    
    return String(value)
  }

  const formatColumnName = (columnName: string) => {
    return columnName
      .replace(/_/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ')
  }

  const getCellKey = (rowIndex: number, column: string) => {
    return `${rowIndex}-${column}`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
          <RefreshCw className="w-6 h-6 animate-spin" />
          <span>Chargement des données...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-4">
        <div className="flex items-center space-x-2 text-red-600 dark:text-red-400">
          <AlertCircle className="w-5 h-5" />
          <span>Erreur: {error}</span>
        </div>
        <button
          onClick={handleRefresh}
          className="mt-3 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
        >
          Réessayer
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Message de succès pour nouveau record */}
      {saveSuccess.has('new-record-success') && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-4">
          <div className="flex items-center space-x-2 text-green-600 dark:text-green-400">
            <Check className="w-5 h-5" />
            <span>Nouveau record ajouté avec succès!</span>
          </div>
        </div>
      )}

      {/* Message de succès pour suppression */}
      {saveSuccess.has('delete-record-success') && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-4">
          <div className="flex items-center space-x-2 text-green-600 dark:text-green-400">
            <Check className="w-5 h-5" />
            <span>Record supprimé avec succès!</span>
          </div>
        </div>
      )}

      {/* En-tête avec statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 shadow-sm">
          <h3 className="text-gray-600 dark:text-gray-400 text-sm font-medium">Total Enregistrements</h3>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{data.length}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 shadow-sm">
          <h3 className="text-gray-600 dark:text-gray-400 text-sm font-medium">Colonnes Visibles</h3>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{visibleColumns.length}/{columns.length}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 shadow-sm">
          <h3 className="text-gray-600 dark:text-gray-400 text-sm font-medium">Colonnes Modifiables</h3>
          <p className="text-2xl font-bold text-green-500 mt-1">{columns.length}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 shadow-sm">
          <h3 className="text-gray-600 dark:text-gray-400 text-sm font-medium">Statut</h3>
          <p className="text-2xl font-bold text-green-500 mt-1">En ligne</p>
        </div>
      </div>

      {/* Barre d'outils */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Rechercher dans toutes les colonnes... (Appuyez sur Entrée)"
              value={searchTerm}
              onChange={handleSearchChange}
              onKeyPress={handleKeyPress}
              className="pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-80"
            />
          </div>
          <button
            onClick={handleRefresh}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Actualiser</span>
          </button>
          <button
            onClick={openAddForm}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Nouveau</span>
          </button>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="relative" ref={columnFilterRef}>
            <button
              onClick={() => setShowColumnFilter(!showColumnFilter)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors border ${
                showColumnFilter
                  ? 'bg-blue-600 text-white border-blue-500'
                  : 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-700'
              }`}
            >
              <Eye className="w-4 h-4" />
              <span>Colonnes</span>
              {visibleColumns.length < columns.length && (
                <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded-full">
                  {visibleColumns.length}/{columns.length}
                </span>
              )}
            </button>

            {/* Menu déroulant pour les colonnes */}
            {showColumnFilter && (
              <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-50 max-h-96 overflow-y-auto">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-gray-900 dark:text-white font-medium">Visibilité des colonnes</h3>
                    <button
                      onClick={() => setShowColumnFilter(false)}
                      className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={showAllColumns}
                      className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm rounded transition-colors"
                    >
                      Tout afficher
                    </button>
                    <button
                      onClick={hideAllColumns}
                      className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded transition-colors"
                    >
                      Tout masquer
                    </button>
                    <button
                      onClick={resetColumnVisibility}
                      className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white text-sm rounded transition-colors"
                    >
                      Réinitialiser
                    </button>
                  </div>
                </div>
                <div className="p-2">
                  {columns.map((column) => {
                    const isVisible = visibleColumns.includes(column)
                    const isLastVisible = visibleColumns.length === 1 && isVisible
                    
                    return (
                      <div
                        key={column}
                        className={`flex items-center justify-between p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                          isLastVisible ? 'opacity-50' : ''
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={() => !isLastVisible && toggleColumnVisibility(column)}
                            disabled={isLastVisible}
                            className={`p-1 rounded transition-colors ${
                              isLastVisible
                                ? 'cursor-not-allowed'
                                : 'hover:bg-gray-200 dark:hover:bg-gray-600'
                            }`}
                          >
                            {isVisible ? (
                              <Eye className="w-4 h-4 text-green-500" />
                            ) : (
                              <EyeOff className="w-4 h-4 text-gray-400" />
                            )}
                          </button>
                          <span className="text-gray-700 dark:text-gray-300 text-sm">
                            {formatColumnName(column)}
                          </span>
                          {column === 'DOSSIER' && (
                            <span className="text-xs bg-yellow-200 dark:bg-yellow-600 text-yellow-800 dark:text-yellow-200 px-2 py-1 rounded">
                              Confirmation requise
                            </span>
                          )}
                          <Edit3 className="w-3 h-3 text-blue-500" />
                        </div>
                        {isLastVisible && (
                          <span className="text-xs text-orange-500">
                            Dernière visible
                          </span>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
          
          <button className="flex items-center space-x-2 px-4 py-2 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white rounded-lg transition-colors border border-gray-300 dark:border-gray-700">
            <Filter className="w-4 h-4" />
            <span>Filtrer</span>
          </button>
          <button className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors">
            <Download className="w-4 h-4" />
            <span>Exporter</span>
          </button>
        </div>
      </div>

      {/* Formulaire d'ajout */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div 
            ref={addFormRef}
            className="add-form-container bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Ajouter un nouveau record
                </h2>
                <button
                  onClick={closeAddForm}
                  className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-sm mt-2">
                Remplissez les champs ci-dessous. Utilisez <strong>Ctrl+Entrée</strong> pour sauvegarder rapidement.
              </p>
            </div>

            <div className="p-6">
              {addError && (
                <div className="mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-3">
                  <div className="flex items-center space-x-2 text-red-600 dark:text-red-400">
                    <AlertCircle className="w-4 h-4" />
                    <span>{addError}</span>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {['DATE', 'DOSSIER', 'LTA', 'CLIENT', 'DEPART', 'ARRIVEE', 'NOM'].map((column) => {
                  const isRequired = column === 'DOSSIER'
                  const isDateField = column === 'DATE'
                  
                  return (
                    <div key={column} className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        {column === 'LTA' ? 'LTA' : formatColumnName(column)}
                        {isRequired && <span className="text-red-500 ml-1">*</span>}
                        {column === 'DOSSIER' && (
                          <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                            (Auto-généré)
                          </span>
                        )}
                      </label>
                      <input
                        type={isDateField ? 'date' : 'text'}
                        value={newRecord[column] || ''}
                        onChange={(e) => handleNewRecordChange(column, e.target.value)}
                        onKeyPress={handleAddFormKeyPress}
                        className={`w-full px-3 py-2 bg-white dark:bg-gray-700 border rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          isRequired && (!newRecord[column] || newRecord[column].trim() === '')
                            ? 'border-red-300 dark:border-red-600'
                            : 'border-gray-300 dark:border-gray-600'
                        }`}
                        placeholder={
                          column === 'DOSSIER' 
                            ? 'Ex: AE25/0123' 
                            : isDateField 
                              ? 'YYYY-MM-DD' 
                              : `Entrez ${column === 'LTA' ? 'LTA' : formatColumnName(column).toLowerCase()}`
                        }
                      />
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                <span className="text-red-500">*</span> Champs obligatoires
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={closeAddForm}
                  disabled={addingRecord}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors disabled:opacity-50"
                >
                  Annuler
                </button>
                <button
                  onClick={saveNewRecord}
                  disabled={addingRecord}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50"
                >
                  {addingRecord ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Ajout en cours...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Ajouter</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmation pour l'édition du DOSSIER */}
      {showDossierConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <AlertCircle className="w-6 h-6 text-yellow-500" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Confirmation requise
                </h3>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Vous êtes sur le point de modifier le numéro de dossier. Cette action peut avoir des conséquences importantes.
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                Numéro actuel: <strong>{dossierEditData?.oldValue}</strong>
              </p>
              <div className="flex items-center justify-end space-x-3">
                <button
                  onClick={cancelDossierEdit}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={confirmDossierEdit}
                  className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors"
                >
                  Confirmer la modification
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmation pour la suppression */}
      {showDeleteConfirm && deleteData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <Trash2 className="w-6 h-6 text-red-500" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Confirmer la suppression
                </h3>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Êtes-vous sûr de vouloir supprimer définitivement cet enregistrement ? Cette action est irréversible.
              </p>
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3 mb-4">
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  <strong>Dossier:</strong> {deleteData.record.DOSSIER}
                </p>
                {deleteData.record.CLIENT && (
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    <strong>Client:</strong> {deleteData.record.CLIENT}
                  </p>
                )}
                {deleteData.record.DATE && (
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    <strong>Date:</strong> {formatDate(deleteData.record.DATE)}
                  </p>
                )}
              </div>
              
              {deleteError && (
                <div className="mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-3">
                  <div className="flex items-center space-x-2 text-red-600 dark:text-red-400">
                    <AlertCircle className="w-4 h-4" />
                    <span>{deleteError}</span>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end space-x-3">
                <button
                  onClick={closeDeleteConfirm}
                  disabled={deletingRecord}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors disabled:opacity-50"
                >
                  Annuler
                </button>
                <button
                  onClick={confirmDelete}
                  disabled={deletingRecord}
                  className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50"
                >
                  {deletingRecord ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Suppression...</span>
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" />
                      <span>Supprimer définitivement</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Affichage du terme de recherche actif */}
      {activeSearchTerm && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <span className="text-blue-700 dark:text-blue-300">
              Recherche active: <strong>"{activeSearchTerm}"</strong> dans {columns.length} colonnes
            </span>
            <button
              onClick={() => {
                setActiveSearchTerm('')
                setSearchTerm('')
                setCurrentPage(1)
              }}
              className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm"
            >
              Effacer
            </button>
          </div>
        </div>
      )}

      {/* Indicateur de colonnes masquées */}
      {visibleColumns.length < columns.length && (
        <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-700 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <span className="text-orange-700 dark:text-orange-300">
              <strong>{columns.length - visibleColumns.length}</strong> colonne(s) masquée(s) sur {columns.length}
            </span>
            <button
              onClick={showAllColumns}
              className="text-orange-600 dark:text-orange-400 hover:text-orange-800 dark:hover:text-orange-300 text-sm"
            >
              Tout afficher
            </button>
          </div>
        </div>
      )}

      {/* Tableau */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider w-16">
                  Actions
                </th>
                {visibleColumns.map((column) => (
                  <th
                    key={column}
                    onClick={() => handleSort(column)}
                    className="px-6 py-4 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors whitespace-nowrap"
                  >
                    <div className="flex items-center space-x-1">
                      <span>{column === 'LTA' ? 'LTA' : formatColumnName(column)}</span>
                      {column === 'DOSSIER' && (
                        <span className="text-xs bg-yellow-200 dark:bg-yellow-600 text-yellow-800 dark:text-yellow-200 px-1 py-0.5 rounded">
                          CONF
                        </span>
                      )}
                      {sortField === column && (
                        <span className="text-blue-500">
                          {sortDirection === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {currentData.map((record, rowIndex) => (
                <tr key={rowIndex} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => openDeleteConfirm(rowIndex, record)}
                      className="p-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      title="Supprimer cet enregistrement"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                  {visibleColumns.map((column) => {
                    const cellKey = getCellKey(rowIndex, column)
                    const isEditing = editingCell?.rowIndex === rowIndex && editingCell?.column === column
                    const isSaving = savingCells.has(cellKey)
                    const hasError = saveErrors.has(cellKey)
                    const isSuccess = saveSuccess.has(cellKey)
                    
                    return (
                      <td key={column} className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300 relative">
                        {isEditing ? (
                          <div className="flex items-center space-x-2">
                            <input
                              ref={editInputRef}
                              type="text"
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              onKeyPress={(e) => handleEditKeyPress(e, rowIndex, column)}
                              className="bg-white dark:bg-gray-700 border border-blue-500 rounded px-2 py-1 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 min-w-0 flex-1"
                            />
                            <button
                              onClick={() => saveEdit(rowIndex, column)}
                              disabled={isSaving}
                              className="p-1 bg-green-600 hover:bg-green-700 text-white rounded transition-colors disabled:opacity-50"
                            >
                              <Check className="w-3 h-3" />
                            </button>
                            <button
                              onClick={cancelEditing}
                              className="p-1 bg-gray-600 hover:bg-gray-700 text-white rounded transition-colors"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <div 
                            className={`max-w-xs truncate cursor-pointer relative hover:bg-gray-100 dark:hover:bg-gray-600 rounded px-2 py-1 -mx-2 -my-1 ${
                              isSaving ? 'opacity-50' : ''
                            } ${
                              hasError ? 'bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700' : ''
                            } ${
                              isSuccess ? 'bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700' : ''
                            }`}
                            title={
                              hasError 
                                ? `Erreur: ${saveErrors.get(cellKey)}` 
                                : formatCellValue(record[column], column)
                            }
                            onClick={() => !isSaving && startEditing(rowIndex, column, record[column])}
                          >
                            {formatCellValue(record[column], column)}
                            {isSaving && (
                              <RefreshCw className="w-3 h-3 animate-spin absolute top-1 right-1 text-blue-500" />
                            )}
                            {hasError && (
                              <AlertCircle className="w-3 h-3 absolute top-1 right-1 text-red-500" />
                            )}
                            {isSuccess && (
                              <Check className="w-3 h-3 absolute top-1 right-1 text-green-500" />
                            )}
                          </div>
                        )}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-gray-50 dark:bg-gray-900 px-6 py-3 flex items-center justify-between border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
              <span>
                Affichage {startIndex + 1} à {Math.min(endIndex, data.length)} sur {data.length} résultats
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-gray-900 dark:text-white transition-colors border border-gray-300 dark:border-gray-700"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-3 py-1 text-sm text-gray-700 dark:text-gray-300">
                Page {currentPage} sur {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-gray-900 dark:text-white transition-colors border border-gray-300 dark:border-gray-700"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Informations sur les colonnes */}
      {columns.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 shadow-sm">
          <h3 className="text-gray-900 dark:text-white font-medium mb-2">
            Colonnes disponibles ({columns.length}) - 
            <span className="text-green-500 ml-1">{visibleColumns.length} visibles</span>
            {visibleColumns.length < columns.length && (
              <span className="text-orange-500 ml-1">• {columns.length - visibleColumns.length} masquées</span>
            )}
            <span className="text-blue-500 ml-1">• {columns.length} modifiables</span>
          </h3>
          <div className="flex flex-wrap gap-2">
            {columns.map((column) => {
              const isVisible = visibleColumns.includes(column)
              return (
                <button
                  key={column}
                  onClick={() => toggleColumnVisibility(column)}
                  className={`px-3 py-1 rounded-full text-sm transition-all flex items-center space-x-1 ${
                    isVisible
                      ? 'bg-green-600 text-white hover:bg-green-700'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  <span>{column === 'LTA' ? 'LTA' : formatColumnName(column)}</span>
                  {column === 'DOSSIER' && <span className="text-xs">(CONF)</span>}
                  {isVisible ? (
                    <Eye className="w-3 h-3" />
                  ) : (
                    <EyeOff className="w-3 h-3" />
                  )}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

export default DataTable