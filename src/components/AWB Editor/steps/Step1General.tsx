import React from 'react';
import { FormField } from '../FormField';
import { LTAData } from '../../types/lta';

interface Step1GeneralProps {
  data: LTAData;
  updateData: (updates: Partial<LTAData>) => void;
}

export const Step1General: React.FC<Step1GeneralProps> = ({ data, updateData }) => {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Shipper Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-6 rounded-lg">
          <FormField
            label="Account Number"
            value={data.shipper.accountNumber}
            onChange={(value) => updateData({
              shipper: { ...data.shipper, accountNumber: value as string }
            })}
            placeholder="Enter account number"
          />
          <FormField
            label="Company Name"
            value={data.shipper.name}
            onChange={(value) => updateData({
              shipper: { ...data.shipper, name: value as string }
            })}
            placeholder="Enter company name"
            required
          />
          <div className="md:col-span-2">
            <FormField
              label="Address"
              type="textarea"
              value={data.shipper.address}
              onChange={(value) => updateData({
                shipper: { ...data.shipper, address: value as string }
              })}
              placeholder="Enter complete address"
              required
              rows={3}
            />
          </div>
          <FormField
            label="City"
            value={data.shipper.city}
            onChange={(value) => updateData({
              shipper: { ...data.shipper, city: value as string }
            })}
            placeholder="Enter city"
            required
          />
          <FormField
            label="Country"
            value={data.shipper.country}
            onChange={(value) => updateData({
              shipper: { ...data.shipper, country: value as string }
            })}
            placeholder="Enter country"
            required
          />
          <FormField
            label="Postal Code"
            value={data.shipper.postalCode}
            onChange={(value) => updateData({
              shipper: { ...data.shipper, postalCode: value as string }
            })}
            placeholder="Enter postal code"
          />
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Consignee Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-6 rounded-lg">
          <FormField
            label="Account Number"
            value={data.consignee.accountNumber}
            onChange={(value) => updateData({
              consignee: { ...data.consignee, accountNumber: value as string }
            })}
            placeholder="Enter account number"
          />
          <FormField
            label="Company Name"
            value={data.consignee.name}
            onChange={(value) => updateData({
              consignee: { ...data.consignee, name: value as string }
            })}
            placeholder="Enter company name"
            required
          />
          <div className="md:col-span-2">
            <FormField
              label="Address"
              type="textarea"
              value={data.consignee.address}
              onChange={(value) => updateData({
                consignee: { ...data.consignee, address: value as string }
              })}
              placeholder="Enter complete address"
              required
              rows={3}
            />
          </div>
          <FormField
            label="City"
            value={data.consignee.city}
            onChange={(value) => updateData({
              consignee: { ...data.consignee, city: value as string }
            })}
            placeholder="Enter city"
            required
          />
          <FormField
            label="Country"
            value={data.consignee.country}
            onChange={(value) => updateData({
              consignee: { ...data.consignee, country: value as string }
            })}
            placeholder="Enter country"
            required
          />
          <FormField
            label="Postal Code"
            value={data.consignee.postalCode}
            onChange={(value) => updateData({
              consignee: { ...data.consignee, postalCode: value as string }
            })}
            placeholder="Enter postal code"
          />
        </div>
      </div>
    </div>
  );
};
