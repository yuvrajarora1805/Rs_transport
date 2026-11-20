import 'package:flutter/material.dart';
import '../../core/api/api_client.dart';
import '../../core/theme/app_theme.dart';

class SettlementsScreen extends StatefulWidget {
  const SettlementsScreen({super.key});

  @override
  State<SettlementsScreen> createState() => _SettlementsScreenState();
}

class _SettlementsScreenState extends State<SettlementsScreen> {
  List<Map<String, dynamic>> _settlements = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _loadSettlements();
  }

  Future<void> _loadSettlements() async {
    setState(() => _loading = true);
    try {
      final res = await ApiClient().get('/settlements');
      if (res.statusCode == 200 && res.data is List) {
        _settlements = List<Map<String, dynamic>>.from(res.data);
      }
    } catch (_) {}
    if (mounted) setState(() => _loading = false);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Driver & Trip Settlements', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            const Text('Gross Freight - Diesel Advance - Commission = Net Balance', style: TextStyle(fontSize: 12, color: AppColors.textMuted)),
            const SizedBox(height: 16),
            Expanded(
              child: _loading
                  ? const Center(child: CircularProgressIndicator())
                  : _settlements.isEmpty
                      ? const Center(child: Text('No settlements recorded.', style: TextStyle(color: AppColors.textMuted)))
                      : ListView.separated(
                          itemCount: _settlements.length,
                          separatorBuilder: (_, __) => const SizedBox(height: 8),
                          itemBuilder: (ctx, i) {
                            final s = _settlements[i];
                            final out = double.tryParse((s['outstanding'] ?? 0).toString()) ?? 0;
                            final paid = double.tryParse((s['total_paid'] ?? 0).toString()) ?? 0;
                            return Card(
                              child: ListTile(
                                leading: const CircleAvatar(
                                  backgroundColor: AppColors.background,
                                  child: Icon(Icons.receipt_long, color: AppColors.success, size: 20),
                                ),
                                title: Text('Settlement #${s['id']}', style: const TextStyle(fontWeight: FontWeight.bold)),
                                subtitle: Text('Paid: ₹${paid.toStringAsFixed(2)} • Status: ${s['status'] ?? 'SETTLED'}', style: const TextStyle(fontSize: 12)),
                                trailing: Text(
                                  out > 0 ? 'Pending: ₹${out.toStringAsFixed(2)}' : '₹0.00 (PAID)',
                                  style: TextStyle(
                                    fontWeight: FontWeight.bold,
                                    color: out > 0 ? AppColors.danger : AppColors.success,
                                    fontSize: 13,
                                  ),
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
