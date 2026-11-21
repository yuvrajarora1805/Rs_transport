import 'package:flutter/material.dart';

class FuelImpactSidebar extends StatelessWidget {
  final Map<String, dynamic>? selectedPump;
  final Map<String, dynamic>? selectedTruck;
  final double amount;

  const FuelImpactSidebar({
    super.key,
    this.selectedPump,
    this.selectedTruck,
    required this.amount,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Card(
          elevation: 0,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16),
            side: const BorderSide(color: Color(0xFFE2E8F0)),
          ),
          child: Padding(
            padding: const EdgeInsets.all(20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Row(
                  children: [
                    Icon(Icons.local_gas_station, size: 18, color: Color(0xFF2563EB)),
                    SizedBox(width: 8),
                    Text('Pump Statement Impact', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                  ],
                ),
                const Divider(height: 24),
                _row('Selected Pump:', selectedPump?['name'] ?? 'None selected'),
                const SizedBox(height: 10),
                _row('Truck:', selectedTruck?['truck_no'] ?? selectedTruck?['truckNo'] ?? '-'),
                const SizedBox(height: 14),
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: const Color(0xFFFFFBEB),
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: const Color(0xFFFDE68A)),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text('Fuel Slip Amount:', style: TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF92400E), fontSize: 12)),
                      Text('₹${amount.toStringAsFixed(2)}', style: const TextStyle(fontWeight: FontWeight.w900, color: Color(0xFFB45309), fontSize: 16)),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
        const SizedBox(height: 16),
        Card(
          elevation: 0,
          color: const Color(0xFFEFF6FF),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16),
            side: const BorderSide(color: Color(0xFFBFDBFE)),
          ),
          child: const Padding(
            padding: EdgeInsets.all(16),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Icon(Icons.info_outline, size: 18, color: Color(0xFF1D4ED8)),
                SizedBox(width: 10),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('Accounting Rule', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Color(0xFF1D4ED8))),
                      SizedBox(height: 4),
                      Text(
                        'Saving this slip immediately creates a Debit in the pump ledger, and makes this diesel deduction available when settling freight for this truck.',
                        style: TextStyle(fontSize: 11, color: Color(0xFF1E40AF), height: 1.4),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }

  Widget _row(String label, String value) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(label, style: const TextStyle(fontSize: 13, color: Color(0xFF64748B))),
        Text(value, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: Color(0xFF0F172A))),
      ],
    );
  }
}

