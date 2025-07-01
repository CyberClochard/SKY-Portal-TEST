import React, { useState, useEffect } from 'react'
import { Package, CheckCircle, XCircle, AlertTriangle, RefreshCw, Plus, Calculator, Hash, List, FileText, X } from 'lucide-react'
import { getAirlineByPrefix, insertAWBStock } from '../lib/supabase'

interface AWBSeriesData {
  prefix: string
  firstSerial: string
  lastSerial?: string
  quantity?: number
  airlineCode?: string
  airlineName?: string
  manualNumbers?: string[]
}

interface AWBValidationResult {
  isValid: boolean
  awbNumber: string
  prefix: string
  serialNumber: string
  checkDigit: number
  calculatedCheckDigit: number
  errors: string[]
}

const AWBValidation: React.FC = () => {
  const [addMethod, setAddMethod] = useState<'range' | 'quantity' | 'manual'>('range')
  const [awbSeriesData, setAwbSeriesData] = useState<AWBSeriesData>({
    prefix: '',
    firstSerial: '',
    lastSerial: '',
    quantity: 1,
    airlineCode: '',
    airlineName: '',
    manualNumbers: []
  })
  const [manualInput, setManualInput] = useState('')
  const [validationResults, setValidationResults] = useState<AWBValidationResult[]>([])
  const [isValidating, setIsValidating] = useState(false)
  const [addingStock, setAddingStock] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Look up airline when prefix changes
  useEffect(() => {
    const lookupAirline = async () => {
      if (awbSeriesData.prefix && awbSeriesData.prefix.length === 3) {
        try {
          const airline = await getAirlineByPrefix(awbSeriesData.prefix)
          if (airline) {
            setAwbSeriesData(prev => ({
              ...prev,
              airlineCode: airline.code || '',
              airlineName: airline.name || ''
            }))
          } else {
            setAwbSeriesData(prev => ({
              ...prev,
              airlineCode: '',
              airlineName: ''
            }))
          }
        } catch (err) {
          console.error('Error looking up airline:', err)
        }
      }
    }

    lookupAirline()
  }, [awbSeriesData.prefix])

  // AWB Check Digit Validation
  const validateAWBCheckDigit = (awbNumber: string): AWBValidationResult => {
    const errors: string[] = []
    
    // Remove any spaces or dashes
    const cleanAWB = awbNumber.replace(/[\s-]/g, '')

    // Check if it's exactly 11 digits
    if (!/^\d{11}$/.test(cleanAWB)) {
      errors.push('Le numéro AWB doit contenir exactement 11 chiffres')
      return {
        isValid: false,
        awbNumber: cleanAWB,
        prefix: '',
        serialNumber: '',
        checkDigit: 0,
        calculatedCheckDigit: 0,
        errors
      }
    }

    // Extract components
    const prefix = cleanAWB.substring(0, 3)
    const serialNumber = cleanAWB.substring(3, 10)
    const checkDigit = parseInt(cleanAWB.substring(10, 11))

    // Calculate check digit
    const serialNum = parseInt(serialNumber)
    const calculatedCheckDigit = serialNum % 7

    // Validate check digit
    if (checkDigit !== calculatedCheckDigit) {
      errors.push(`Check digit incorrect. Calculé: ${calculatedCheckDigit}, Fourni: ${checkDigit}`)
    }

    return {
      isValid: errors.length === 0,
      awbNumber: cleanAWB,
      prefix,
      serialNumber,
      checkDigit,
      calculatedCheckDigit,
      errors
    }
  }

  // Generate AWB number with correct check digit
  const generateAWBNumber = (prefix: string, serialNumber: string): string => {
    const paddedSerial = serialNumber.padStart(7, '0')
    const checkDigit = parseInt(paddedSerial) % 7
    return `${prefix}${paddedSerial}${checkDigit}`
  }

  // Generate AWB series based on method
  const generateAWBSeries = async (): Promise<string[]> => {
    const { prefix, firstSerial, lastSerial, quantity, manualNumbers } = awbSeriesData
    
    if (!prefix || prefix.length !== 3) {
      throw new Error('Le préfixe doit contenir exactement 3 chiffres')
    }

    let awbNumbers: string[] = []

    switch (addMethod) {
      case 'range':
        if (!firstSerial || !lastSerial) {
          throw new Error('Numéros de série de début et fin requis')
        }
        
        const firstNum = parseInt(firstSerial)
        const lastNum = parseInt(lastSerial)
        
        if (firstNum >= lastNum) {
          throw new Error('Le numéro de fin doit être supérieur au numéro de début')
        }
        
        if (lastNum - firstNum > 1000) {
          throw new Error('Maximum 1000 AWB par série')
        }

        for (let i = firstNum; i <= lastNum; i++) {
          const awb = generateAWBNumber(prefix, i.toString())
          awbNumbers.push(awb)
        }
        break

      case 'quantity':
        if (!firstSerial || !quantity || quantity < 1) {
          throw new Error('Numéro de série de début et quantité requis')
        }
        
        if (quantity > 1000) {
          throw new Error('Maximum 1000 AWB par série')
        }

        const startNum = parseInt(firstSerial)
        for (let i = 0; i < quantity; i++) {
          const awb = generateAWBNumber(prefix, (startNum + i).toString())
          awbNumbers.push(awb)
        }
        break

      case 'manual':
        if (!manualNumbers || manualNumbers.length === 0) {
          throw new Error('Aucun numéro AWB saisi')
        }
        
        awbNumbers = manualNumbers.filter(awb => awb.trim() !== '')
        break
    }

    return awbNumbers
  }

  // Validate all AWB numbers in series
  const validateAWBSeries = async () => {
    setIsValidating(true)
    setValidationResults([])
    setError(null)

    try {
      const awbNumbers = await generateAWBSeries()
      const results: AWBValidationResult[] = []

      for (const awb of awbNumbers) {
        const validation = validateAWBCheckDigit(awb)
        results.push(validation)
      }

      setValidationResults(results)

      // Check if all are valid
      const invalidCount = results.filter(r => !r.isValid).length
      if (invalidCount > 0) {
        setError(`${invalidCount} AWB(s) invalide(s) détecté(s). Veuillez corriger avant de continuer.`)
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la validation')
    } finally {
      setIsValidating(false)
    }
  }

  // Parse manual input
  const parseManualInput = (input: string) => {
    const lines = input.split('\n').map(line => line.trim()).filter(line => line !== '')
    setAwbSeriesData(prev => ({ ...prev, manualNumbers: lines }))
  }

  // Add AWB stock to database
  const handleAddAWBStock = async () => {
    if (validationResults.length === 0) {
      setError('Veuillez d\'abord valider les numéros AWB')
      return
    }

    const invalidResults = validationResults.filter(r => !r.isValid)
    if (invalidResults.length > 0) {
      setError('Impossible d\'ajouter des AWB invalides')
      return
    }

    setAddingStock(true)
    setError(null)

    try {
      let successCount = 0
      let errorCount = 0

      for (const result of validationResults) {
        try {
          await insertAWBStock({
            awb_number: result.awbNumber,
            prefix: result.prefix,
            serial_number: result.serialNumber,
            check_digit: result.checkDigit,
            airline_code: awbSeriesData.airlineCode,
            airline_name: awbSeriesData.airlineName,
            status: 'active',
            created_at: new Date().toISOString()
          })
          successCount++
        } catch (err) {
          console.error('Error adding AWB:', result.awbNumber, err)
          errorCount++
        }
      }

      if (successCount > 0) {
        setSuccess(`${successCount} AWB ajoutés avec succès au stock!`)
        
        if (errorCount === 0) {
          // Reset form on complete success
          setAwbSeriesData({
            prefix: '',
            firstSerial: '',
            lastSerial: '',
            quantity: 1,
            airlineCode: '',
            airlineName: '',
            manualNumbers: []
          })
          setManualInput('')
          setValidationResults([])
          setAddMethod('range')
        }
      }

      if (errorCount > 0) {
        setError(`${successCount} AWB ajoutés avec succès, ${errorCount} erreurs`)
      }

    } catch (err) {
      setError('Erreur lors de l\'ajout des AWB')
    } finally {
      setAddingStock(false)
      setTimeout(() => setSuccess(null), 5000)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
          <Package className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">AWB Stock</h2>
          <p className="text-gray-600 dark:text-gray-400">Ajouter des numéros AWB au stock avec validation automatique</p>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-4">
          <div className="flex items-center space-x-2 text-red-600 dark:text-red-400">
            <XCircle className="w-5 h-5" />
            <span>{error}</span>
          </div>
        </div>
      )}

      {success && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-4">
          <div className="flex items-center space-x-2 text-green-600 dark:text-green-400">
            <CheckCircle className="w-5 h-5" />
            <span>{success}</span>
          </div>
        </div>
      )}

      {/* Main Card */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
          Add AWB stock numbers
        </h3>
        
        <div className="space-y-6">
          {/* Airline Prefix */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Airline prefix
            </label>
            <input
              type="text"
              value={awbSeriesData.prefix}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '').slice(0, 3)
                setAwbSeriesData(prev => ({ ...prev, prefix: value }))
              }}
              placeholder="147"
              maxLength={3}
              className="w-48 px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            {awbSeriesData.airlineName && (
              <p className="mt-1 text-sm text-green-600 dark:text-green-400">
                ✓ {awbSeriesData.airlineName} ({awbSeriesData.airlineCode})
              </p>
            )}
          </div>

          {/* Method Selection */}
          <div className="space-y-4">
            {/* Add range */}
            <label className={`flex items-start space-x-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
              addMethod === 'range' 
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
            }`}>
              <input
                type="radio"
                name="addMethod"
                value="range"
                checked={addMethod === 'range'}
                onChange={(e) => setAddMethod(e.target.value as any)}
                className="mt-1 text-blue-600 focus:ring-blue-500"
              />
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <Hash className="w-4 h-4 text-blue-600" />
                  <span className="font-medium text-gray-900 dark:text-white">Add range</span>
                </div>
                
                {addMethod === 'range' && (
                  <div className="space-y-3 mt-4">
                    <div>
                      <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                        First serial number
                      </label>
                      <input
                        type="text"
                        value={awbSeriesData.firstSerial}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, '').slice(0, 7)
                          setAwbSeriesData(prev => ({ ...prev, firstSerial: value }))
                        }}
                        placeholder="1234567"
                        maxLength={7}
                        className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                        Last serial number
                      </label>
                      <input
                        type="text"
                        value={awbSeriesData.lastSerial}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, '').slice(0, 7)
                          setAwbSeriesData(prev => ({ ...prev, lastSerial: value }))
                        }}
                        placeholder="1234600"
                        maxLength={7}
                        className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                )}
              </div>
            </label>

            {/* Add quantity */}
            <label className={`flex items-start space-x-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
              addMethod === 'quantity' 
                ? 'border-green-500 bg-green-50 dark:bg-green-900/20' 
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
            }`}>
              <input
                type="radio"
                name="addMethod"
                value="quantity"
                checked={addMethod === 'quantity'}
                onChange={(e) => setAddMethod(e.target.value as any)}
                className="mt-1 text-green-600 focus:ring-green-500"
              />
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <Calculator className="w-4 h-4 text-green-600" />
                  <span className="font-medium text-gray-900 dark:text-white">Add quantity</span>
                </div>
                
                {addMethod === 'quantity' && (
                  <div className="space-y-3 mt-4">
                    <div>
                      <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                        First serial number
                      </label>
                      <input
                        type="text"
                        value={awbSeriesData.firstSerial}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, '').slice(0, 7)
                          setAwbSeriesData(prev => ({ ...prev, firstSerial: value }))
                        }}
                        placeholder="1234567"
                        maxLength={7}
                        className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                        Quantity
                      </label>
                      <input
                        type="number"
                        value={awbSeriesData.quantity}
                        onChange={(e) => {
                          const value = Math.max(1, Math.min(1000, parseInt(e.target.value) || 1))
                          setAwbSeriesData(prev => ({ ...prev, quantity: value }))
                        }}
                        min="1"
                        max="1000"
                        className="w-32 px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                  </div>
                )}
              </div>
            </label>

            {/* Add single numbers */}
            <label className={`flex items-start space-x-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
              addMethod === 'manual' 
                ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20' 
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
            }`}>
              <input
                type="radio"
                name="addMethod"
                value="manual"
                checked={addMethod === 'manual'}
                onChange={(e) => setAddMethod(e.target.value as any)}
                className="mt-1 text-purple-600 focus:ring-purple-500"
              />
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <List className="w-4 h-4 text-purple-600" />
                  <span className="font-medium text-gray-900 dark:text-white">Add single numbers</span>
                </div>
                
                {addMethod === 'manual' && (
                  <div className="mt-4">
                    <div className="bg-gray-100 dark:bg-gray-900 rounded-lg p-4 h-32 border border-gray-300 dark:border-gray-600">
                      <label className="block text-sm text-red-600 dark:text-red-400 font-medium mb-2">
                        Numbers
                      </label>
                      <textarea
                        value={manualInput}
                        onChange={(e) => {
                          setManualInput(e.target.value)
                          parseManualInput(e.target.value)
                        }}
                        placeholder="14712345675&#10;14712345682&#10;14712345699"
                        className="w-full h-16 bg-transparent border-none outline-none resize-none text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 font-mono text-sm"
                      />
                      <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
                        enter one serial number per line
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </label>
          </div>

          {/* Validation Button */}
          <div className="flex justify-center pt-4">
            <button
              onClick={validateAWBSeries}
              disabled={isValidating || !awbSeriesData.prefix}
              className="flex items-center space-x-2 px-8 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors text-lg font-medium"
            >
              {isValidating ? (
                <RefreshCw className="w-5 h-5 animate-spin" />
              ) : (
                <CheckCircle className="w-5 h-5" />
              )}
              <span>Validate AWB Numbers</span>
            </button>
          </div>

          {/* Validation Results */}
          {validationResults.length > 0 && (
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Validation Results ({validationResults.length} AWB)
                </h4>
                <div className="flex items-center space-x-4 text-sm">
                  <div className="flex items-center space-x-1">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-green-600 font-medium">
                      {validationResults.filter(r => r.isValid).length} valid
                    </span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <XCircle className="w-4 h-4 text-red-600" />
                    <span className="text-red-600 font-medium">
                      {validationResults.filter(r => !r.isValid).length} invalid
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="max-h-60 overflow-y-auto space-y-2">
                {validationResults.map((result, index) => (
                  <div
                    key={index}
                    className={`flex items-center justify-between p-3 rounded-lg ${
                      result.isValid
                        ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700'
                        : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      {result.isValid ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-600" />
                      )}
                      <span className="font-mono text-sm font-medium">
                        {result.awbNumber}
                      </span>
                      {result.isValid && (
                        <span className="text-xs text-green-600 dark:text-green-400">
                          Check digit: {result.checkDigit} ✓
                        </span>
                      )}
                    </div>
                    {!result.isValid && (
                      <div className="text-sm text-red-600 dark:text-red-400">
                        {result.errors.join(', ')}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Add to Stock Button */}
              {validationResults.filter(r => r.isValid).length > 0 && (
                <div className="flex justify-center mt-6">
                  <button
                    onClick={handleAddAWBStock}
                    disabled={addingStock || validationResults.some(r => !r.isValid)}
                    className="flex items-center space-x-2 px-6 py-3 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                  >
                    {addingStock ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Plus className="w-4 h-4" />
                    )}
                    <span>Add to Stock ({validationResults.filter(r => r.isValid).length} AWB)</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* AWB Format Info */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-3">
          AWB Format Information
        </h3>
        <div className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
          <p>• <strong>Structure:</strong> 11 digits total (e.g., 12312345675)</p>
          <p>• <strong>Prefix:</strong> First 3 digits (123) - Airline code</p>
          <p>• <strong>Serial number:</strong> Next 7 digits (1234567) - Sequential numbering</p>
          <p>• <strong>Check digit:</strong> Last digit (5) - Remainder of serial number ÷ 7</p>
          <p>• <strong>Calculation:</strong> 1234567 ÷ 7 = 176366 remainder 5</p>
        </div>
      </div>
    </div>
  )
}

export default AWBValidation