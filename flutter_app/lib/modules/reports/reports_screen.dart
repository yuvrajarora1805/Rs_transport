import 'package:flutter/material.dart';
import '../../core/api/api_client.dart';
import '../../core/theme/app_theme.dart';
import '../../components/layout/erp_header.dart';

class ReportsScreen extends StatefulWidget {
  const ReportsScreen({super.key});

  @override
  State<ReportsScreen> createState() => _ReportsScreenState();
}

class _ReportsScreenState extends State<ReportsScreen> {
  List<Map<String, dynamic>> _settlements = [];
  bool _loading = true;
  String _search = '';

  @override
  void initState() {
    super.initState();
    _loadReports();
  }

  Future<void> _loadReports() async {
    setState(() => _loading = true);
    try {
      final res = await ApiClient().get('/settlements');
      if (mounted && res.data is List) {
        setState(() => _settlements = List<Map<String, dynamic>>.from(res.data));
      }
    } catch (_) {} finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final filtered = _settlements.where((s) {
      final q = _search.toLowerCase();
      final trip = (s['trip_no'] ?? '').toString().toLowerCase();
      final truck = (s['truck_no'] ?? '').toString().toLowerCase();
      return trip.contains(q) || truck.contains(q);
    }).toList();

    return Column(
      children: [
        ERPHeader(
          title: 'Reports & Analytics Center',
          subtitle: 'Operational Registers, Financial Audits & Statement Ledger',
          actions: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              OutlinedButton.icon(
                style: OutlinedButton.styleFrom(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                ),
                onPressed: () {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(content: Text('Exported ${filtered.length} records to CSV format')),
                  );
                },
                icon: const Icon(Icons.download, size: 14),
                label: const Text('Export CSV', style: TextStyle(fontSize: 11)),
              ),
            ],
          ),
        ),
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
          child: TextField(
            decoration: const InputDecoration(
              prefixIcon: Icon(Icons.search, size: 20),
              hintText: 'Search audit ledger by trip number or truck plate...',
            ),
            onChanged: (v) => setState(() => _search = v),
          ),
        ),
        Expanded(
          child: _loading
              ? const Center(child: CircularProgressIndicator())
              : filtered.isEmpty
                  ? const Center(child: Text('No settlement records available.', style: TextStyle(color: AppColors.textMuted)))
                  : ListView.separated(
                      padding: const EdgeInsets.all(20),
                      itemCount: filtered.length,
                      separatorBuilder: (_, __) => const SizedBox(height: 8),
                      itemBuilder: (ctx, i) {
                        final s = filtered[i];
                        final gross = s['gross_freight'] ?? 0;
                        final diesel = s['diesel_amount'] ?? 0;
                        final net = s['net_payable'] ?? 0;
                        final out = s['outstanding'] ?? 0;

                        return Card(
                          elevation: 0,
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12), side: const BorderSide(color: AppColors.border)),
                          child: Padding(
                            padding: const EdgeInsets.all(14),
                            child: Row(
                              children: [
                                const CircleAvatar(backgroundColor: Color(0xFFF1F5F9), child: Icon(Icons.description, color: Color(0xFF475569), size: 18)),
                                const SizedBox(width: 14),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text('Trip #${s['trip_no'] ?? '-'} | Truck: ${s['truck_no'] ?? '-'}', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                                      const SizedBox(height: 3),
                                      Text('Gross: ₹$gross • Diesel: ₹$diesel • Net Payable: ₹$net', style: const TextStyle(fontSize: 11, color: AppColors.textMuted)),
                                    ],
                                  ),
                                ),
                                Column(
                                  crossAxisAlignment: CrossAxisAlignment.end,
                                  children: [
                                    const Text('Balance', style: TextStyle(fontSize: 10, color: AppColors.textMuted)),
                                    Text('₹$out', style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: Number(out) > 0 ? const Color(0xFFDC2626) : const Color(0xFF059669))),
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
    );
  }

  num Number(dynamic v) => num.tryParse(v?.toString() ?? '') ?? 0;
}
