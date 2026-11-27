import 'package:flutter/material.dart';

class FuelTableRow extends StatelessWidget {
  final Map<String, dynamic> fuel;
  final VoidCallback onViewSlip;
  final VoidCallback onDelete;

  const FuelTableRow({
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
    final tripNo = (f['trip_no'] ?? f['tripNo'] ?? 'Unallocated').toString();
    final litres = num.tryParse(f['litres']?.toString() ?? '0') ?? 0;
    final rate = num.tryParse(f['rate']?.toString() ?? '0') ?? 0;
    final amount = f['amount'] ?? 0;
    final hasSlip = f['slip_image'] != null && f['slip_image'].toString().isNotEmpty;
    final isAdjusted = f['is_adjusted'] == true || f['is_adjusted'] == 1;

    return Container(
      decoration: const BoxDecoration(
        color: Colors.white,
        border: Border(bottom: BorderSide(color: Color(0xFFF1F5F9), width: 1)),
      ),
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      child: Row(
        children: [
          // Date
          SizedBox(
            width: 105,
            child: Text(date, style: const TextStyle(fontSize: 12, color: Color(0xFF334155))),
          ),
          // Truck No
          SizedBox(
            width: 120,
            child: Text(truck, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12, color: Color(0xFF0F172A))),
          ),
          // Petrol Pump
          Expanded(
            flex: 2,
            child: Text(pump, style: const TextStyle(fontSize: 12, color: Color(0xFF334155)), overflow: TextOverflow.ellipsis),
          ),
          // Trip Ref
          SizedBox(
            width: 100,
            child: Text(tripNo, style: const TextStyle(fontSize: 12, color: Color(0xFF2563EB), fontWeight: FontWeight.w600)),
          ),
          // Litres
          SizedBox(
            width: 80,
            child: Text(litres > 0 ? '${litres.toStringAsFixed(2)} L' : '-', style: const TextStyle(fontSize: 12, color: Color(0xFF334155))),
          ),
          // Rate (₹/L)
          SizedBox(
            width: 80,
            child: Text(rate > 0 ? '₹${rate.toStringAsFixed(2)}' : '-', style: const TextStyle(fontSize: 12, color: Color(0xFF334155))),
          ),
          // Total Amount
          SizedBox(
            width: 110,
            child: Text(_formatCurrency(amount), style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12, color: Color(0xFFB45309))),
          ),
          // Receipt
          SizedBox(
            width: 100,
            child: hasSlip
                ? InkWell(
                    onTap: onViewSlip,
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                      decoration: BoxDecoration(color: const Color(0xFFEFF6FF), borderRadius: BorderRadius.circular(6), border: Border.all(color: const Color(0xFFBFDBFE))),
                      child: const Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(Icons.image, size: 12, color: Color(0xFF2563EB)),
                          SizedBox(width: 4),
                          Text('View Slip', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Color(0xFF2563EB))),
                        ],
                      ),
                    ),
                  )
                : const Text('No Slip', style: TextStyle(fontSize: 11, color: Color(0xFF94A3B8))),
          ),
          // Settlement Status
          SizedBox(
            width: 95,
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
              decoration: BoxDecoration(
                color: isAdjusted ? const Color(0xFFDCFCE7) : const Color(0xFFFEF3C7),
                borderRadius: BorderRadius.circular(6),
              ),
              child: Text(
                isAdjusted ? 'DEDUCTED' : 'PENDING',
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontSize: 9,
                  fontWeight: FontWeight.bold,
                  color: isAdjusted ? const Color(0xFF16A34A) : const Color(0xFFD97706),
                ),
              ),
            ),
          ),
          // Action
          SizedBox(
            width: 50,
            child: Align(
              alignment: Alignment.centerRight,
              child: InkWell(
                onTap: onDelete,
                child: Container(
                  padding: const EdgeInsets.all(4),
                  decoration: BoxDecoration(color: const Color(0xFFFFF1F2), borderRadius: BorderRadius.circular(6)),
                  child: const Icon(Icons.delete_outline, size: 15, color: Color(0xFFE11D48)),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

