import 'package:flutter/material.dart';
import '../../core/api/api_client.dart';
import '../../core/database/local_storage.dart';
import '../../core/theme/app_theme.dart';

class TrucksScreen extends StatefulWidget {
  const TrucksScreen({super.key});

  @override
  State<TrucksScreen> createState() => _TrucksScreenState();
}

class _TrucksScreenState extends State<TrucksScreen> {
  List<Map<String, dynamic>> _trucks = [];
  bool _loading = true;
  String _search = '';

  @override
  void initState() {
    super.initState();
    _loadTrucks();
  }

  Future<void> _loadTrucks() async {
    setState(() => _loading = true);
    try {
      final res = await ApiClient().get('/trucks');
      if (res.statusCode == 200 && res.data is List) {
        final list = List<Map<String, dynamic>>.from(res.data);
        _trucks = list;
        await LocalStorage().saveTrucks(list);
      } else {
        _trucks = await LocalStorage().getTrucks();
      }
    } catch (_) {
      // Offline fallback
      _trucks = await LocalStorage().getTrucks();
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final filtered = _trucks.where((t) {
      final q = _search.toLowerCase();
      final num = (t['truck_no'] ?? t['truckNo'] ?? '').toString().toLowerCase();
      final owner = (t['owner_name'] ?? t['ownerName'] ?? '').toString().toLowerCase();
      return num.contains(q) || owner.contains(q);
    }).toList();

    return Scaffold(
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          children: [
            TextField(
              decoration: const InputDecoration(
                prefixIcon: Icon(Icons.search, size: 20),
                hintText: 'Search fleet trucks by plate or owner...',
              ),
              onChanged: (val) => setState(() => _search = val),
            ),
            const SizedBox(height: 16),
            Expanded(
              child: _loading
                  ? const Center(child: CircularProgressIndicator())
                  : filtered.isEmpty
                      ? const Center(child: Text('No vehicles found.', style: TextStyle(color: AppColors.textMuted)))
                      : ListView.separated(
                          itemCount: filtered.length,
                          separatorBuilder: (_, __) => const SizedBox(height: 8),
                          itemBuilder: (ctx, i) {
                            final item = filtered[i];
                            return Card(
                              child: ListTile(
                                leading: const CircleAvatar(
                                  backgroundColor: AppColors.background,
                                  child: Icon(Icons.directions_car, color: AppColors.primary, size: 20),
                                ),
                                title: Text(
                                  item['truck_no'] ?? item['truckNo'] ?? 'UNKNOWN',
                                  style: const TextStyle(fontWeight: FontWeight.bold, letterSpacing: 0.5),
                                ),
                                subtitle: Text(
                                  'Owner: ${item['owner_name'] ?? item['ownerName'] ?? 'Standard Fleet'} • Mob: ${item['mobile_no'] ?? item['mobileNo'] ?? '-'}',
                                  style: const TextStyle(fontSize: 12),
                                ),
                                trailing: Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                  decoration: BoxDecoration(
                                    color: AppColors.success.withOpacity(0.12),
                                    borderRadius: BorderRadius.circular(6),
                                  ),
                                  child: const Text(
                                    'REGISTERED',
                                    style: TextStyle(color: AppColors.success, fontWeight: FontWeight.bold, fontSize: 10),
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

