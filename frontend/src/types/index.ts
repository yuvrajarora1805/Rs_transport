export type RoleName =
  | 'SUPER_ADMIN'
  | 'TRANSPORT_MANAGER'
  | 'DISPATCH_OPERATOR'
  | 'ACCOUNTS_MANAGER'
  | 'ACCOUNTS_OPERATOR'
  | 'FUEL_OPERATOR'
  | 'MANAGEMENT';

export interface User {
  id: string;
  username: string;
  fullName: string;
  role: RoleName;
}

export interface Truck {
  id: string;
  truckNo: string;
  ownerName?: string;
  mobileNo?: string;
  truckType?: string;
  capacity?: number;
  transporterId?: string;
  transporter?: Transporter;
  isActive: boolean;
  createdAt: string;
}

export interface Transporter {
  id: string;
  name: string;
  contactNo?: string;
  address?: string;
}

export interface Source {
  id: string;
  name: string;
  contactNo?: string;
}

export interface Destination {
  id: string;
  name: string;
  state?: string;
}

export interface Party {
  id: string;
  name: string;
  contactNo?: string;
  destinationId?: string;
  destination?: Destination;
}

export interface Pump {
  id: string;
  name: string;
  contactNo?: string;
  address?: string;
  openingBalance: number;
}

export interface Dispatch {
  id: string;
  srNo?: string;
  date: string;
  truckId: string;
  sourceId: string;
  bales?: number;
  destination?: string;
  remarks?: string;
  driverMobile?: string;
  truck?: Truck;
  source?: Source;
}

export interface Trip {
  id: string;
  tripNo: string;
  truckId: string;
  destinationId?: string;
  partyId?: string;
  transporterId?: string;
  unloadingDate?: string;
  grossWeight?: number;
  tareWeight?: number;
  netWeight: number;
  ratePerUnit: number;
  grossFreight: number;
  total_diesel?: number;
  fuel_count?: number;
  slip_image?: string;
  company_code?: string;
  truck?: Truck;
  destination?: Destination;
  party?: Party;
  transporter?: Transporter;
  settlement?: Settlement;
}

export interface Settlement {
  id: string;
  tripId: string;
  tripNo?: string;
  settlementDate?: string;
  grossFreight: number;
  advanceAmount: number;
  dieselAmount: number;
  commission: number;
  otherDeductions: number;
  netPayable: number;
  totalPaid: number;
  outstanding: number;
  slip_image?: string;
  trip_slip_image?: string;
  transporter_name?: string;
  status: 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'PARTIALLY_PAID' | 'PAID' | 'OVERPAID';
  trip?: Trip;
  payments?: Payment[];
}

export interface Payment {
  id: string;
  settlementId: string;
  paymentDate: string;
  amount: number;
  method: string;
  refNo?: string;
  paidTo?: string;
  remarks?: string;
  settlement?: Settlement;
  truck_no?: string;
  owner_name?: string;
}

export interface DashboardKpis {
  totalRegisteredTrucks: number;
  totalDispatches: number;
  totalTrips: number;
  totalGrossFreight: number;
  totalDieselAmount: number;
  totalAdvances: number;
  totalCommission: number;
  totalNetPayable: number;
  totalPaymentsMade: number;
  totalOutstanding: number;
  pendingSettlements: number;
}

