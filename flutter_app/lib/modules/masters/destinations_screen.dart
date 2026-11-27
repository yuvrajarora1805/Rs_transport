import 'package:flutter/material.dart';
import '../../core/api/api_client.dart';
import '../../core/theme/app_theme.dart';
import '../../components/layout/erp_header.dart';
import '../dispatches/quick_dialogs.dart';

class DestinationsScreen extends StatefulWidget {
  const DestinationsScreen({super.key});

  @override
  State<DestinationsScreen> createState() => _DestinationsScreenState();
}

class _DestinationsScreenState extends State<DestinationsScreen> {
  List<Map<String, dynamic>> _destinations = [];
  bool _loading = true;
  String _search = '';

  @override
  void initState() {
    super.initState();
    _loadDestinations();
  }

  Future<void> _loadDestinations() async {
    setState(() => _loading = true);
    try {
      final res = await ApiClient().get('/masters/destinations');
      if (mounted && res.data is List) {
        setState(() => _destinations = List<Map<String, dynamic>>.from(res.data));
      }
    } catch (_) {} finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<void> _addDialog() async {
    final res = await QuickAddDialogs.showAddDestination(context);
    if (res != null) _loadDestinations();
  }

  @override
  Widget build(BuildContext context) {
    final q = _search.toLowerCase();
    final filtered = _destinations.where((d) {
      final name = (d['name'] ?? '').toString().toLowerCase();
      final state = (d['state'] ?? '').toString().toLowerCase();
      return name.contains(q) || state.contains(q);
    }).toList();

    return Column(
      children: [
        ERPHeader(
          title: 'Destinations Master (Unloading Hubs)',
          subtitle: 'Spinning Mills, Unloading Hubs & State Terminals',
          actions: ElevatedButton.icon(
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.primary,
              foregroundColor: Colors.white,
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
            ),
            onPressed: _addDialog,
            icon: const Icon(Icons.add, size: 14),
            label: const Text('Add Destination', style: TextStyle(fontSize: 11)),
          ),
        ),
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
          child: TextField(
            decoration: const InputDecoration(
              prefixIcon: Icon(Icons.search, size: 20),
              hintText: 'Search destination city or mill terminal...',
            ),
            onChanged: (v) => setState(() => _search = v),
          ),
        ),
        Expanded(
          child: _loading
              ? const Center(child: CircularProgressIndicator())
              : filtered.isEmpty
                  ? const Center(child: Text('No destinations registered.', style: TextStyle(color: AppColors.textMuted)))
                  : ListView.separated(
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                      itemCount: filtered.length,
                      separatorBuilder: (_, __) => const SizedBox(height: 8),
                      itemBuilder: (ctx, i) {
                        final d = filtered[i];
                        final trips = d['trips_count'] ?? d['total_trips'] ?? 0;
                        return Card(
                          elevation: 0,
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12), side: const BorderSide(color: AppColors.border)),
                          child: ListTile(
                            leading: const CircleAvatar(
                              backgroundColor: Color(0xFFF3E8FF),
                              child: Icon(Icons.location_on, color: Colors.purple, size: 18),
                            ),
                            title: Text(d['name'] ?? 'DESTINATION', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                            subtitle: Text('State/Region: ${d['state'] ?? 'North Zone'} • Dharamkanta Verified', style: const TextStyle(fontSize: 11)),
                            trailing: Text('$trips Trips', style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Colors.purple)),
                          ),
                        );
                      },
                    ),
        ),
      ],
    );
  }
}

