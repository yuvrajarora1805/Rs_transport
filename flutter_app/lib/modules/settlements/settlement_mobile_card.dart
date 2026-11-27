import 'package:flutter/material.dart';

class SettlementMobileCard extends StatelessWidget {
  final Map<String, dynamic> settlement;
  final VoidCallback onViewSlip;
  final VoidCallback onRecordPayment;
  final VoidCallback onDelete;

  const SettlementMobileCard({
    super.key,
    required this.settlement,
    required this.onViewSlip,
    required this.onRecordPayment,
    required this.onDelete,
  });

  String _formatCurrency(dynamic val) {
    final num numVal = num.tryParse(val?.toString() ?? '0') ?? 0;
    return '₹${numVal.toStringAsFixed(2).replaceAllMapped(RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'), (m) => '${m[1]},')}';
  }

  @override
  Widget build(BuildContext context) {
    final s = settlement;
    final tripNo = (s['trip_no'] ?? s['tripNo'] ?? '-').toString();
    final truck = (s['truck_no'] ?? s['truckNo'] ?? '-').toString();
    final dest = (s['destination_name'] ?? s['destination'] ?? '-').toString();
    final gross = s['gross_freight'] ?? s['grossFreight'] ?? 0;
    final diesel = s['diesel_amount'] ?? s['dieselAmount'] ?? 0;
    final net = s['net_payable'] ?? s['netPayable'] ?? 0;
    final out = num.tryParse((s['outstanding'] ?? 0).toString()) ?? 0;
    final status = (s['status'] ?? 'PENDING').toString().toUpperCase();
    final hasSlip = s['slip_image'] != null && s['slip_image'].toString().isNotEmpty;

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
                      child: Text('Trip #$tripNo', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12, color: Color(0xFF1D4ED8))),
                    ),
                    const SizedBox(width: 8),
                    Text(truck, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Color(0xFF0F172A))),
                  ],
                ),
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                      decoration: BoxDecoration(
                        color: status == 'PAID' ? const Color(0xFFDCFCE7) : const Color(0xFFFEF3C7),
                        borderRadius: BorderRadius.circular(4),
                      ),
                      child: Text(status, style: TextStyle(fontSize: 9, fontWeight: FontWeight.bold, color: status == 'PAID' ? const Color(0xFF16A34A) : const Color(0xFFD97706))),
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
            const SizedBox(height: 6),
            Text('Destination: $dest • Gross: ${_formatCurrency(gross)}', style: const TextStyle(fontSize: 11, color: Color(0xFF64748B))),
            Text('Diesel Deducted: ${_formatCurrency(diesel)}', style: const TextStyle(fontSize: 11, color: Color(0xFFD97706), fontWeight: FontWeight.w600)),
            const Divider(height: 18),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('Net Payable', style: TextStyle(fontSize: 10, color: Color(0xFF64748B))),
                    Text(_formatCurrency(net), style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 15, color: Color(0xFF0F172A))),
                  ],
                ),
                Row(
                  children: [
                    if (hasSlip)
                      InkWell(
                        onTap: onViewSlip,
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                          margin: const EdgeInsets.only(right: 8),
                          decoration: BoxDecoration(color: const Color(0xFFEFF6FF), borderRadius: BorderRadius.circular(6)),
                          child: const Icon(Icons.image, size: 14, color: Color(0xFF2563EB)),
                        ),
                      ),
                    if (out > 0)
                      ElevatedButton(
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFF10B981),
                          foregroundColor: Colors.white,
                          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                        ),
                        onPressed: onRecordPayment,
                        child: Text('Pay ${_formatCurrency(out)} →', style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                      )
                    else
                      const Text('Settled', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFF10B981))),
                  ],
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

