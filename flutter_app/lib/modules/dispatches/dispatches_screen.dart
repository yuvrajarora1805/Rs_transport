import 'dart:convert';
import 'package:flutter/material.dart';
import '../../core/api/api_client.dart';
import '../../core/database/local_storage.dart';
import '../../core/theme/app_theme.dart';
import 'new_dispatch_form.dart';

class DispatchesScreen extends StatefulWidget {
  const DispatchesScreen({super.key});

  @override
  State<DispatchesScreen> createState() => _DispatchesScreenState();
}

class _DispatchesScreenState extends State<DispatchesScreen> {
  bool _isCreatingNew = true;
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
      _dispatches = await LocalStorage().getDispatches();
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  void _viewSlip(String? slipImg) {
    if (slipImg == null || slipImg.isEmpty) return;
    final b64 = slipImg.contains(',') ? slipImg.split(',')[1] : slipImg;
    showDialog(
      context: context,
      builder: (ctx) => Dialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        child: ClipRRect(
          borderRadius: BorderRadius.circular(16),
          child: Image.memory(base64Decode(b64), fit: BoxFit.contain),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: PreferredSize(
        preferredSize: const Size.fromHeight(60),
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
          decoration: const BoxDecoration(
            color: Colors.white,
            border: Border(bottom: BorderSide(color: AppColors.border)),
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(
                    _isCreatingNew ? 'Add New Dispatch' : 'Dispatch Orders Fleet',
                    style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: AppColors.textMain),
                  ),
                  Text(
                    _isCreatingNew ? 'Record truck departure, load details & destination slips' : 'Track and manage outbound fleet orders',
                    style: const TextStyle(fontSize: 12, color: AppColors.textMuted),
                  ),
                ],
              ),
              Row(
                children: [
                  OutlinedButton.icon(
                    style: OutlinedButton.styleFrom(
                      foregroundColor: _isCreatingNew ? AppColors.primary : AppColors.textMain,
                      side: BorderSide(color: _isCreatingNew ? AppColors.primary : AppColors.border),
                    ),
                    onPressed: () => setState(() => _isCreatingNew = true),
                    icon: const Icon(Icons.add_circle_outline, size: 16),
                    label: const Text('New Dispatch Form'),
                  ),
                  const SizedBox(width: 10),
                  ElevatedButton.icon(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: !_isCreatingNew ? AppColors.primary : AppColors.background,
                      foregroundColor: !_isCreatingNew ? Colors.white : AppColors.textMain,
                      elevation: 0,
                    ),
                    onPressed: () {
                      setState(() => _isCreatingNew = false);
                      _loadDispatches();
                    },
                    icon: const Icon(Icons.list_alt, size: 16),
                    label: Text('Orders List (${_dispatches.length})'),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
      body: _isCreatingNew
          ? NewDispatchFormView(
              onSaved: () {
                setState(() => _isCreatingNew = false);
                _loadDispatches();
              },
            )
          : _buildListView(),
    );
  }

  Widget _buildListView() {
    final filtered = _dispatches.where((d) {
      final q = _search.toLowerCase();
      final t = (d['truck_no'] ?? d['truckNo'] ?? '').toString().toLowerCase();
      final dest = (d['destination'] ?? '').toString().toLowerCase();
      final sr = (d['sr_no'] ?? d['srNo'] ?? '').toString().toLowerCase();
      return t.contains(q) || dest.contains(q) || sr.contains(q);
    }).toList();

    return Padding(
      padding: const EdgeInsets.all(20),
      child: Column(
        children: [
          TextField(
            decoration: const InputDecoration(
              prefixIcon: Icon(Icons.search, size: 20),
              hintText: 'Search by truck number, destination, or SR ref...',
            ),
            onChanged: (v) => setState(() => _search = v),
          ),
          const SizedBox(height: 16),
          Expanded(
            child: _loading
                ? const Center(child: CircularProgressIndicator())
                : filtered.isEmpty
                    ? const Center(child: Text('No dispatches recorded yet.', style: TextStyle(color: AppColors.textMuted)))
                    : ListView.separated(
                        itemCount: filtered.length,
                        separatorBuilder: (_, __) => const SizedBox(height: 8),
                        itemBuilder: (ctx, i) {
                          final item = filtered[i];
                          final hasSlip = item['slip_image'] != null && item['slip_image'] != '';
                          return Card(
                            elevation: 0,
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12), side: const BorderSide(color: AppColors.border)),
                            child: ListTile(
                              leading: const CircleAvatar(backgroundColor: AppColors.primary, child: Icon(Icons.local_shipping, color: Colors.white, size: 18)),
                              title: Text(item['truck_no'] ?? item['truckNo'] ?? 'UNKNOWN TRUCK', style: const TextStyle(fontWeight: FontWeight.bold)),
                              subtitle: Text('Dest: ${item['destination'] ?? '-'} • Date: ${item['date'] ?? '-'} • SR: ${item['sr_no'] ?? item['srNo'] ?? '-'}', style: const TextStyle(fontSize: 12)),
                              trailing: Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  if (hasSlip)
                                    IconButton(
                                      icon: const Icon(Icons.image_outlined, color: AppColors.primary, size: 20),
                                      onPressed: () => _viewSlip(item['slip_image']),
                                      tooltip: 'View Bilty / Scale Slip',
                                    ),
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                    decoration: BoxDecoration(color: AppColors.primary.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(8)),
                                    child: Text('${item['bales'] ?? 0} Bales', style: const TextStyle(color: AppColors.primary, fontWeight: FontWeight.bold, fontSize: 12)),
                                  ),
                                ],
                              ),
                            ),
                          );
                        },
                      ),
          ),
        ],
      ),
    );
  }
}
