import 'package:flutter/material.dart';

class FuelMobileCard extends StatelessWidget {
  final Map<String, dynamic> fuel;
  final VoidCallback onViewSlip;
  final VoidCallback onDelete;

  const FuelMobileCard({
    super.key,
    required this.fuel,
    required this.onViewSlip,
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
    final f = fuel;
    final date = _formatDate(f['date']);
    final truck = (f['truck_no'] ?? f['truckNo'] ?? '-').toString();
    final pump = (f['pump_name'] ?? f['pump'] ?? 'Petrol Pump').toString();
    final tripNo = (f['trip_no'] ?? f['tripNo'] ?? '').toString();
    final litres = num.tryParse(f['litres']?.toString() ?? '0') ?? 0;
    final rate = num.tryParse(f['rate']?.toString() ?? '0') ?? 0;
    final amount = f['amount'] ?? 0;
    final hasSlip = f['slip_image'] != null && f['slip_image'].toString().isNotEmpty;
    final isAdjusted = f['is_adjusted'] == true || f['is_adjusted'] == 1;

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
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        color: const Color(0xFFEFF6FF),
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Text(
                        truck,
                        style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Color(0xFF1D4ED8)),
                      ),
                    ),
                    if (tripNo.isNotEmpty && tripNo != 'Unallocated') ...[
                      const SizedBox(width: 6),
                      Text(
                        '#$tripNo',
                        style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: Color(0xFF64748B)),
                      ),
                    ],
                  ],
                ),
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 3),
                      decoration: BoxDecoration(
                        color: isAdjusted ? const Color(0xFFDCFCE7) : const Color(0xFFFEF3C7),
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Text(
                        isAdjusted ? 'DEDUCTED' : 'PENDING',
                        style: TextStyle(
                          fontSize: 9,
                          fontWeight: FontWeight.bold,
                          color: isAdjusted ? const Color(0xFF16A34A) : const Color(0xFFD97706),
                        ),
                      ),
                    ),
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
            const SizedBox(height: 8),
            Row(
              children: [
                const Icon(Icons.local_gas_station, size: 14, color: Color(0xFF64748B)),
                const SizedBox(width: 4),
                Expanded(
                  child: Text(
                    pump,
                    style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: Color(0xFF334155)),
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
                Text(
                  date,
                  style: const TextStyle(fontSize: 11, color: Color(0xFF64748B)),
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
                    Text(
                      litres > 0 ? '${litres.toStringAsFixed(2)} L @ ₹${rate.toStringAsFixed(2)}/L' : 'Fuel Memo',
                      style: const TextStyle(fontSize: 11, color: Color(0xFF64748B)),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      _formatCurrency(amount),
                      style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 16, color: Color(0xFFB45309)),
                    ),
                  ],
                ),
                if (hasSlip)
                  OutlinedButton.icon(
                    style: OutlinedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                      side: const BorderSide(color: Color(0xFFBFDBFE)),
                      backgroundColor: const Color(0xFFEFF6FF),
                    ),
                    onPressed: onViewSlip,
                    icon: const Icon(Icons.image, size: 14, color: Color(0xFF2563EB)),
                    label: const Text('Slip', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFF2563EB))),
                  ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

