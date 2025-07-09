import React from 'react';
import { FormField } from '../FormField';
import { LTAData } from '../../types/lta';

interface Step3AWBChargesProps {
  data: LTAData;
  updateData: (updates: Partial<LTAData>) => void;
}

export const Step3AWBCharges: React.FC<Step3AWBChargesProps> = ({ data, updateData }) => {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">AWB Consignment Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-6 rounded-lg">
          <FormField
            label="AWB Number"
            value={data.awbConsignment.awbNumber}
            onChange={(value) => updateData({
              awbConsignment: { ...data.awbConsignment, awbNumber: value as string }
            })}
            placeholder="e.g., 124-40146385"
            required
          />
          <FormField
            label="Airport of Departure"
            value={data.awbConsignment.airportOfDeparture}
            onChange={(value) => updateData({
              awbConsignment: { ...data.awbConsignment, airportOfDeparture: value as string }
            })}
            placeholder="e.g., ORY"
            required
          />
          <FormField
            label="Issuer"
            value={data.awbConsignment.issuer}
            onChange={(value) => updateData({
              awbConsignment: { ...data.awbConsignment, issuer: value as string }
            })}
            placeholder="Issuer company"
            required
          />
          <FormField
            label="Issued By"
            value={data.awbConsignment.issuedBy}
            onChange={(value) => updateData({
              awbConsignment: { ...data.awbConsignment, issuedBy: value as string }
            })}
            placeholder="Issued by"
            required
          />
          <div className="md:col-span-2">
            <FormField
              label="Accounting Information Details"
              type="textarea"
              value={data.awbConsignment.accountingDetails}
              onChange={(value) => updateData({
                awbConsignment: { ...data.awbConsignment, accountingDetails: value as string }
              })}
              placeholder="e.g., FRET NON SECURISE"
              rows={3}
            />
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Shipment Reference Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-6 rounded-lg">
          <FormField
            label="Reference Number"
            value={data.shipmentReference.referenceNumber}
            onChange={(value) => updateData({
              shipmentReference: { ...data.shipmentReference, referenceNumber: value as string }
            })}
            placeholder="Reference number"
          />
          <FormField
            label="Information"
            value={data.shipmentReference.information}
            onChange={(value) => updateData({
              shipmentReference: { ...data.shipmentReference, information: value as string }
            })}
            placeholder="Additional information"
          />
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Charges Declaration</h2>
        <div className="bg-gray-50 p-6 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            <FormField
              label="Currency"
              type="select"
              value={data.chargesDeclaration.currency}
              onChange={(value) => updateData({
                chargesDeclaration: { ...data.chargesDeclaration, currency: value as string }
              })}
              options={[
                { value: 'EUR', label: 'EUR' },
                { value: 'USD', label: 'USD' },
                { value: 'GBP', label: 'GBP' },
                { value: 'CHF', label: 'CHF' }
              ]}
              required
            />
            <FormField
              label="Value for Carriage"
              value={data.chargesDeclaration.valueForCarriage}
              onChange={(value) => updateData({
                chargesDeclaration: { ...data.chargesDeclaration, valueForCarriage: value as string }
              })}
              placeholder="NVD"
            />
            <FormField
              label="Value for Customs"
              value={data.chargesDeclaration.valueForCustoms}
              onChange={(value) => updateData({
                chargesDeclaration: { ...data.chargesDeclaration, valueForCustoms: value as string }
              })}
              placeholder="NCV"
            />
            <FormField
              label="Amount of Insurance"
              value={data.chargesDeclaration.amountOfInsurance}
              onChange={(value) => updateData({
                chargesDeclaration: { ...data.chargesDeclaration, amountOfInsurance: value as string }
              })}
              placeholder="XXX"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-semibold mb-3">WT/VAL</h3>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="wtVal"
                    checked={data.chargesDeclaration.wtValPPD}
                    onChange={(e) => updateData({
                      chargesDeclaration: { 
                        ...data.chargesDeclaration, 
                        wtValPPD: e.target.checked,
                        wtValCOLL: !e.target.checked
                      }
                    })}
                    className="mr-2"
                  />
                  PPD
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="wtVal"
                    checked={data.chargesDeclaration.wtValCOLL}
                    onChange={(e) => updateData({
                      chargesDeclaration: { 
                        ...data.chargesDeclaration, 
                        wtValCOLL: e.target.checked,
                        wtValPPD: !e.target.checked
                      }
                    })}
                    className="mr-2"
                  />
                  COLL
                </label>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold mb-3">Other</h3>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="other"
                    checked={data.chargesDeclaration.otherPPD}
                    onChange={(e) => updateData({
                      chargesDeclaration: { 
                        ...data.chargesDeclaration, 
                        otherPPD: e.target.checked,
                        otherCOLL: !e.target.checked
                      }
                    })}
                    className="mr-2"
                  />
                  PPD
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="other"
                    checked={data.chargesDeclaration.otherCOLL}
                    onChange={(e) => updateData({
                      chargesDeclaration: { 
                        ...data.chargesDeclaration, 
                        otherCOLL: e.target.checked,
                        otherPPD: !e.target.checked
                      }
                    })}
                    className="mr-2"
                  />
                  COLL
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
