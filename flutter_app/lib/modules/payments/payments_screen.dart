import 'package:flutter/material.dart';
import '../../core/api/api_client.dart';
import '../../core/theme/app_theme.dart';
import '../../components/layout/erp_header.dart';

class PaymentsScreen extends StatefulWidget {
  const PaymentsScreen({super.key});

  @override
  State<PaymentsScreen> createState() => _PaymentsScreenState();
}

class _PaymentsScreenState extends State<PaymentsScreen> {
  List<Map<String, dynamic>> _payments = [];
  bool _loading = true;
  String _search = '';

  @override
  void initState() {
    super.initState();
    _loadPayments();
  }

  Future<void> _loadPayments() async {
    setState(() => _loading = true);
    try {
      final res = await ApiClient().get('/payments');
      if (mounted && res.data is List) {
        setState(() => _payments = List<Map<String, dynamic>>.from(res.data));
      }
    } catch (_) {} finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final filtered = _payments.where((p) {
      final q = _search.toLowerCase();
      final truck = (p['truck_no'] ?? '').toString().toLowerCase();
      final payee = (p['paid_to'] ?? '').toString().toLowerCase();
      final ref = (p['ref_no'] ?? '').toString().toLowerCase();
      return truck.contains(q) || payee.contains(q) || ref.contains(q);
    }).toList();

    return Column(
      children: [
        const ERPHeader(
          title: 'Payment Management',
          subtitle: 'Freight Disbursement Vouchers, Bank Transfers & UTR Traceability',
        ),
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
          child: TextField(
            decoration: const InputDecoration(
              prefixIcon: Icon(Icons.search, size: 20),
              hintText: 'Search by payee, truck plate, or UTR number...',
            ),
            onChanged: (v) => setState(() => _search = v),
          ),
        ),
        Expanded(
          child: _loading
              ? const Center(child: CircularProgressIndicator())
              : filtered.isEmpty
                  ? const Center(child: Text('No payment records recorded yet.', style: TextStyle(color: AppColors.textMuted)))
                  : ListView.separated(
                      padding: const EdgeInsets.all(20),
                      itemCount: filtered.length,
                      separatorBuilder: (_, __) => const SizedBox(height: 8),
                      itemBuilder: (ctx, i) {
                        final p = filtered[i];
                        final amt = p['amount'] ?? 0;
                        final method = p['method'] ?? 'CASH';
                        return Card(
                          elevation: 0,
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12), side: const BorderSide(color: AppColors.border)),
                          child: ListTile(
                            leading: const CircleAvatar(backgroundColor: Color(0xFF10B981), child: Icon(Icons.credit_card, color: Colors.white, size: 18)),
                            title: Text(p['truck_no'] ?? 'TRUCK DISBURSEMENT', style: const TextStyle(fontWeight: FontWeight.bold)),
                            subtitle: Text('Payee: ${p['paid_to'] ?? '-'} • Date: ${p['payment_date'] ?? '-'} • Ref: ${p['ref_no'] ?? '-'}'),
                            trailing: Column(
                              mainAxisAlignment: MainAxisAlignment.center,
                              crossAxisAlignment: CrossAxisAlignment.end,
                              children: [
                                Text('₹$amt', style: const TextStyle(fontWeight: FontWeight.w900, color: Color(0xFF047857), fontSize: 14)),
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                  decoration: BoxDecoration(color: const Color(0xFFF1F5F9), borderRadius: BorderRadius.circular(4)),
                                  child: Text(method, style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Color(0xFF475569))),
                                ),
                              ],
                            ),
                          ),
                        );
                      },
                    ),
        ),
      ],
    );
  }
}
