import 'dart:convert';
import 'package:flutter/material.dart';
import '../../core/api/api_client.dart';
import '../../core/theme/app_theme.dart';
import '../../shared/components/slip_image_picker.dart';

class FuelScreen extends StatefulWidget {
  const FuelScreen({super.key});

  @override
  State<FuelScreen> createState() => _FuelScreenState();
}

class _FuelScreenState extends State<FuelScreen> {
  List<Map<String, dynamic>> _fuelTransactions = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _loadFuelTransactions();
  }

  Future<void> _loadFuelTransactions() async {
    setState(() => _loading = true);
    try {
      final res = await ApiClient().get('/fuel');
      if (res.statusCode == 200 && res.data is List) {
        _fuelTransactions = List<Map<String, dynamic>>.from(res.data);
      }
    } catch (_) {}
    if (mounted) setState(() => _loading = false);
  }

  void _showNewFuelDialog() {
    final truckCtrl = TextEditingController();
    final slipCtrl = TextEditingController();
    final ltrCtrl = TextEditingController();
    final rateCtrl = TextEditingController();
    String pumpName = 'NAYARA';
    String? slipImage;

    showDialog(
      context: context,
      builder: (ctx) => StatefulBuilder(
        builder: (context, setDlgState) {
          final ltr = double.tryParse(ltrCtrl.text) ?? 0;
          final rate = double.tryParse(rateCtrl.text) ?? 0;
          final total = ltr * rate;

          return AlertDialog(
            title: const Text('Record Diesel Pump Advance Slip', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
            content: SizedBox(
              width: 480,
              child: SingleChildScrollView(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    DropdownButtonFormField<String>(
                      value: pumpName,
                      decoration: const InputDecoration(labelText: 'Select Petrol Pump'),
                      items: ['NAYARA', 'RELIANCE', 'HPCL', 'IOCL', 'BPCL'].map((p) => DropdownMenuItem(value: p, child: Text(p))).toList(),
                      onChanged: (v) => setDlgState(() => pumpName = v ?? 'NAYARA'),
                    ),
                    const SizedBox(height: 10),
                    TextField(controller: truckCtrl, decoration: const InputDecoration(labelText: 'Truck No (e.g. RJ31GB9292)')),
                    const SizedBox(height: 10),
                    TextField(controller: slipCtrl, decoration: const InputDecoration(labelText: 'Pump Slip / Invoice No')),
                    const SizedBox(height: 10),
                    Row(
                      children: [
                        Expanded(child: TextField(controller: ltrCtrl, keyboardType: TextInputType.number, decoration: const InputDecoration(labelText: 'Liters'), onChanged: (_) => setDlgState(() {}))),
                        const SizedBox(width: 10),
                        Expanded(child: TextField(controller: rateCtrl, keyboardType: TextInputType.number, decoration: const InputDecoration(labelText: 'Rate / L (₹)'), onChanged: (_) => setDlgState(() {}))),
                      ],
                    ),
                    const SizedBox(height: 10),
                    Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(color: AppColors.background, borderRadius: BorderRadius.circular(10), border: Border.all(color: AppColors.border)),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          const Text('Total Diesel Amount:', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                          Text('₹${total.toStringAsFixed(2)}', style: const TextStyle(fontWeight: FontWeight.bold, color: AppColors.warning, fontSize: 15)),
                        ],
                      ),
                    ),
                    const SizedBox(height: 12),
                    SlipImagePicker(
                      label: 'Attach Stamped Pump Cash Memo Photo',
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
                    'pumpName': pumpName,
                    'truckNo': truckCtrl.text.trim().toUpperCase(),
                    'slipNo': slipCtrl.text.trim(),
                    'liters': ltr,
                    'rate': rate,
                    'amount': total,
                    'fuelType': 'Diesel',
                    'slipDate': DateTime.now().toIso8601String().split('T')[0],
                    'slipImage': slipImage,
                  };
                  try {
                    await ApiClient().post('/fuel', data: payload);
                  } catch (_) {}
                  if (mounted) Navigator.pop(ctx);
                  _loadFuelTransactions();
                },
                child: const Text('Save Fuel Slip'),
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
                    Text('Petrol Pump & Diesel Advances', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                    Text('Direct fuel slip issuance and pump ledger reconciliations', style: TextStyle(fontSize: 12, color: AppColors.textMuted)),
                  ],
                ),
                ElevatedButton.icon(
                  onPressed: _showNewFuelDialog,
                  icon: const Icon(Icons.add, size: 16),
                  label: const Text('Record Fuel'),
                ),
              ],
            ),
            const SizedBox(height: 16),
            Expanded(
              child: _loading
                  ? const Center(child: CircularProgressIndicator())
                  : _fuelTransactions.isEmpty
                      ? const Center(child: Text('No fuel records.', style: TextStyle(color: AppColors.textMuted)))
                      : ListView.separated(
                          itemCount: _fuelTransactions.length,
                          separatorBuilder: (_, __) => const SizedBox(height: 8),
                          itemBuilder: (ctx, i) {
                            final f = _fuelTransactions[i];
                            final ltr = double.tryParse((f['liters'] ?? 0).toString()) ?? 0;
                            final amt = double.tryParse((f['amount'] ?? 0).toString()) ?? 0;
                            final hasSlip = f['slip_image'] != null && f['slip_image'] != '';

                            return Card(
                              child: ListTile(
                                leading: const CircleAvatar(backgroundColor: AppColors.background, child: Icon(Icons.local_gas_station, color: AppColors.warning, size: 20)),
                                title: Text(f['truck_no'] ?? 'TRUCK DIESEL', style: const TextStyle(fontWeight: FontWeight.bold)),
                                subtitle: Text('Pump: ${f['pump_name'] ?? 'NAYARA'} • Liters: ${ltr.toStringAsFixed(1)} L • Slip: ${f['slip_no'] ?? '-'}', style: const TextStyle(fontSize: 12)),
                                trailing: Row(
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    if (hasSlip)
                                      IconButton(
                                        icon: const Icon(Icons.image_outlined, color: AppColors.primary, size: 20),
                                        onPressed: () => _viewSlip(f['slip_image']),
                                        tooltip: 'View Pump Receipt Photo',
                                      ),
                                    Text('₹${amt.toStringAsFixed(2)}', style: const TextStyle(fontWeight: FontWeight.bold, color: AppColors.textMain, fontSize: 13)),
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
