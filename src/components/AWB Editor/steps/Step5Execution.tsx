import React from 'react';
import { FormField } from '../FormField';
import { LTAData } from '../../types/lta';

interface Step5ExecutionProps {
  data: LTAData;
  updateData: (updates: Partial<LTAData>) => void;
}

export const Step5Execution: React.FC<Step5ExecutionProps> = ({ data, updateData }) => {
  const getCurrentDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">CC Charges in Destination Currency</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 bg-gray-50 p-6 rounded-lg">
          <FormField
            label="Currency Conv. Rate"
            type="number"
            value={data.ccCharges.currencyConvRate}
            onChange={(value) => updateData({
              ccCharges: { ...data.ccCharges, currencyConvRate: value as number }
            })}
          />
          <FormField
            label="CC Charges in Dest."
            type="number"
            value={data.ccCharges.ccChargesInDest}
            onChange={(value) => updateData({
              ccCharges: { ...data.ccCharges, ccChargesInDest: value as number }
            })}
          />
          <FormField
            label="Charges at Dest."
            type="number"
            value={data.ccCharges.chargesAtDest}
            onChange={(value) => updateData({
              ccCharges: { ...data.ccCharges, chargesAtDest: value as number }
            })}
          />
          <FormField
            label="Total Collect"
            type="number"
            value={data.ccCharges.totalCollect}
            onChange={(value) => updateData({
              ccCharges: { ...data.ccCharges, totalCollect: value as number }
            })}
          />
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Shipper's Certification</h2>
        <div className="bg-gray-50 p-6 rounded-lg">
          <FormField
            label="Shipper's Signature"
            value={data.executionInfo.shipperSignature}
            onChange={(value) => updateData({
              executionInfo: { ...data.executionInfo, shipperSignature: value as string }
            })}
            placeholder="Enter shipper's signature or initials"
          />
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Carrier's Execution</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-6 rounded-lg">
          <FormField
            label="Date"
            type="date"
            value={data.executionInfo.executionDate || getCurrentDate()}
            onChange={(value) => updateData({
              executionInfo: { ...data.executionInfo, executionDate: value as string }
            })}
            required
          />
          <FormField
            label="Place"
            value={data.executionInfo.executionPlace}
            onChange={(value) => updateData({
              executionInfo: { ...data.executionInfo, executionPlace: value as string }
            })}
            placeholder="e.g., ORY"
            required
          />
          <div className="md:col-span-2">
            <FormField
              label="Carrier's Signature"
              value={data.executionInfo.carrierSignature}
              onChange={(value) => updateData({
                executionInfo: { ...data.executionInfo, carrierSignature: value as string }
              })}
              placeholder="Enter carrier's signature or initials"
              required
            />
          </div>
        </div>
      </div>
    </div>
  );
};
