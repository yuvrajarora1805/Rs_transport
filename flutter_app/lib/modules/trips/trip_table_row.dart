import 'dart:convert';
import 'package:flutter/material.dart';

class TripTableRow extends StatelessWidget {
  final Map<String, dynamic> trip;
  final VoidCallback onViewSlip;
  final VoidCallback onAddFuel;
  final VoidCallback onSettle;
  final VoidCallback onDelete;

  const TripTableRow({
    super.key,
    required this.trip,
    required this.onViewSlip,
    required this.onAddFuel,
    required this.onSettle,
    required this.onDelete,
  });

  String _formatDate(dynamic dateVal) {
    if (dateVal == null) return '-';
    try {
      final d = DateTime.parse(dateVal.toString());
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return '${d.day.toString().padLeft(2, '0')} ${months[d.month - 1]} ${d.year}';
    } catch (_) {
      return dateVal.toString().split('T').first;
    }
  }

  String _formatCurrency(dynamic val) {
    final num numVal = num.tryParse(val?.toString() ?? '0') ?? 0;
    return '₹${numVal.toStringAsFixed(2).replaceAllMapped(RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'), (m) => '${m[1]},')}';
  }

  @override
  Widget build(BuildContext context) {
    final t = trip;
    final tripNo = (t['trip_no'] ?? t['tripNo'] ?? '-').toString();
    final unloadDate = _formatDate(t['unloading_date'] ?? t['unloadingDate']);
    final truck = (t['truck_no'] ?? t['truckNo'] ?? '-').toString();
    final owner = (t['owner_name'] ?? t['ownerName'] ?? 'No Owner').toString();
    final dest = (t['destination_name'] ?? t['destination'] ?? '-').toString();
    final party = (t['party_name'] ?? t['party'] ?? '-').toString();
    final transporter = (t['transporter_name'] ?? t['company_code'] ?? 'RS Transport').toString();
    final netWeight = (num.tryParse(t['net_weight']?.toString() ?? '0') ?? 0).toStringAsFixed(2);
    final rate = (num.tryParse(t['rate_per_unit']?.toString() ?? '0') ?? 0).toStringAsFixed(2);
    final gross = t['gross_freight'] ?? t['grossFreight'] ?? 0;
    final diesel = num.tryParse(t['total_diesel']?.toString() ?? '0') ?? 0;
    final fuelCount = num.tryParse(t['fuel_count']?.toString() ?? '0') ?? 0;
    final hasSettlement = t['settlement_id'] != null;
    final settlementStatus = (t['settlement_status'] ?? '').toString();
    final hasSlip = t['slip_image'] != null && t['slip_image'].toString().isNotEmpty;

    return Container(
      decoration: const BoxDecoration(
        color: Colors.white,
        border: Border(bottom: BorderSide(color: Color(0xFFF1F5F9), width: 1)),
      ),
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      child: Row(
        children: [
          // TRIP / SR NO
          SizedBox(
            width: 110,
            child: Text(tripNo, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12, color: Color(0xFF2563EB))),
          ),
          // UNLOAD DATE
          SizedBox(
            width: 105,
            child: Text(unloadDate, style: const TextStyle(fontSize: 12, color: Color(0xFF334155))),
          ),
          // TRUCK NO
          SizedBox(
            width: 125,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(truck, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12, color: Color(0xFF0F172A))),
                Text(owner, style: const TextStyle(fontSize: 10, color: Color(0xFF94A3B8)), overflow: TextOverflow.ellipsis),
              ],
            ),
          ),
          // DESTINATION
          SizedBox(
            width: 120,
            child: Text(dest, style: const TextStyle(fontSize: 12, color: Color(0xFF334155)), overflow: TextOverflow.ellipsis),
          ),
          // PARTY / TRANSPORTER
          Expanded(
            flex: 2,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(party, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12, color: Color(0xFF1E293B)), overflow: TextOverflow.ellipsis),
                Text(transporter, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 10, color: Color(0xFF1D4ED8)), overflow: TextOverflow.ellipsis),
              ],
            ),
          ),
          // WEIGHT (MT)
          SizedBox(
            width: 90,
            child: Text('$netWeight MT', style: const TextStyle(fontSize: 12, color: Color(0xFF334155))),
          ),
          // RATE (₹/MT)
          SizedBox(
            width: 90,
            child: Text('₹$rate', style: const TextStyle(fontSize: 12, color: Color(0xFF334155))),
          ),
          // GROSS FREIGHT
          SizedBox(
            width: 110,
            child: Text(_formatCurrency(gross), style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12, color: Color(0xFF0F172A))),
          ),
          // ATTACHED DIESEL
          SizedBox(
            width: 120,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                if (diesel > 0)
                  Text(
                    '${_formatCurrency(diesel)}${fuelCount > 1 ? ' ($fuelCount slips)' : ''}',
                    style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 11, color: Color(0xFFE11D48)),
                  )
                else
                  const Text('None', style: TextStyle(fontSize: 11, color: Color(0xFF94A3B8))),
                const SizedBox(height: 2),
                InkWell(
                  onTap: onAddFuel,
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Icon(Icons.local_gas_station, size: 11, color: Color(0xFF2563EB)),
                      const SizedBox(width: 2),
                      Text(diesel > 0 ? '+ More Fuel' : '+ Add Fuel', style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w600, color: Color(0xFF2563EB))),
                    ],
                  ),
                ),
              ],
            ),
          ),
          // SETTLEMENT
          SizedBox(
            width: 130,
            child: _buildSettlementBadge(hasSettlement, settlementStatus),
          ),
          // ACTION
          SizedBox(
            width: 70,
            child: Row(
              mainAxisAlignment: MainAxisAlignment.end,
              children: [
                if (hasSlip)
                  InkWell(
                    onTap: onViewSlip,
                    child: Container(
                      padding: const EdgeInsets.all(4),
                      margin: const EdgeInsets.only(right: 4),
                      decoration: BoxDecoration(color: const Color(0xFFEFF6FF), borderRadius: BorderRadius.circular(6)),
                      child: const Icon(Icons.image, size: 15, color: Color(0xFF2563EB)),
                    ),
                  ),
                InkWell(
                  onTap: onDelete,
                  child: Container(
                    padding: const EdgeInsets.all(4),
                    decoration: BoxDecoration(color: const Color(0xFFFFF1F2), borderRadius: BorderRadius.circular(6)),
                    child: const Icon(Icons.delete_outline, size: 15, color: Color(0xFFE11D48)),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSettlementBadge(bool hasSettlement, String status) {
    if (status == 'PAID') {
      return Container(
        padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 3),
        decoration: BoxDecoration(color: const Color(0xFFDCFCE7), borderRadius: BorderRadius.circular(6)),
        child: const Text('PAID', textAlign: TextAlign.center, style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Color(0xFF16A34A))),
      );
    }
    if (status == 'PARTIALLY_PAID') {
      return Container(
        padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 3),
        decoration: BoxDecoration(color: const Color(0xFFFEF3C7), borderRadius: BorderRadius.circular(6)),
        child: const Text('PARTIAL', textAlign: TextAlign.center, style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Color(0xFFD97706))),
      );
    }
    if (hasSettlement) {
      return Container(
        padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 3),
        decoration: BoxDecoration(color: const Color(0xFFE0F2FE), borderRadius: BorderRadius.circular(6)),
        child: const Text('SETTLED', textAlign: TextAlign.center, style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Color(0xFF0284C7))),
      );
    }
    return InkWell(
      onTap: onSettle,
      child: const Text(
        'Create Settlement →',
        style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFFD97706)),
      ),
    );
  }
}

