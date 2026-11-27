import 'package:flutter/material.dart';

class TripMobileCard extends StatelessWidget {
  final Map<String, dynamic> trip;
  final VoidCallback onViewSlip;
  final VoidCallback onAddFuel;
  final VoidCallback onSettle;
  final VoidCallback onDelete;

  const TripMobileCard({
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
    final netWeight = (num.tryParse(t['net_weight']?.toString() ?? '0') ?? 0).toStringAsFixed(2);
    final rate = (num.tryParse(t['rate_per_unit']?.toString() ?? '0') ?? 0).toStringAsFixed(2);
    final gross = t['gross_freight'] ?? t['grossFreight'] ?? 0;
    final diesel = num.tryParse(t['total_diesel']?.toString() ?? '0') ?? 0;
    final hasSettlement = t['settlement_id'] != null;
    final settlementStatus = (t['settlement_status'] ?? '').toString();
    final hasSlip = t['slip_image'] != null && t['slip_image'].toString().isNotEmpty;

    return Card(
      elevation: 0,
      margin: const EdgeInsets.only(bottom: 10),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(14),
        side: const BorderSide(color: Color(0xFFE2E8F0)),
      ),
      child: Padding(
        padding: const EdgeInsets.all(14),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                      decoration: BoxDecoration(color: const Color(0xFFEFF6FF), borderRadius: BorderRadius.circular(6)),
                      child: Text(
                        '#$tripNo',
                        style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12, color: Color(0xFF1D4ED8)),
                      ),
                    ),
                    const SizedBox(width: 8),
                    Text(
                      truck,
                      style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Color(0xFF0F172A)),
                    ),
                  ],
                ),
                Row(
                  children: [
                    _buildSettlementBadge(hasSettlement, settlementStatus),
                    IconButton(
                      icon: const Icon(Icons.delete_outline, size: 18, color: Color(0xFFE11D48)),
                      onPressed: onDelete,
                      padding: EdgeInsets.zero,
                      constraints: const BoxConstraints(minWidth: 32, minHeight: 32),
                    ),
                  ],
                ),
              ],
            ),
            const SizedBox(height: 6),
            Text(
              'Owner: $owner • Party: $party',
              style: const TextStyle(fontSize: 11, color: Color(0xFF64748B)),
              overflow: TextOverflow.ellipsis,
            ),
            const SizedBox(height: 4),
            Row(
              children: [
                const Icon(Icons.location_on_outlined, size: 14, color: Color(0xFF64748B)),
                const SizedBox(width: 4),
                Expanded(
                  child: Text('→ $dest ($unloadDate)', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: Color(0xFF334155)), overflow: TextOverflow.ellipsis),
                ),
                if (hasSlip)
                  InkWell(
                    onTap: onViewSlip,
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                      decoration: BoxDecoration(color: const Color(0xFFEFF6FF), borderRadius: BorderRadius.circular(4), border: Border.all(color: const Color(0xFFBFDBFE))),
                      child: const Text('Slip', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Color(0xFF2563EB))),
                    ),
                  ),
              ],
            ),
            const Divider(height: 18),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('$netWeight MT @ ₹$rate/MT', style: const TextStyle(fontSize: 11, color: Color(0xFF64748B))),
                    const SizedBox(height: 2),
                    Text(_formatCurrency(gross), style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 15, color: Color(0xFF0F172A))),
                  ],
                ),
                InkWell(
                  onTap: onAddFuel,
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: diesel > 0 ? const Color(0xFFFFF1F2) : const Color(0xFFF1F5F9),
                      borderRadius: BorderRadius.circular(6),
                    ),
                    child: Row(
                      children: [
                        Icon(Icons.local_gas_station, size: 12, color: diesel > 0 ? const Color(0xFFE11D48) : const Color(0xFF64748B)),
                        const SizedBox(width: 4),
                        Text(
                          diesel > 0 ? _formatCurrency(diesel) : '+ Fuel',
                          style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: diesel > 0 ? const Color(0xFFE11D48) : const Color(0xFF334155)),
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSettlementBadge(bool hasSettlement, String status) {
    if (status == 'PAID') {
      return Container(
        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
        decoration: BoxDecoration(color: const Color(0xFFDCFCE7), borderRadius: BorderRadius.circular(4)),
        child: const Text('PAID', style: TextStyle(fontSize: 9, fontWeight: FontWeight.bold, color: Color(0xFF16A34A))),
      );
    }
    if (hasSettlement) {
      return Container(
        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
        decoration: BoxDecoration(color: const Color(0xFFE0F2FE), borderRadius: BorderRadius.circular(4)),
        child: const Text('SETTLED', style: TextStyle(fontSize: 9, fontWeight: FontWeight.bold, color: Color(0xFF0284C7))),
      );
    }
    return InkWell(
      onTap: onSettle,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
        decoration: BoxDecoration(color: const Color(0xFFFEF3C7), borderRadius: BorderRadius.circular(4)),
        child: const Text('+ Settle →', style: TextStyle(fontSize: 9, fontWeight: FontWeight.bold, color: Color(0xFFD97706))),
      ),
    );
  }
}

