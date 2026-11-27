import 'package:flutter/material.dart';
import '../../core/api/api_client.dart';
import '../../core/database/local_storage.dart';
import '../../core/theme/app_theme.dart';
import '../../components/layout/erp_header.dart';
import '../dispatches/quick_dialogs.dart';

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
      final res = await ApiClient().get('/masters/trucks');
      if (res.statusCode == 200 && res.data is List) {
        final list = List<Map<String, dynamic>>.from(res.data);
        _trucks = list;
        await LocalStorage().saveTrucks(list);
      } else {
        _trucks = await LocalStorage().getTrucks();
      }
    } catch (_) {
      _trucks = await LocalStorage().getTrucks();
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<void> _handleAddNewTruck() async {
    final res = await QuickAddDialogs.showAddTruck(context);
    if (res != null) {
      _loadTrucks();
    }
  }

  @override
  Widget build(BuildContext context) {
    final filtered = _trucks.where((t) {
      final q = _search.toLowerCase();
      final num = (t['truck_no'] ?? t['truckNo'] ?? '').toString().toLowerCase();
      final owner = (t['owner_name'] ?? t['ownerName'] ?? '').toString().toLowerCase();
      final mob = (t['mobile_no'] ?? t['mobileNo'] ?? '').toString().toLowerCase();
      return num.contains(q) || owner.contains(q) || mob.contains(q);
    }).toList();

    return Column(
      children: [
        ERPHeader(
          title: 'Trucks Master Registry',
          subtitle: 'Fleet Vehicles, Ownership, RC & Transporter Mappings',
          actions: ElevatedButton.icon(
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.primary,
              foregroundColor: Colors.white,
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
            ),
            onPressed: _handleAddNewTruck,
            icon: const Icon(Icons.add, size: 14),
            label: const Text('Add Truck', style: TextStyle(fontSize: 11)),
          ),
        ),
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
          child: TextField(
            decoration: const InputDecoration(
              prefixIcon: Icon(Icons.search, size: 20),
              hintText: 'Search fleet trucks by plate number, owner, or mobile...',
            ),
            onChanged: (val) => setState(() => _search = val),
          ),
        ),
        Expanded(
          child: _loading
              ? const Center(child: CircularProgressIndicator())
              : filtered.isEmpty
                  ? Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          const Icon(Icons.local_shipping_outlined, size: 48, color: AppColors.textMuted),
                          const SizedBox(height: 12),
                          const Text('No vehicles registered yet.', style: TextStyle(color: AppColors.textMuted, fontSize: 13)),
                          const SizedBox(height: 12),
                          ElevatedButton.icon(
                            style: ElevatedButton.styleFrom(backgroundColor: AppColors.primary),
                            onPressed: _handleAddNewTruck,
                            icon: const Icon(Icons.add, size: 16, color: Colors.white),
                            label: const Text('Register First Truck', style: TextStyle(color: Colors.white)),
                          ),
                        ],
                      ),
                    )
                  : ListView.separated(
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                      itemCount: filtered.length,
                      separatorBuilder: (_, __) => const SizedBox(height: 8),
                      itemBuilder: (ctx, i) {
                        final item = filtered[i];
                        final plate = item['truck_no'] ?? item['truckNo'] ?? 'UNKNOWN';
                        final owner = item['owner_name'] ?? item['ownerName'] ?? 'Standard Fleet';
                        final mob = item['mobile_no'] ?? item['mobileNo'] ?? '-';
                        final type = item['truck_type'] ?? item['truckType'] ?? 'HEAVY';

                        return Card(
                          elevation: 0,
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12), side: const BorderSide(color: AppColors.border)),
                          child: Padding(
                            padding: const EdgeInsets.all(12),
                            child: Row(
                              children: [
                                const CircleAvatar(
                                  radius: 18,
                                  backgroundColor: Color(0xFFEFF6FF),
                                  child: Icon(Icons.directions_car, color: AppColors.primary, size: 18),
                                ),
                                const SizedBox(width: 12),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        plate,
                                        style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13, letterSpacing: 0.5),
                                        overflow: TextOverflow.ellipsis,
                                      ),
                                      const SizedBox(height: 2),
                                      Text(
                                        'Owner: $owner • Phone: $mob',
                                        style: const TextStyle(fontSize: 11, color: AppColors.textMuted),
                                        overflow: TextOverflow.ellipsis,
                                      ),
                                    ],
                                  ),
                                ),
                                const SizedBox(width: 8),
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                  decoration: BoxDecoration(
                                    color: const Color(0xFFECFDF5),
                                    borderRadius: BorderRadius.circular(6),
                                    border: Border.all(color: const Color(0xFFA7F3D0)),
                                  ),
                                  child: Text(
                                    type.toString().toUpperCase(),
                                    style: const TextStyle(color: Color(0xFF047857), fontWeight: FontWeight.bold, fontSize: 9),
                                  ),
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
