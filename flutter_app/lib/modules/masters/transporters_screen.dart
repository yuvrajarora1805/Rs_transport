import 'package:flutter/material.dart';
import '../../core/api/api_client.dart';
import '../../core/theme/app_theme.dart';
import '../../components/layout/erp_header.dart';

class TransportersScreen extends StatefulWidget {
  const TransportersScreen({super.key});

  @override
  State<TransportersScreen> createState() => _TransportersScreenState();
}

class _TransportersScreenState extends State<TransportersScreen> {
  List<Map<String, dynamic>> _transporters = [];
  bool _loading = true;
  String _search = '';

  @override
  void initState() {
    super.initState();
    _loadTransporters();
  }

  Future<void> _loadTransporters() async {
    setState(() => _loading = true);
    try {
      final res = await ApiClient().get('/masters/transporters');
      if (mounted && res.data is List) {
        setState(() => _transporters = List<Map<String, dynamic>>.from(res.data));
      }
    } catch (_) {} finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<void> _addDialog() async {
    final nameCtrl = TextEditingController();
    final contactCtrl = TextEditingController();
    final cityCtrl = TextEditingController();

    await showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Register New Transporter', style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold)),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(controller: nameCtrl, decoration: const InputDecoration(labelText: 'Transporter Name *')),
            const SizedBox(height: 10),
            TextField(controller: contactCtrl, decoration: const InputDecoration(labelText: 'Contact Person / Phone')),
            const SizedBox(height: 10),
            TextField(controller: cityCtrl, decoration: const InputDecoration(labelText: 'Operating Hub / City')),
          ],
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cancel')),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: AppColors.primary),
            onPressed: () async {
              if (nameCtrl.text.trim().isEmpty) return;
              try {
                await ApiClient().post('/masters/transporters', data: {
                  'name': nameCtrl.text.trim(),
                  'contact': contactCtrl.text.trim(),
                  'city': cityCtrl.text.trim(),
                });
                Navigator.pop(ctx);
                _loadTransporters();
              } catch (_) {}
            },
            child: const Text('Save Transporter', style: TextStyle(color: Colors.white)),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final q = _search.toLowerCase();
    final filtered = _transporters.where((t) {
      final name = (t['name'] ?? '').toString().toLowerCase();
      final city = (t['city'] ?? '').toString().toLowerCase();
      return name.contains(q) || city.contains(q);
    }).toList();

    return Column(
      children: [
        ERPHeader(
          title: 'Transporters Master',
          subtitle: 'Fleet Logistics Partners, Operating Hubs & Contact Registries',
          actions: ElevatedButton.icon(
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.primary,
              foregroundColor: Colors.white,
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
            ),
            onPressed: _addDialog,
            icon: const Icon(Icons.add, size: 14),
            label: const Text('Add Transporter', style: TextStyle(fontSize: 11)),
          ),
        ),
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
          child: TextField(
            decoration: const InputDecoration(
              prefixIcon: Icon(Icons.search, size: 20),
              hintText: 'Search transporter name or operating hub...',
            ),
            onChanged: (v) => setState(() => _search = v),
          ),
        ),
        Expanded(
          child: _loading
              ? const Center(child: CircularProgressIndicator())
              : filtered.isEmpty
                  ? const Center(child: Text('No transporters registered yet.', style: TextStyle(color: AppColors.textMuted)))
                  : ListView.separated(
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                      itemCount: filtered.length,
                      separatorBuilder: (_, __) => const SizedBox(height: 8),
                      itemBuilder: (ctx, i) {
                        final t = filtered[i];
                        return Card(
                          elevation: 0,
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12), side: const BorderSide(color: AppColors.border)),
                          child: ListTile(
                            leading: const CircleAvatar(
                              backgroundColor: Color(0xFFEFF6FF),
                              child: Icon(Icons.airport_shuttle, color: Color(0xFF2563EB), size: 18),
                            ),
                            title: Text(t['name'] ?? 'TRANSPORTER', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                            subtitle: Text('Hub: ${t['city'] ?? 'All Routes'} • Contact: ${t['contact'] ?? t['phone'] ?? '-'}', style: const TextStyle(fontSize: 11)),
                            trailing: Container(
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                              decoration: BoxDecoration(color: const Color(0xFFECFDF5), borderRadius: BorderRadius.circular(6)),
                              child: const Text('ACTIVE', style: TextStyle(color: Color(0xFF047857), fontWeight: FontWeight.bold, fontSize: 9)),
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

