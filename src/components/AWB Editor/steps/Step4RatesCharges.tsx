import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { FormField } from '../FormField';
import { LTAData, RateDescriptionItem, OtherCharge } from '../../types/lta';

interface Step4RatesChargesProps {
  data: LTAData;
  updateData: (updates: Partial<LTAData>) => void;
}

export const Step4RatesCharges: React.FC<Step4RatesChargesProps> = ({ data, updateData }) => {
  const addRateItem = () => {
    const newItem: RateDescriptionItem = {
      pieces: 0,
      grossWeight: 0,
      kgLb: 'K',
      rateClass: 'Q',
      itemNo: '',
      chargeableWeight: 0,
      rate: 0,
      total: 0,
      natureAndQuantity: ''
    };
    updateData({
      rateDescription: [...data.rateDescription, newItem]
    });
  };

  const removeRateItem = (index: number) => {
    updateData({
      rateDescription: data.rateDescription.filter((_, i) => i !== index)
    });
  };

  const updateRateItem = (index: number, field: keyof RateDescriptionItem, value: any) => {
    const newItems = [...data.rateDescription];
    newItems[index] = { ...newItems[index], [field]: value };
    
    // Auto-calculate total
    if (field === 'chargeableWeight' || field === 'rate') {
      newItems[index].total = newItems[index].chargeableWeight * newItems[index].rate;
    }
    
    updateData({ rateDescription: newItems });
  };

  const addOtherCharge = () => {
    const newCharge: OtherCharge = {
      description: '',
      amount: 0,
      entitlement: 'due carrier'
    };
    updateData({
      otherCharges: [...data.otherCharges, newCharge]
    });
  };

  const removeOtherCharge = (index: number) => {
    updateData({
      otherCharges: data.otherCharges.filter((_, i) => i !== index)
    });
  };

  const updateOtherCharge = (index: number, field: keyof OtherCharge, value: any) => {
    const newCharges = [...data.otherCharges];
    newCharges[index] = { ...newCharges[index], [field]: value };
    updateData({ otherCharges: newCharges });
  };

  // Calculate totals
  const calculateTotals = () => {
    const weightCharge = data.rateDescription.reduce((sum, item) => sum + item.total, 0);
    const totalOtherDueAgent = data.otherCharges
      .filter(charge => charge.entitlement === 'due agent')
      .reduce((sum, charge) => sum + charge.amount, 0);
    const totalOtherDueCarrier = data.otherCharges
      .filter(charge => charge.entitlement === 'due carrier')
      .reduce((sum, charge) => sum + charge.amount, 0);
    
    const total = weightCharge + data.chargesSummary.valuationCharge + 
                  data.chargesSummary.tax + totalOtherDueAgent + totalOtherDueCarrier;

    updateData({
      chargesSummary: {
        ...data.chargesSummary,
        weightCharge,
        totalOtherDueAgent,
        totalOtherDueCarrier,
        total
      }
    });
  };

  React.useEffect(() => {
    calculateTotals();
  }, [data.rateDescription, data.otherCharges, data.chargesSummary.valuationCharge, data.chargesSummary.tax]);

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Rate Description</h2>
          <button
            onClick={addRateItem}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors"
          >
            <Plus size={20} />
            Add Item
          </button>
        </div>
        
        <div className="bg-gray-50 p-6 rounded-lg">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 p-2 text-left">Pieces</th>
                  <th className="border border-gray-300 p-2 text-left">Gross W.</th>
                  <th className="border border-gray-300 p-2 text-left">kg/lb</th>
                  <th className="border border-gray-300 p-2 text-left">Rate Class</th>
                  <th className="border border-gray-300 p-2 text-left">Item No.</th>
                  <th className="border border-gray-300 p-2 text-left">Charg. Wei.</th>
                  <th className="border border-gray-300 p-2 text-left">Rate</th>
                  <th className="border border-gray-300 p-2 text-left">Total</th>
                  <th className="border border-gray-300 p-2 text-left">Nature and Quantity</th>
                  <th className="border border-gray-300 p-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.rateDescription.map((item, index) => (
                  <tr key={index}>
                    <td className="border border-gray-300 p-2">
                      <input
                        type="number"
                        value={item.pieces}
                        onChange={(e) => updateRateItem(index, 'pieces', Number(e.target.value))}
                        className="w-full px-2 py-1 border rounded"
                      />
                    </td>
                    <td className="border border-gray-300 p-2">
                      <input
                        type="number"
                        value={item.grossWeight}
                        onChange={(e) => updateRateItem(index, 'grossWeight', Number(e.target.value))}
                        className="w-full px-2 py-1 border rounded"
                      />
                    </td>
                    <td className="border border-gray-300 p-2">
                      <select
                        value={item.kgLb}
                        onChange={(e) => updateRateItem(index, 'kgLb', e.target.value)}
                        className="w-full px-2 py-1 border rounded"
                      >
                        <option value="K">K</option>
                        <option value="L">L</option>
                      </select>
                    </td>
                    <td className="border border-gray-300 p-2">
                      <input
                        type="text"
                        value={item.rateClass}
                        onChange={(e) => updateRateItem(index, 'rateClass', e.target.value)}
                        className="w-full px-2 py-1 border rounded"
                      />
                    </td>
                    <td className="border border-gray-300 p-2">
                      <input
                        type="text"
                        value={item.itemNo}
                        onChange={(e) => updateRateItem(index, 'itemNo', e.target.value)}
                        className="w-full px-2 py-1 border rounded"
                      />
                    </td>
                    <td className="border border-gray-300 p-2">
                      <input
                        type="number"
                        value={item.chargeableWeight}
                        onChange={(e) => updateRateItem(index, 'chargeableWeight', Number(e.target.value))}
                        className="w-full px-2 py-1 border rounded"
                      />
                    </td>
                    <td className="border border-gray-300 p-2">
                      <input
                        type="number"
                        value={item.rate}
                        onChange={(e) => updateRateItem(index, 'rate', Number(e.target.value))}
                        className="w-full px-2 py-1 border rounded"
                      />
                    </td>
                    <td className="border border-gray-300 p-2">
                      <input
                        type="number"
                        value={item.total}
                        readOnly
                        className="w-full px-2 py-1 border rounded bg-gray-100"
                      />
                    </td>
                    <td className="border border-gray-300 p-2">
                      <textarea
                        value={item.natureAndQuantity}
                        onChange={(e) => updateRateItem(index, 'natureAndQuantity', e.target.value)}
                        className="w-full px-2 py-1 border rounded"
                        rows={2}
                      />
                    </td>
                    <td className="border border-gray-300 p-2">
                      <button
                        onClick={() => removeRateItem(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Charges Summary</h2>
          <div className="bg-gray-50 p-6 rounded-lg space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Weight Charge</label>
                <input
                  type="number"
                  value={data.chargesSummary.weightCharge}
                  readOnly
                  className="w-full px-3 py-2 border rounded bg-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Collect</label>
                <input
                  type="number"
                  className="w-full px-3 py-2 border rounded bg-gray-100"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                label="Valuation Charge"
                type="number"
                value={data.chargesSummary.valuationCharge}
                onChange={(value) => updateData({
                  chargesSummary: { ...data.chargesSummary, valuationCharge: value as number }
                })}
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Collect</label>
                <input
                  type="number"
                  className="w-full px-3 py-2 border rounded bg-gray-100"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                label="Tax"
                type="number"
                value={data.chargesSummary.tax}
                onChange={(value) => updateData({
                  chargesSummary: { ...data.chargesSummary, tax: value as number }
                })}
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Collect</label>
                <input
                  type="number"
                  className="w-full px-3 py-2 border rounded bg-gray-100"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Total Other Due Agent</label>
                <input
                  type="number"
                  value={data.chargesSummary.totalOtherDueAgent}
                  readOnly
                  className="w-full px-3 py-2 border rounded bg-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Total Other Due Carrier</label>
                <input
                  type="number"
                  value={data.chargesSummary.totalOtherDueCarrier}
                  readOnly
                  className="w-full px-3 py-2 border rounded bg-gray-100"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Total</label>
                <input
                  type="number"
                  value={data.chargesSummary.total}
                  readOnly
                  className="w-full px-3 py-2 border rounded bg-gray-100 font-bold"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Collect</label>
                <input
                  type="number"
                  className="w-full px-3 py-2 border rounded bg-gray-100"
                />
              </div>
            </div>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Other Charges</h2>
            <button
              onClick={addOtherCharge}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors"
            >
              <Plus size={20} />
              Add Charge
            </button>
          </div>
          
          <div className="bg-gray-50 p-6 rounded-lg">
            <div className="space-y-4">
              {data.otherCharges.map((charge, index) => (
                <div key={index} className="grid grid-cols-12 gap-2 items-end">
                  <div className="col-span-4">
                    <FormField
                      label="Description"
                      value={charge.description}
                      onChange={(value) => updateOtherCharge(index, 'description', value)}
                      placeholder="e.g., AWC, MYC, SCC"
                    />
                  </div>
                  <div className="col-span-3">
                    <FormField
                      label="Amount"
                      type="number"
                      value={charge.amount}
                      onChange={(value) => updateOtherCharge(index, 'amount', value)}
                    />
                  </div>
                  <div className="col-span-4">
                    <FormField
                      label="Entitlement"
                      type="select"
                      value={charge.entitlement}
                      onChange={(value) => updateOtherCharge(index, 'entitlement', value)}
                      options={[
                        { value: 'due agent', label: 'Due Agent' },
                        { value: 'due carrier', label: 'Due Carrier' }
                      ]}
                    />
                  </div>
                  <div className="col-span-1">
                    <button
                      onClick={() => removeOtherCharge(index)}
                      className="text-red-600 hover:text-red-800 p-2"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
