import 'dart:convert';
import 'package:flutter/material.dart';
import '../../core/api/api_client.dart';
import '../../core/database/local_storage.dart';
import '../../core/theme/app_theme.dart';
import '../../shared/components/slip_image_picker.dart';

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
      _dispatches = await LocalStorage().getDispatches();
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  void _showNewDispatchDialog() {
    final truckCtrl = TextEditingController();
    final balesCtrl = TextEditingController();
    final destCtrl = TextEditingController();
    final grossCtrl = TextEditingController();
    final tareCtrl = TextEditingController();
    final phoneCtrl = TextEditingController();
    String? slipImage;
    String commodity = 'Cotton Bales';

    showDialog(
      context: context,
      builder: (ctx) => StatefulBuilder(
        builder: (context, setDlgState) {
          final gross = double.tryParse(grossCtrl.text) ?? 0;
          final tare = double.tryParse(tareCtrl.text) ?? 0;
          final net = gross > tare ? (gross - tare) : 0.0;

          return AlertDialog(
            title: const Text('New Dispatch Gate Pass', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
            content: SizedBox(
              width: 480,
              child: SingleChildScrollView(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    TextField(controller: truckCtrl, decoration: const InputDecoration(labelText: 'Truck No (e.g. RJ07GE0525)')),
                    const SizedBox(height: 10),
                    Row(
                      children: [
                        Expanded(
                          child: DropdownButtonFormField<String>(
                            value: commodity,
                            decoration: const InputDecoration(labelText: 'Commodity'),
                            items: ['Cotton Bales', 'Paddy', 'Mustard', 'Wheat'].map((c) => DropdownMenuItem(value: c, child: Text(c))).toList(),
                            onChanged: (v) => setDlgState(() => commodity = v ?? 'Cotton Bales'),
                          ),
                        ),
                        const SizedBox(width: 10),
                        Expanded(child: TextField(controller: balesCtrl, keyboardType: TextInputType.number, decoration: const InputDecoration(labelText: 'Bales Count'))),
                      ],
                    ),
                    const SizedBox(height: 10),
                    TextField(controller: destCtrl, decoration: const InputDecoration(labelText: 'Destination / Mill')),
                    const SizedBox(height: 10),
                    Row(
                      children: [
                        Expanded(child: TextField(controller: grossCtrl, keyboardType: TextInputType.number, decoration: const InputDecoration(labelText: 'Gross MT'), onChanged: (_) => setDlgState(() {}))),
                        const SizedBox(width: 8),
                        Expanded(child: TextField(controller: tareCtrl, keyboardType: TextInputType.number, decoration: const InputDecoration(labelText: 'Tare MT'), onChanged: (_) => setDlgState(() {}))),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Container(
                            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 14),
                            decoration: BoxDecoration(color: AppColors.background, borderRadius: BorderRadius.circular(10), border: Border.all(color: AppColors.border)),
                            child: Text('Net: ${net.toStringAsFixed(2)}', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12)),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 10),
                    TextField(controller: phoneCtrl, keyboardType: TextInputType.phone, decoration: const InputDecoration(labelText: 'Driver Mobile')),
                    const SizedBox(height: 12),
                    SlipImagePicker(
                      label: 'Attach Dharamkanta Slip Photo',
                      onImageSelected: (b64) => slipImage = b64,
                    ),
                  ],
                ),
              ),
            ),
            actions: [
              TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cancel')),
              ElevatedButton(
                onPressed: () async {
                  if (truckCtrl.text.isEmpty) return;
                  final payload = {
                    'truckNo': truckCtrl.text.trim().toUpperCase(),
                    'material': commodity,
                    'bales': double.tryParse(balesCtrl.text) ?? 0,
                    'destination': destCtrl.text.trim(),
                    'driverMobile': phoneCtrl.text.trim(),
                    'date': DateTime.now().toIso8601String().split('T')[0],
                    'slipImage': slipImage,
                  };
                  try {
                    await ApiClient().post('/dispatches', data: payload);
                  } catch (_) {
                    await LocalStorage().queueOfflineAction('dispatches', 'CREATE', payload);
                  }
                  if (mounted) Navigator.pop(ctx);
                  _loadDispatches();
                },
                child: const Text('Save Dispatch'),
              ),
            ],
          );
        },
      ),
    );
  }

  void _viewSlip(String? slipImg) {
    if (slipImg == null) return;
    final b64 = slipImg.contains(',') ? slipImg.split(',')[1] : slipImg;
    showDialog(
      context: context,
      builder: (ctx) => Dialog(
        child: ClipRRect(
          borderRadius: BorderRadius.circular(12),
          child: Image.memory(base64Decode(b64), fit: BoxFit.contain),
        ),
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
                    decoration: const InputDecoration(prefixIcon: Icon(Icons.search, size: 20), hintText: 'Search truck number or destination...'),
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
                            final hasSlip = item['slip_image'] != null && item['slip_image'] != '';
                            return Card(
                              child: ListTile(
                                leading: const CircleAvatar(backgroundColor: AppColors.primary, child: Icon(Icons.local_shipping, color: Colors.white, size: 20)),
                                title: Text(item['truck_no'] ?? item['truckNo'] ?? 'UNKNOWN TRUCK', style: const TextStyle(fontWeight: FontWeight.bold)),
                                subtitle: Text('Dest: ${item['destination'] ?? '-'} • Date: ${item['date'] ?? '-'}', style: const TextStyle(fontSize: 12)),
                                trailing: Row(
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    if (hasSlip)
                                      IconButton(
                                        icon: const Icon(Icons.image_outlined, color: AppColors.primary, size: 20),
                                        onPressed: () => _viewSlip(item['slip_image']),
                                        tooltip: 'View Scale Slip Photo',
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
      ),
    );
  }
}
