import 'dart:convert';
import 'package:flutter/material.dart';
import '../../core/api/api_client.dart';
import '../../core/theme/app_theme.dart';
import '../../shared/components/slip_image_picker.dart';

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

  void _showNewTripDialog() {
    final truckCtrl = TextEditingController();
    final partyCtrl = TextEditingController();
    final transCtrl = TextEditingController();
    final netWtCtrl = TextEditingController();
    final rateCtrl = TextEditingController();
    String? slipImage;

    showDialog(
      context: context,
      builder: (ctx) => StatefulBuilder(
        builder: (context, setDlgState) {
          final net = double.tryParse(netWtCtrl.text) ?? 0;
          final rate = double.tryParse(rateCtrl.text) ?? 0;
          final freight = net * rate;

          return AlertDialog(
            title: const Text('Record Factory Unloading Trip', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
            content: SizedBox(
              width: 480,
              child: SingleChildScrollView(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    TextField(controller: truckCtrl, decoration: const InputDecoration(labelText: 'Truck No (e.g. PB05AB4063)')),
                    const SizedBox(height: 10),
                    TextField(controller: partyCtrl, decoration: const InputDecoration(labelText: 'Party / Consignee')),
                    const SizedBox(height: 10),
                    TextField(controller: transCtrl, decoration: const InputDecoration(labelText: 'Unloaded on Transporter')),
                    const SizedBox(height: 10),
                    Row(
                      children: [
                        Expanded(child: TextField(controller: netWtCtrl, keyboardType: TextInputType.number, decoration: const InputDecoration(labelText: 'Net Weight (MT)'), onChanged: (_) => setDlgState(() {}))),
                        const SizedBox(width: 10),
                        Expanded(child: TextField(controller: rateCtrl, keyboardType: TextInputType.number, decoration: const InputDecoration(labelText: 'Rate per MT (₹)'), onChanged: (_) => setDlgState(() {}))),
                      ],
                    ),
                    const SizedBox(height: 10),
                    Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(color: AppColors.background, borderRadius: BorderRadius.circular(10), border: Border.all(color: AppColors.border)),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          const Text('Gross Freight:', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                          Text('₹${freight.toStringAsFixed(2)}', style: const TextStyle(fontWeight: FontWeight.bold, color: AppColors.primary, fontSize: 15)),
                        ],
                      ),
                    ),
                    const SizedBox(height: 12),
                    SlipImagePicker(
                      label: 'Attach Dharamkanta Unloading Slip',
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
                    'partyName': partyCtrl.text.trim(),
                    'transporterName': transCtrl.text.trim(),
                    'netWeight': net,
                    'ratePerUnit': rate,
                    'grossFreight': freight,
                    'unloadingDate': DateTime.now().toIso8601String().split('T')[0],
                    'slipImage': slipImage,
                  };
                  try {
                    await ApiClient().post('/trips', data: payload);
                  } catch (_) {}
                  if (mounted) Navigator.pop(ctx);
                  _loadTrips();
                },
                child: const Text('Save Trip'),
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
    return Scaffold(
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: const [
                    Text('Weighbridge & Delivery Trips', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                    Text('Track unloading weight, rate per MT, and gross freight', style: TextStyle(fontSize: 12, color: AppColors.textMuted)),
                  ],
                ),
                ElevatedButton.icon(
                  onPressed: _showNewTripDialog,
                  icon: const Icon(Icons.add, size: 16),
                  label: const Text('New Trip'),
                ),
              ],
            ),
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
                            final hasSlip = t['slip_image'] != null && t['slip_image'] != '';

                            return Card(
                              child: ListTile(
                                leading: const CircleAvatar(backgroundColor: AppColors.background, child: Icon(Icons.route, color: AppColors.primary, size: 20)),
                                title: Text(t['trip_no'] ?? 'TRIP #${t['id']}', style: const TextStyle(fontWeight: FontWeight.bold)),
                                subtitle: Text('Weight: ${netWt.toStringAsFixed(2)} MT • Unload: ${t['unloading_date'] ?? '-'}', style: const TextStyle(fontSize: 12)),
                                trailing: Row(
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    if (hasSlip)
                                      IconButton(
                                        icon: const Icon(Icons.image_outlined, color: AppColors.primary, size: 20),
                                        onPressed: () => _viewSlip(t['slip_image']),
                                        tooltip: 'View Weighbridge Slip',
                                      ),
                                    Text('₹${freight.toStringAsFixed(2)}', style: const TextStyle(fontWeight: FontWeight.bold, color: AppColors.textMain, fontSize: 13)),
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
