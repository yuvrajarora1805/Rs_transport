export type RoleName =
  | 'SUPER_ADMIN'
  | 'TRANSPORT_MANAGER'
  | 'DISPATCH_OPERATOR'
  | 'ACCOUNTS_MANAGER'
  | 'ACCOUNTS_OPERATOR'
  | 'FUEL_OPERATOR'
  | 'MANAGEMENT';

export interface UserRow {
  id: string;
  username: string;
  password_hash: string;
  full_name: string;
  role: RoleName;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface TruckRow {
  id: string;
  truck_no: string;
  owner_name: string | null;
  mobile_no: string | null;
  truck_type: string | null;
  capacity: number | null;
  transporter_id: string | null;
  is_active: boolean;
  created_at: Date;
}

export interface TransporterRow {
  id: string;
  name: string;
  contact_no: string | null;
  address: string | null;
  is_active: boolean;
  created_at: Date;
}

export interface SourceRow {
  id: string;
  name: string;
  contact_no: string | null;
  is_active: boolean;
  created_at: Date;
}

export interface DestinationRow {
  id: string;
  name: string;
  state: string | null;
  is_active: boolean;
  created_at: Date;
}

export interface PartyRow {
  id: string;
  name: string;
  contact_no: string | null;
  is_active: boolean;
  created_at: Date;
}

export interface PumpRow {
  id: string;
  name: string;
  contact_no: string | null;
  address: string | null;
  opening_balance: number;
  is_active: boolean;
  created_at: Date;
}

export interface DispatchRow {
  id: string;
  sr_no: string | null;
  date: Date;
  truck_id: string;
  source_id: string;
  bales: number | null;
  destination: string | null;
  remarks: string | null;
  is_cancelled: boolean;
  created_at: Date;
}

export interface TripRow {
  id: string;
  trip_no: string;
  dispatch_id: string | null;
  truck_id: string;
  destination_id: string | null;
  party_id: string | null;
  transporter_id: string | null;
  unloading_date: Date | null;
  net_weight: number;
  rate_per_unit: number;
  gross_freight: number;
  status: string;
  created_at: Date;
}

export interface SettlementRow {
  id: string;
  trip_id: string;
  settlement_date: Date;
  gross_freight: number;
  advance_amount: number;
  diesel_amount: number;
  commission: number;
  other_deductions: number;
  net_payable: number;
  total_paid: number;
  outstanding: number;
  status: string;
  created_at: Date;
}

