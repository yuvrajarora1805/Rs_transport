import 'package:flutter/material.dart';
import '../../core/api/api_client.dart';
import '../../core/theme/app_theme.dart';

class TripsScreen extends StatefulWidget {
  const TripsScreen({super.key});

  @override
  State<TripsScreen> createState() => _TripsScreenState();
}

class _TripsScreenState extends State<TripsScreen> {
  List<Map<String, dynamic>> _trips = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _loadTrips();
  }

  Future<void> _loadTrips() async {
    setState(() => _loading = true);
    try {
      final res = await ApiClient().get('/trips');
      if (res.statusCode == 200 && res.data is List) {
        _trips = List<Map<String, dynamic>>.from(res.data);
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
            const Text('Weighbridge & Delivery Trips', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            const Text('Track unloading weight, rate per MT, and gross freight', style: TextStyle(fontSize: 12, color: AppColors.textMuted)),
            const SizedBox(height: 16),
            Expanded(
              child: _loading
                  ? const Center(child: CircularProgressIndicator())
                  : _trips.isEmpty
                      ? const Center(child: Text('No trips loaded.', style: TextStyle(color: AppColors.textMuted)))
                      : ListView.separated(
                          itemCount: _trips.length,
                          separatorBuilder: (_, __) => const SizedBox(height: 8),
                          itemBuilder: (ctx, i) {
                            final t = _trips[i];
                            final netWt = double.tryParse((t['net_weight'] ?? 0).toString()) ?? 0;
                            final freight = double.tryParse((t['gross_freight'] ?? 0).toString()) ?? 0;
                            return Card(
                              child: ListTile(
                                leading: const CircleAvatar(
                                  backgroundColor: AppColors.background,
                                  child: Icon(Icons.route, color: AppColors.primary, size: 20),
                                ),
                                title: Text(t['trip_no'] ?? 'TRIP #${t['id']}', style: const TextStyle(fontWeight: FontWeight.bold)),
                                subtitle: Text('Weight: ${netWt.toStringAsFixed(2)} MT • Unload: ${t['unloading_date'] ?? '-'}', style: const TextStyle(fontSize: 12)),
                                trailing: Text('₹${freight.toStringAsFixed(2)}', style: const TextStyle(fontWeight: FontWeight.bold, color: AppColors.textMain, fontSize: 13)),
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

