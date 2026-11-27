import 'package:flutter/material.dart';

class PaymentTableRow extends StatelessWidget {
  final Map<String, dynamic> payment;

  const PaymentTableRow({
    super.key,
    required this.payment,
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
    final p = payment;
    final date = _formatDate(p['payment_date'] ?? p['paymentDate']);
    final truck = (p['truck_no'] ?? p['truckNo'] ?? '-').toString();
    final owner = (p['owner_name'] ?? p['ownerName'] ?? '-').toString();
    final amount = p['amount'] ?? 0;
    final method = (p['method'] ?? 'CASH').toString();
    final ref = (p['ref_no'] ?? p['refNo'] ?? '').toString();
    final paidTo = (p['paid_to'] ?? p['paidTo'] ?? '-').toString();
    final remarks = (p['remarks'] ?? '-').toString();

    return Container(
      decoration: const BoxDecoration(
        color: Colors.white,
        border: Border(bottom: BorderSide(color: Color(0xFFF1F5F9), width: 1)),
      ),
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      child: Row(
        children: [
          // Payment Date
          SizedBox(
            width: 110,
            child: Text(date, style: const TextStyle(fontSize: 12, color: Color(0xFF334155))),
          ),
          // Truck No (+ Owner)
          SizedBox(
            width: 140,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(truck, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12, color: Color(0xFF0F172A))),
                Text(owner, style: const TextStyle(fontSize: 10, color: Color(0xFF94A3B8)), overflow: TextOverflow.ellipsis),
              ],
            ),
          ),
          // Amount Paid
          SizedBox(
            width: 120,
            child: Text(_formatCurrency(amount), style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Color(0xFF059669))),
          ),
          // Payment Mode
          SizedBox(
            width: 110,
            child: Align(
              alignment: Alignment.centerLeft,
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                decoration: BoxDecoration(color: const Color(0xFFF1F5F9), borderRadius: BorderRadius.circular(4)),
                child: Text(method, style: const TextStyle(fontSize: 9, fontWeight: FontWeight.bold, color: Color(0xFF475569))),
              ),
            ),
          ),
          // UTR / Ref No
          SizedBox(
            width: 130,
            child: Text(ref.isNotEmpty ? ref : '-', style: const TextStyle(fontSize: 11, fontFamily: 'monospace', color: Color(0xFF475569)), overflow: TextOverflow.ellipsis),
          ),
          // Recipient / Payee
          Expanded(
            flex: 2,
            child: Text(paidTo, style: const TextStyle(fontSize: 12, color: Color(0xFF1E293B), fontWeight: FontWeight.w500), overflow: TextOverflow.ellipsis),
          ),
          // Remarks
          Expanded(
            flex: 2,
            child: Text(remarks, style: const TextStyle(fontSize: 11, color: Color(0xFF64748B)), overflow: TextOverflow.ellipsis),
          ),
        ],
      ),
    );
  }
}

