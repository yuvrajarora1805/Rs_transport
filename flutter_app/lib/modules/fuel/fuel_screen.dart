import 'package:flutter/material.dart';
import '../../core/api/api_client.dart';
import '../../core/theme/app_theme.dart';

class FuelScreen extends StatefulWidget {
  const FuelScreen({super.key});

  @override
  State<FuelScreen> createState() => _FuelScreenState();
}

class _FuelScreenState extends State<FuelScreen> {
  List<Map<String, dynamic>> _fuelTransactions = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _loadFuelTransactions();
  }

  Future<void> _loadFuelTransactions() async {
    setState(() => _loading = true);
    try {
      final res = await ApiClient().get('/fuel');
      if (res.statusCode == 200 && res.data is List) {
        _fuelTransactions = List<Map<String, dynamic>>.from(res.data);
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
            const Text('Petrol Pump & Diesel Advances', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            const Text('Direct fuel slip issuance and pump ledger reconciliations', style: TextStyle(fontSize: 12, color: AppColors.textMuted)),
            const SizedBox(height: 16),
            Expanded(
              child: _loading
                  ? const Center(child: CircularProgressIndicator())
                  : _fuelTransactions.isEmpty
                      ? const Center(child: Text('No fuel records.', style: TextStyle(color: AppColors.textMuted)))
                      : ListView.separated(
                          itemCount: _fuelTransactions.length,
                          separatorBuilder: (_, __) => const SizedBox(height: 8),
                          itemBuilder: (ctx, i) {
                            final f = _fuelTransactions[i];
                            final ltr = double.tryParse((f['liters'] ?? 0).toString()) ?? 0;
                            final amt = double.tryParse((f['amount'] ?? 0).toString()) ?? 0;
                            return Card(
                              child: ListTile(
                                leading: const CircleAvatar(
                                  backgroundColor: AppColors.background,
                                  child: Icon(Icons.local_gas_station, color: AppColors.warning, size: 20),
                                ),
                                title: Text(f['truck_no'] ?? 'TRUCK DIESEL', style: const TextStyle(fontWeight: FontWeight.bold)),
                                subtitle: Text('Liters: ${ltr.toStringAsFixed(1)} L • Slip: ${f['slip_no'] ?? '-'}', style: const TextStyle(fontSize: 12)),
                                trailing: Text('₹${amt.toStringAsFixed(2)}', style: const TextStyle(fontWeight: FontWeight.bold, color: AppColors.textMain, fontSize: 13)),
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
