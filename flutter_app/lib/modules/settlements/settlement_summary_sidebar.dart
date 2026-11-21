import 'package:flutter/material.dart';

class SettlementSummarySidebar extends StatelessWidget {
  final Map<String, dynamic>? selectedTrip;
  final double gross;
  final double diesel;
  final double advance;
  final double commission;
  final double otherDeductions;
  final double netPayable;
  final bool isSubmitting;
  final VoidCallback onSave;

  const SettlementSummarySidebar({
    super.key,
    this.selectedTrip,
    required this.gross,
    required this.diesel,
    required this.advance,
    required this.commission,
    required this.otherDeductions,
    required this.netPayable,
    required this.isSubmitting,
    required this.onSave,
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
                    Icon(Icons.receipt_long, size: 18, color: Color(0xFF2563EB)),
                    SizedBox(width: 8),
                    Text('Settlement Breakdown', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                  ],
                ),
                const Divider(height: 24),
                _row('Gross Freight:', '₹${gross.toStringAsFixed(2)}', isBold: true),
                const SizedBox(height: 8),
                _row('(-) Diesel Deduction:', '₹${diesel.toStringAsFixed(2)}', color: const Color(0xFFD97706)),
                const SizedBox(height: 8),
                _row('(-) Cash Advance:', '₹${advance.toStringAsFixed(2)}', color: const Color(0xFFD97706)),
                const SizedBox(height: 8),
                _row('(-) Commission:', '₹${commission.toStringAsFixed(2)}', color: const Color(0xFFD97706)),
                if (otherDeductions > 0) ...[
                  const SizedBox(height: 8),
                  _row('(-) Other Deductions:', '₹${otherDeductions.toStringAsFixed(2)}', color: const Color(0xFFD97706)),
                ],
                const Divider(height: 24),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text('Net Driver Payable:', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                    Text(
                      '₹${netPayable.toStringAsFixed(2)}',
                      style: TextStyle(
                        fontWeight: FontWeight.w900,
                        fontSize: 18,
                        color: netPayable >= 0 ? const Color(0xFF059669) : const Color(0xFFDC2626),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 20),
                SizedBox(
                  width: double.infinity,
                  height: 44,
                  child: ElevatedButton.icon(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF2563EB),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                    ),
                    onPressed: isSubmitting ? null : onSave,
                    icon: isSubmitting
                        ? const SizedBox(width: 16, height: 16, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                        : const Icon(Icons.send, size: 16, color: Colors.white),
                    label: Text(
                      isSubmitting ? 'Saving...' : 'Finalize Settlement',
                      style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.white),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }

  Widget _row(String label, String value, {bool isBold = false, Color? color}) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(label, style: const TextStyle(fontSize: 13, color: Color(0xFF64748B))),
        Text(
          value,
          style: TextStyle(
            fontSize: 13,
            fontWeight: isBold ? FontWeight.bold : FontWeight.w600,
            color: color ?? const Color(0xFF0F172A),
          ),
        ),
      ],
    );
  }
}

