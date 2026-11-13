import { apiFetch } from '../../lib/api';
import { TripMultiTruckRow } from './TripMultiTruckCard';

interface CommonTripPayload {
  tripNo: string;
  dispatchId?: string;
  destinationId: string;
  partyId: string;
  transporterId: string;
  unloadingDate: string;
}

interface SingleTruckPayload {
  truckId: string;
  grossWeight?: string;
  tareWeight?: string;
  netWeight: string;
  ratePerUnit: string;
  slipImage?: string;
}

export async function submitTrip({
  isMultiMode,
  commonForm,
  singleTruck,
  multiRows,
  companyCode,
}: {
  isMultiMode: boolean;
  commonForm: CommonTripPayload;
  singleTruck: SingleTruckPayload;
  multiRows: TripMultiTruckRow[];
  companyCode: string;
}) {
  if (isMultiMode) {
    const valid = multiRows.filter((r) => r.truckId && r.netWeight);
    if (valid.length === 0) throw new Error('Please select at least one truck with weight');
    const payload = valid.map((r, i) => ({
      tripNo: `${commonForm.tripNo || 'TR'}-${String.fromCharCode(65 + i)}`,
      dispatchId: commonForm.dispatchId || undefined,
      truckId: r.truckId,
      destinationId: commonForm.destinationId,
      partyId: commonForm.partyId,
      transporterId: r.transporterId || commonForm.transporterId || undefined,
      unloadingDate: commonForm.unloadingDate,
      grossWeight: r.grossWeight ? Number(r.grossWeight) : undefined,
      tareWeight: r.tareWeight ? Number(r.tareWeight) : undefined,
      netWeight: Number(r.netWeight),
      ratePerUnit: Number(r.ratePerUnit || singleTruck.ratePerUnit || 0),
      slipImage: r.slipImage || undefined,
      companyCode,
    }));
    await apiFetch('/trips', { method: 'POST', body: JSON.stringify(payload) });
  } else {
    if (!singleTruck.truckId || !singleTruck.netWeight || !singleTruck.ratePerUnit) {
      throw new Error('Please fill in Truck, Net Weight and Rate');
    }
    await apiFetch('/trips', {
      method: 'POST',
      body: JSON.stringify({
        tripNo: commonForm.tripNo,
        dispatchId: commonForm.dispatchId || undefined,
        truckId: singleTruck.truckId,
        destinationId: commonForm.destinationId,
        partyId: commonForm.partyId,
        transporterId: commonForm.transporterId || undefined,
        unloadingDate: commonForm.unloadingDate,
        grossWeight: singleTruck.grossWeight ? Number(singleTruck.grossWeight) : undefined,
        tareWeight: singleTruck.tareWeight ? Number(singleTruck.tareWeight) : undefined,
        netWeight: Number(singleTruck.netWeight),
        ratePerUnit: Number(singleTruck.ratePerUnit),
        slipImage: singleTruck.slipImage || undefined,
        companyCode,
      }),
    });
  }
}

