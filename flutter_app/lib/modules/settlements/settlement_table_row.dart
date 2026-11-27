import 'package:flutter/material.dart';

class SettlementTableRow extends StatelessWidget {
  final Map<String, dynamic> settlement;
  final VoidCallback onViewSlip;
  final VoidCallback onRecordPayment;
  final VoidCallback onDelete;

  const SettlementTableRow({
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
    final paid = s['total_paid'] ?? s['totalPaid'] ?? 0;
    final out = num.tryParse((s['outstanding'] ?? 0).toString()) ?? 0;
    final status = (s['status'] ?? 'PENDING').toString().toUpperCase();
    final hasSlip = s['slip_image'] != null && s['slip_image'].toString().isNotEmpty;

    return Container(
      decoration: const BoxDecoration(
        color: Colors.white,
        border: Border(bottom: BorderSide(color: Color(0xFFF1F5F9), width: 1)),
      ),
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      child: Row(
        children: [
          // Trip No
          SizedBox(
            width: 110,
            child: Text(tripNo, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12, color: Color(0xFF2563EB))),
          ),
          // Truck No
          SizedBox(
            width: 120,
            child: Text(truck, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12, color: Color(0xFF0F172A))),
          ),
          // Destination
          SizedBox(
            width: 120,
            child: Text(dest, style: const TextStyle(fontSize: 12, color: Color(0xFF334155)), overflow: TextOverflow.ellipsis),
          ),
          // Gross Freight
          SizedBox(
            width: 100,
            child: Text(_formatCurrency(gross), style: const TextStyle(fontSize: 12, color: Color(0xFF334155))),
          ),
          // Diesel
          SizedBox(
            width: 95,
            child: Text(_formatCurrency(diesel), style: const TextStyle(fontSize: 12, color: Color(0xFFD97706), fontWeight: FontWeight.w600)),
          ),
          // Net Payable
          SizedBox(
            width: 105,
            child: Text(_formatCurrency(net), style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12, color: Color(0xFF0F172A))),
          ),
          // Paid
          SizedBox(
            width: 95,
            child: Text(_formatCurrency(paid), style: const TextStyle(fontSize: 12, color: Color(0xFF059669), fontWeight: FontWeight.w600)),
          ),
          // Outstanding
          Expanded(
            child: Text(
              out < 0 ? '- ${_formatCurrency(out.abs())}' : _formatCurrency(out),
              style: TextStyle(
                fontWeight: FontWeight.bold,
                fontSize: 12,
                color: out > 0 ? const Color(0xFFE11D48) : (out < 0 ? const Color(0xFFD97706) : const Color(0xFF94A3B8)),
              ),
            ),
          ),
          // Status
          SizedBox(
            width: 105,
            child: _buildStatusBadge(status, out),
          ),
          // Action
          SizedBox(
            width: 130,
            child: Row(
              mainAxisAlignment: MainAxisAlignment.end,
              children: [
                if (hasSlip)
                  InkWell(
                    onTap: onViewSlip,
                    child: Container(
                      padding: const EdgeInsets.all(4),
                      margin: const EdgeInsets.only(right: 6),
                      decoration: BoxDecoration(color: const Color(0xFFEFF6FF), borderRadius: BorderRadius.circular(6)),
                      child: const Icon(Icons.image, size: 15, color: Color(0xFF2563EB)),
                    ),
                  ),
                if (out > 0)
                  InkWell(
                    onTap: onRecordPayment,
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 3),
                      margin: const EdgeInsets.only(right: 6),
                      decoration: BoxDecoration(color: const Color(0xFFECFDF5), borderRadius: BorderRadius.circular(6)),
                      child: const Text('Pay →', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Color(0xFF059669))),
                    ),
                  )
                else if (out < 0)
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 2),
                    margin: const EdgeInsets.only(right: 6),
                    decoration: BoxDecoration(color: const Color(0xFFFFFBEB), borderRadius: BorderRadius.circular(6), border: Border.all(color: const Color(0xFFFDE68A))),
                    child: const Text('Excess', style: TextStyle(fontSize: 9, fontWeight: FontWeight.bold, color: Color(0xFFB45309))),
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

  Widget _buildStatusBadge(String status, num out) {
    if (status == 'PAID' || out == 0) {
      return Container(
        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
        decoration: BoxDecoration(color: const Color(0xFFDCFCE7), borderRadius: BorderRadius.circular(6)),
        child: const Text('PAID', textAlign: TextAlign.center, style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Color(0xFF16A34A))),
      );
    }
    if (status == 'PARTIALLY_PAID') {
      return Container(
        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
        decoration: BoxDecoration(color: const Color(0xFFFEF3C7), borderRadius: BorderRadius.circular(6)),
        child: const Text('PARTIAL', textAlign: TextAlign.center, style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Color(0xFFD97706))),
      );
    }
    if (status == 'OVERDRAWN' || out < 0) {
      return Container(
        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
        decoration: BoxDecoration(color: const Color(0xFFFEF3C7), borderRadius: BorderRadius.circular(6)),
        child: const Text('EXCESS DIESEL', textAlign: TextAlign.center, style: TextStyle(fontSize: 9, fontWeight: FontWeight.bold, color: Color(0xFFD97706))),
      );
    }
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
      decoration: BoxDecoration(color: const Color(0xFFFEE2E2), borderRadius: BorderRadius.circular(6)),
      child: const Text('PENDING', textAlign: TextAlign.center, style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Color(0xFFDC2626))),
    );
  }
}

