import 'package:flutter/material.dart';
import '../../core/api/api_client.dart';
import '../../core/theme/app_theme.dart';

class ReconcileScreen extends StatefulWidget {
  const ReconcileScreen({super.key});

  @override
  State<ReconcileScreen> createState() => _ReconcileScreenState();
}

class _ReconcileScreenState extends State<ReconcileScreen> {
  Map<String, dynamic>? _summary;
  List<Map<String, dynamic>> _trucks = [];
  bool _loading = true;
  String _search = '';

  @override
  void initState() {
    super.initState();
    _loadReconciliation();
  }

  Future<void> _loadReconciliation() async {
    setState(() => _loading = true);
    try {
      final res = await ApiClient().get('/masters/trucks/reconcile/summary');
      if (res.statusCode == 200 && res.data != null) {
        _summary = Map<String, dynamic>.from(res.data);
        if (_summary?['trucks'] is List) {
          _trucks = List<Map<String, dynamic>>.from(_summary!['trucks']);
        }
      }
    } catch (_) {}
    if (mounted) setState(() => _loading = false);
  }

  @override
  Widget build(BuildContext context) {
    final filtered = _trucks.where((t) {
      final q = _search.toLowerCase();
      final num = (t['truckNo'] ?? '').toString().toLowerCase();
      final dest = (t['destination'] ?? '').toString().toLowerCase();
      return num.contains(q) || dest.contains(q);
    }).toList();

    return Scaffold(
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('Plant Pass Excel Reconciliation', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                    Text(
                      'Comparing Excel Intake vs. Live System ERP Ledger • ${_summary?['totalRows'] ?? 0} Rows',
                      style: const TextStyle(fontSize: 12, color: AppColors.textMuted),
                    ),
                  ],
                ),
                IconButton(
                  onPressed: _loadReconciliation,
                  icon: const Icon(Icons.refresh, color: AppColors.primary),
                  tooltip: 'Reload Reconciliation',
                ),
              ],
            ),
            const SizedBox(height: 12),
            TextField(
              decoration: const InputDecoration(
                prefixIcon: Icon(Icons.search, size: 20),
                hintText: 'Search truck plate or vendor party...',
              ),
              onChanged: (val) => setState(() => _search = val),
            ),
            const SizedBox(height: 16),
            Expanded(
              child: _loading
                  ? const Center(child: CircularProgressIndicator())
                  : filtered.isEmpty
                      ? const Center(child: Text('No reconciliation records found.', style: TextStyle(color: AppColors.textMuted)))
                      : ListView.separated(
                          itemCount: filtered.length,
                          separatorBuilder: (_, __) => const SizedBox(height: 8),
                          itemBuilder: (ctx, i) {
                            final row = filtered[i];
                            final wt = double.tryParse((row['excelWeight'] ?? 0).toString()) ?? 0;
                            final out = double.tryParse((row['erpOutstanding'] ?? row['dbOutstanding'] ?? 0).toString()) ?? 0;
                            final freight = double.tryParse((row['erpGrossFreight'] ?? row['dbGrossFreight'] ?? 0).toString()) ?? 0;
                            final isReg = row['isRegisteredInSystem'] == true;

                            return Card(
                              child: Padding(
                                padding: const EdgeInsets.all(12.0),
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Row(
                                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                      children: [
                                        Row(
                                          children: [
                                            Text(row['truckNo'] ?? 'UNKNOWN', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                                            const SizedBox(width: 8),
                                            Container(
                                              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                              decoration: BoxDecoration(
                                                color: isReg ? AppColors.success.withOpacity(0.12) : AppColors.danger.withOpacity(0.12),
                                                borderRadius: BorderRadius.circular(4),
                                              ),
                                              child: Text(
                                                isReg ? 'REGISTERED' : 'MISSING IN DB',
                                                style: TextStyle(
                                                  color: isReg ? AppColors.success : AppColors.danger,
                                                  fontWeight: FontWeight.bold,
                                                  fontSize: 9,
                                                ),
                                              ),
                                            ),
                                          ],
                                        ),
                                        Text(
                                          out > 0 ? 'Due: ₹${out.toStringAsFixed(2)}' : '₹0.00 (Settled)',
                                          style: TextStyle(
                                            fontWeight: FontWeight.bold,
                                            color: out > 0 ? AppColors.danger : AppColors.success,
                                            fontSize: 13,
                                          ),
                                        ),
                                      ],
                                    ),
                                    const SizedBox(height: 6),
                                    Text('Party: ${row['destination'] ?? '-'} • Source: ${row['source'] ?? '-'}', style: const TextStyle(fontSize: 12, color: AppColors.textMuted)),
                                    const SizedBox(height: 4),
                                    Row(
                                      children: [
                                        Text('Excel Wt: ${wt.toStringAsFixed(2)} Qtl', style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w600)),
                                        const SizedBox(width: 16),
                                        Text('ERP Freight: ₹${freight.toStringAsFixed(2)}', style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w600)),
                                      ],
                                    ),
                                  ],
                                ),
                              ),
                            );
                          },
                        ),
            ),
          ],
        ),
      ),
    );
  }
}
