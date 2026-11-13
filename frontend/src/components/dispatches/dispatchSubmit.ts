import { apiFetch } from '../../lib/api';
import { MultiTruckRow } from './MultiTruckRowCard';

interface SingleTruckPayload {
  truckId: string;
  bales?: string;
  driverMobile?: string;
}

interface CommonPayload {
  date: string;
  srNo?: string;
  sourceId: string;
  destination?: string;
  remarks?: string;
  companyCode: string;
}

export async function submitDispatch({
  isMultiMode,
  commonForm,
  singleTruck,
  multiTrucks,
  companyCode,
}: {
  isMultiMode: boolean;
  commonForm: CommonPayload;
  singleTruck: SingleTruckPayload;
  multiTrucks: MultiTruckRow[];
  companyCode: string;
}) {
  if (isMultiMode) {
    const validRows = multiTrucks.filter((r) => r.truckId);
    if (validRows.length === 0) throw new Error('Please select at least one truck');
    const payload = validRows.map((r) => ({
      date: commonForm.date,
      srNo: commonForm.srNo || undefined,
      sourceId: commonForm.sourceId,
      destination: commonForm.destination || undefined,
      remarks: commonForm.remarks || undefined,
      truckId: r.truckId,
      bales: r.bales ? Number(r.bales) : undefined,
      driverMobile: r.driverMobile || undefined,
      companyCode,
    }));
    await apiFetch('/dispatches', { method: 'POST', body: JSON.stringify(payload) });
  } else {
    if (!singleTruck.truckId) throw new Error('Please select a truck');
    await apiFetch('/dispatches', {
      method: 'POST',
      body: JSON.stringify({
        date: commonForm.date,
        srNo: commonForm.srNo || undefined,
        sourceId: commonForm.sourceId,
        destination: commonForm.destination || undefined,
        remarks: commonForm.remarks || undefined,
        truckId: singleTruck.truckId,
        bales: singleTruck.bales ? Number(singleTruck.bales) : undefined,
        driverMobile: singleTruck.driverMobile || undefined,
        companyCode,
      }),
    });
  }
}
