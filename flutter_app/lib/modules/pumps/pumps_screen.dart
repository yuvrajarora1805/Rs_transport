import 'package:flutter/material.dart';
import '../../core/api/api_client.dart';
import '../../core/theme/app_theme.dart';
import '../../components/layout/erp_header.dart';

class PumpsScreen extends StatefulWidget {
  const PumpsScreen({super.key});

  @override
  State<PumpsScreen> createState() => _PumpsScreenState();
}

class _PumpsScreenState extends State<PumpsScreen> {
  List<Map<String, dynamic>> _pumps = [];
  bool _loading = true;
  String _search = '';

  @override
  void initState() {
    super.initState();
    _loadPumps();
  }

  Future<void> _loadPumps() async {
    setState(() => _loading = true);
    try {
      final res = await ApiClient().get('/masters/pumps');
      if (mounted && res.data is List) {
        setState(() => _pumps = List<Map<String, dynamic>>.from(res.data));
      }
    } catch (_) {} finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<void> _addPumpDialog() async {
    final nameCtrl = TextEditingController();
    final locCtrl = TextEditingController();

    await showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Add Petrol Pump Station', style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold)),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(controller: nameCtrl, decoration: const InputDecoration(labelText: 'Pump Name / Oil Company *')),
            const SizedBox(height: 10),
            TextField(controller: locCtrl, decoration: const InputDecoration(labelText: 'Highway / Station Location')),
          ],
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cancel')),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: AppColors.primary),
            onPressed: () async {
              if (nameCtrl.text.trim().isEmpty) return;
              try {
                await ApiClient().post('/masters/pumps', data: {
                  'name': nameCtrl.text.trim(),
                  'location': locCtrl.text.trim(),
                });
                Navigator.pop(ctx);
                _loadPumps();
              } catch (_) {}
            },
            child: const Text('Save Pump', style: TextStyle(color: Colors.white)),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final q = _search.toLowerCase();
    final filtered = _pumps.where((p) {
      final name = (p['name'] ?? '').toString().toLowerCase();
      final loc = (p['location'] ?? '').toString().toLowerCase();
      return name.contains(q) || loc.contains(q);
    }).toList();

    return Column(
      children: [
        ERPHeader(
          title: 'Pump Accounts & Diesel Ledgers',
          subtitle: 'Fuel Stations, Diesel Issued Memos & Cumulative Station Statements',
          actions: ElevatedButton.icon(
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.primary,
              foregroundColor: Colors.white,
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
            ),
            onPressed: _addPumpDialog,
            icon: const Icon(Icons.add, size: 14),
            label: const Text('Add Pump', style: TextStyle(fontSize: 11)),
          ),
        ),
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
          child: TextField(
            decoration: const InputDecoration(
              prefixIcon: Icon(Icons.search, size: 20),
              hintText: 'Search petrol pump station or location...',
            ),
            onChanged: (v) => setState(() => _search = v),
          ),
        ),
        Expanded(
          child: _loading
              ? const Center(child: CircularProgressIndicator())
              : filtered.isEmpty
                  ? const Center(child: Text('No petrol pumps registered yet.', style: TextStyle(color: AppColors.textMuted)))
                  : ListView.separated(
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                      itemCount: filtered.length,
                      separatorBuilder: (_, __) => const SizedBox(height: 8),
                      itemBuilder: (ctx, i) {
                        final p = filtered[i];
                        final balance = p['outstanding_balance'] ?? p['total_diesel_amount'] ?? 0;
                        final slips = p['slips_count'] ?? p['total_slips'] ?? 0;

                        return Card(
                          elevation: 0,
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12), side: const BorderSide(color: AppColors.border)),
                          child: ListTile(
                            leading: const CircleAvatar(
                              backgroundColor: Color(0xFFFEF3C7),
                              child: Icon(Icons.local_gas_station, color: Color(0xFFD97706), size: 18),
                            ),
                            title: Text(p['name'] ?? 'PUMP STATION', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                            subtitle: Text('Highway: ${p['location'] ?? 'Highway Filling Point'} • $slips Slips Issued', style: const TextStyle(fontSize: 11)),
                            trailing: Column(
                              mainAxisAlignment: MainAxisAlignment.center,
                              crossAxisAlignment: CrossAxisAlignment.end,
                              children: [
                                const Text('Total Diesel', style: TextStyle(fontSize: 9, color: AppColors.textMuted)),
                                Text('₹$balance', style: const TextStyle(fontWeight: FontWeight.w900, color: Color(0xFFD97706), fontSize: 13)),
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

