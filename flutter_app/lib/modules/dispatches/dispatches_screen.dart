import 'package:flutter/material.dart';
import '../../core/api/api_client.dart';
import '../../core/database/local_storage.dart';
import '../../core/theme/app_theme.dart';

class DispatchesScreen extends StatefulWidget {
  const DispatchesScreen({super.key});

  @override
  State<DispatchesScreen> createState() => _DispatchesScreenState();
}

class _DispatchesScreenState extends State<DispatchesScreen> {
  List<Map<String, dynamic>> _dispatches = [];
  bool _loading = true;
  String _search = '';

  @override
  void initState() {
    super.initState();
    _loadDispatches();
  }

  Future<void> _loadDispatches() async {
    setState(() => _loading = true);
    try {
      final res = await ApiClient().get('/dispatches');
      if (res.statusCode == 200 && res.data is List) {
        final list = List<Map<String, dynamic>>.from(res.data);
        _dispatches = list;
        await LocalStorage().saveDispatches(list);
      } else {
        _dispatches = await LocalStorage().getDispatches();
      }
    } catch (_) {
      // Offline fallback
      _dispatches = await LocalStorage().getDispatches();
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  void _showNewDispatchDialog() {
    final truckCtrl = TextEditingController();
    final balesCtrl = TextEditingController();
    final destCtrl = TextEditingController();

    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Create New Dispatch Slip', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
        content: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextField(controller: truckCtrl, decoration: const InputDecoration(labelText: 'Truck No (e.g. RJ07GE0525)')),
              const SizedBox(height: 12),
              TextField(controller: balesCtrl, keyboardType: TextInputType.number, decoration: const InputDecoration(labelText: 'Bales Count')),
              const SizedBox(height: 12),
              TextField(controller: destCtrl, decoration: const InputDecoration(labelText: 'Destination (e.g. SARDARSHAHAR)')),
            ],
          ),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cancel')),
          ElevatedButton(
            onPressed: () async {
              if (truckCtrl.text.isEmpty) return;
              final payload = {
                'truckNo': truckCtrl.text.trim().toUpperCase(),
                'bales': double.tryParse(balesCtrl.text) ?? 0,
                'destination': destCtrl.text.trim(),
                'date': DateTime.now().toIso8601String().split('T')[0],
              };

              try {
                await ApiClient().post('/dispatches', data: payload);
              } catch (_) {
                // Queue locally for offline sync
                await LocalStorage().queueOfflineAction('dispatches', 'CREATE', payload);
              }

              Navigator.pop(ctx);
              _loadDispatches();
            },
            child: const Text('Save Dispatch'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final filtered = _dispatches.where((d) {
      final q = _search.toLowerCase();
      final t = (d['truck_no'] ?? d['truckNo'] ?? '').toString().toLowerCase();
      final dest = (d['destination'] ?? '').toString().toLowerCase();
      return t.contains(q) || dest.contains(q);
    }).toList();

    return Scaffold(
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          children: [
            Row(
              children: [
                Expanded(
                  child: TextField(
                    decoration: const InputDecoration(
                      prefixIcon: Icon(Icons.search, size: 20),
                      hintText: 'Search truck number or destination...',
                    ),
                    onChanged: (val) => setState(() => _search = val),
                  ),
                ),
                const SizedBox(width: 12),
                ElevatedButton.icon(
                  onPressed: _showNewDispatchDialog,
                  icon: const Icon(Icons.add, size: 16),
                  label: const Text('New Slip'),
                ),
              ],
            ),
            const SizedBox(height: 16),
            Expanded(
              child: _loading
                  ? const Center(child: CircularProgressIndicator())
                  : filtered.isEmpty
                      ? const Center(child: Text('No dispatches recorded.', style: TextStyle(color: AppColors.textMuted)))
                      : ListView.separated(
                          itemCount: filtered.length,
                          separatorBuilder: (_, __) => const SizedBox(height: 8),
                          itemBuilder: (ctx, i) {
                            final item = filtered[i];
                            return Card(
                              child: ListTile(
                                leading: const CircleAvatar(
                                  backgroundColor: AppColors.primary,
                                  child: Icon(Icons.local_shipping, color: Colors.white, size: 20),
                                ),
                                title: Text(
                                  item['truck_no'] ?? item['truckNo'] ?? 'UNKNOWN TRUCK',
                                  style: const TextStyle(fontWeight: FontWeight.bold),
                                ),
                                subtitle: Text(
                                  'Dest: ${item['destination'] ?? '-'} • Date: ${item['date'] ?? '-'}',
                                  style: const TextStyle(fontSize: 12),
                                ),
                                trailing: Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                  decoration: BoxDecoration(
                                    color: AppColors.primary.withOpacity(0.1),
                                    borderRadius: BorderRadius.circular(8),
                                  ),
                                  child: Text(
                                    '${item['bales'] ?? 0} Bales',
                                    style: const TextStyle(color: AppColors.primary, fontWeight: FontWeight.bold, fontSize: 12),
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

