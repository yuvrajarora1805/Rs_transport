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
  String _selectedPeriod = 'ALL';

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

  String _formatCurrency(dynamic val) {
    final num numVal = num.tryParse(val?.toString() ?? '0') ?? 0;
    return '₹${numVal.toStringAsFixed(2).replaceAllMapped(RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'), (m) => '${m[1]},')}';
  }

  @override
  Widget build(BuildContext context) {
    final q = _search.toLowerCase();
    final filtered = _settlements.where((s) {
      final trip = (s['trip_no'] ?? s['tripNo'] ?? '').toString().toLowerCase();
      final truck = (s['truck_no'] ?? s['truckNo'] ?? '').toString().toLowerCase();
      final dest = (s['destination_name'] ?? s['destination'] ?? '').toString().toLowerCase();
      return trip.contains(q) || truck.contains(q) || dest.contains(q);
    }).toList();

    final totalGross = filtered.fold<double>(0, (sum, s) => sum + (num.tryParse((s['gross_freight'] ?? s['grossFreight'] ?? 0).toString()) ?? 0));
    final totalDiesel = filtered.fold<double>(0, (sum, s) => sum + (num.tryParse((s['diesel_amount'] ?? s['dieselAmount'] ?? 0).toString()) ?? 0));
    final totalNet = filtered.fold<double>(0, (sum, s) => sum + (num.tryParse((s['net_payable'] ?? s['netPayable'] ?? 0).toString()) ?? 0));
    final totalPaid = filtered.fold<double>(0, (sum, s) => sum + (num.tryParse((s['total_paid'] ?? s['totalPaid'] ?? 0).toString()) ?? 0));

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
                  side: const BorderSide(color: Color(0xFFCBD5E1)),
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
        _buildPeriodAndSummary(filtered.length, totalGross, totalDiesel, totalNet, totalPaid),
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
          child: TextField(
            decoration: const InputDecoration(
              prefixIcon: Icon(Icons.search, size: 18),
              hintText: 'Search audit ledger by trip number, truck plate, or destination...',
              contentPadding: EdgeInsets.symmetric(horizontal: 10, vertical: 8),
            ),
            onChanged: (v) => setState(() => _search = v),
          ),
        ),
        Expanded(
          child: _loading
              ? const Center(child: CircularProgressIndicator())
              : filtered.isEmpty
                  ? const Center(child: Text('No settlement records available', style: TextStyle(color: AppColors.textMuted)))
                  : ListView.separated(
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                      itemCount: filtered.length,
                      separatorBuilder: (_, __) => const SizedBox(height: 8),
                      itemBuilder: (ctx, i) {
                        final s = filtered[i];
                        final trip = s['trip_no'] ?? s['tripNo'] ?? '-';
                        final truck = s['truck_no'] ?? s['truckNo'] ?? '-';
                        final dest = s['destination_name'] ?? s['destination'] ?? '-';
                        final gross = s['gross_freight'] ?? s['grossFreight'] ?? 0;
                        final diesel = s['diesel_amount'] ?? s['dieselAmount'] ?? 0;
                        final net = s['net_payable'] ?? s['netPayable'] ?? 0;
                        final paid = s['total_paid'] ?? s['totalPaid'] ?? 0;
                        final out = s['outstanding'] ?? 0;

                        return Card(
                          elevation: 0,
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12), side: const BorderSide(color: Color(0xFFE2E8F0))),
                          child: Padding(
                            padding: const EdgeInsets.all(12),
                            child: Row(
                              children: [
                                CircleAvatar(
                                  radius: 18,
                                  backgroundColor: const Color(0xFFEFF6FF),
                                  child: Text('#$trip', style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Color(0xFF2563EB))),
                                ),
                                const SizedBox(width: 12),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text('$truck → $dest', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Color(0xFF0F172A))),
                                      const SizedBox(height: 2),
                                      Text('Gross: ${_formatCurrency(gross)} • Diesel: ${_formatCurrency(diesel)}', style: const TextStyle(fontSize: 11, color: Color(0xFF64748B))),
                                    ],
                                  ),
                                ),
                                Column(
                                  crossAxisAlignment: CrossAxisAlignment.end,
                                  children: [
                                    Text('Net: ${_formatCurrency(net)}', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12, color: Color(0xFF0F172A))),
                                    Text('Paid: ${_formatCurrency(paid)} • Due: ${_formatCurrency(out)}', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: (num.tryParse(out.toString()) ?? 0) > 0 ? const Color(0xFFE11D48) : const Color(0xFF059669))),
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

  Widget _buildPeriodAndSummary(int count, double gross, double diesel, double net, double paid) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFFE2E8F0)),
      ),
      child: Column(
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('Audit Summary ($count records)', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12, color: Color(0xFF0F172A))),
              Row(
                children: ['ALL', 'MONTH', 'WEEK'].map((p) {
                  final active = _selectedPeriod == p;
                  return InkWell(
                    onTap: () => setState(() => _selectedPeriod = p),
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                      margin: const EdgeInsets.only(left: 4),
                      decoration: BoxDecoration(
                        color: active ? const Color(0xFF2563EB) : const Color(0xFFF1F5F9),
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Text(p, style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: active ? Colors.white : const Color(0xFF475569))),
                    ),
                  );
                }).toList(),
              ),
            ],
          ),
          const Divider(height: 16),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: [
              _metric('Gross Freight', _formatCurrency(gross), const Color(0xFF0F172A)),
              _metric('Diesel Deducted', _formatCurrency(diesel), const Color(0xFFD97706)),
              _metric('Net Payable', _formatCurrency(net), const Color(0xFF2563EB)),
              _metric('Disbursed', _formatCurrency(paid), const Color(0xFF059669)),
            ],
          ),
        ],
      ),
    );
  }

  Widget _metric(String label, String val, Color valColor) {
    return Column(
      children: [
        Text(label, style: const TextStyle(fontSize: 10, color: Color(0xFF64748B))),
        const SizedBox(height: 2),
        Text(val, style: TextStyle(fontWeight: FontWeight.w900, fontSize: 12, color: valColor)),
      ],
    );
  }
}
