import 'package:flutter/material.dart';
import '../../core/api/api_client.dart';
import '../../core/theme/app_theme.dart';
import '../../components/layout/erp_header.dart';
import '../dispatches/quick_dialogs.dart';

class SourcesScreen extends StatefulWidget {
  const SourcesScreen({super.key});

  @override
  State<SourcesScreen> createState() => _SourcesScreenState();
}

class _SourcesScreenState extends State<SourcesScreen> {
  List<Map<String, dynamic>> _sources = [];
  bool _loading = true;
  String _search = '';

  @override
  void initState() {
    super.initState();
    _loadSources();
  }

  Future<void> _loadSources() async {
    setState(() => _loading = true);
    try {
      final res = await ApiClient().get('/masters/sources');
      if (mounted && res.data is List) {
        setState(() => _sources = List<Map<String, dynamic>>.from(res.data));
      }
    } catch (_) {} finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<void> _addDialog() async {
    final res = await QuickAddDialogs.showAddSource(context);
    if (res != null) _loadSources();
  }

  @override
  Widget build(BuildContext context) {
    final q = _search.toLowerCase();
    final filtered = _sources.where((s) {
      final name = (s['name'] ?? '').toString().toLowerCase();
      final city = (s['city'] ?? '').toString().toLowerCase();
      return name.contains(q) || city.contains(q);
    }).toList();

    return Column(
      children: [
        ERPHeader(
          title: 'Sources Master (Origins)',
          subtitle: 'Ginning Locations, Cotton Loading Stations & Mandi Origins',
          actions: ElevatedButton.icon(
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.primary,
              foregroundColor: Colors.white,
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
            ),
            onPressed: _addDialog,
            icon: const Icon(Icons.add, size: 14),
            label: const Text('Add Source', style: TextStyle(fontSize: 11)),
          ),
        ),
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
          child: TextField(
            decoration: const InputDecoration(
              prefixIcon: Icon(Icons.search, size: 20),
              hintText: 'Search loading source or ginning station...',
            ),
            onChanged: (v) => setState(() => _search = v),
          ),
        ),
        Expanded(
          child: _loading
              ? const Center(child: CircularProgressIndicator())
              : filtered.isEmpty
                  ? const Center(child: Text('No loading sources registered.', style: TextStyle(color: AppColors.textMuted)))
                  : ListView.separated(
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                      itemCount: filtered.length,
                      separatorBuilder: (_, __) => const SizedBox(height: 8),
                      itemBuilder: (ctx, i) {
                        final s = filtered[i];
                        final dispatches = s['dispatches_count'] ?? s['total_dispatches'] ?? 0;
                        return Card(
                          elevation: 0,
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12), side: const BorderSide(color: AppColors.border)),
                          child: ListTile(
                            leading: const CircleAvatar(
                              backgroundColor: Color(0xFFF0FDF4),
                              child: Icon(Icons.storefront, color: Color(0xFF16A34A), size: 18),
                            ),
                            title: Text(s['name'] ?? 'SOURCE', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                            subtitle: Text('Location: ${s['city'] ?? s['state'] ?? 'Local Ginning Station'}', style: const TextStyle(fontSize: 11)),
                            trailing: Text('$dispatches Dispatches', style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: AppColors.primary)),
                          ),
                        );
                      },
                    ),
        ),
      ],
    );
  }
}

