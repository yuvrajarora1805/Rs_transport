import 'dart:convert';
import 'package:flutter/material.dart';
import '../../core/api/api_client.dart';
import '../../core/theme/app_theme.dart';
import '../../shared/components/slip_image_picker.dart';

class SettlementsScreen extends StatefulWidget {
  const SettlementsScreen({super.key});

  @override
  State<SettlementsScreen> createState() => _SettlementsScreenState();
}

class _SettlementsScreenState extends State<SettlementsScreen> {
  List<Map<String, dynamic>> _settlements = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _loadSettlements();
  }

  Future<void> _loadSettlements() async {
    setState(() => _loading = true);
    try {
      final res = await ApiClient().get('/settlements');
      if (res.statusCode == 200 && res.data is List) {
        _settlements = List<Map<String, dynamic>>.from(res.data);
      }
    } catch (_) {}
    if (mounted) setState(() => _loading = false);
  }

  void _showNewSettlementDialog() {
    final tripNoCtrl = TextEditingController();
    final grossCtrl = TextEditingController();
    final dieselCtrl = TextEditingController();
    final advanceCtrl = TextEditingController();
    final commCtrl = TextEditingController(text: '700');
    final paidCtrl = TextEditingController();
    String? slipImage;

    showDialog(
      context: context,
      builder: (ctx) => StatefulBuilder(
        builder: (context, setDlgState) {
          final gross = double.tryParse(grossCtrl.text) ?? 0;
          final diesel = double.tryParse(dieselCtrl.text) ?? 0;
          final adv = double.tryParse(advanceCtrl.text) ?? 0;
          final comm = double.tryParse(commCtrl.text) ?? 0;
          final netPayable = gross - diesel - adv - comm;
          final paid = double.tryParse(paidCtrl.text) ?? 0;
          final balance = netPayable - paid;

          return AlertDialog(
            title: const Text('New Driver Freight Settlement Voucher', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
            content: SizedBox(
              width: 480,
              child: SingleChildScrollView(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    TextField(controller: tripNoCtrl, decoration: const InputDecoration(labelText: 'Trip No / Vehicle (e.g. RS-52133)')),
                    const SizedBox(height: 10),
                    Row(
                      children: [
                        Expanded(child: TextField(controller: grossCtrl, keyboardType: TextInputType.number, decoration: const InputDecoration(labelText: 'Gross Freight (₹)'), onChanged: (_) => setDlgState(() {}))),
                        const SizedBox(width: 10),
                        Expanded(child: TextField(controller: dieselCtrl, keyboardType: TextInputType.number, decoration: const InputDecoration(labelText: 'Diesel Advance (₹)'), onChanged: (_) => setDlgState(() {}))),
                      ],
                    ),
                    const SizedBox(height: 10),
                    Row(
                      children: [
                        Expanded(child: TextField(controller: advanceCtrl, keyboardType: TextInputType.number, decoration: const InputDecoration(labelText: 'Cash Advance (₹)'), onChanged: (_) => setDlgState(() {}))),
                        const SizedBox(width: 10),
                        Expanded(child: TextField(controller: commCtrl, keyboardType: TextInputType.number, decoration: const InputDecoration(labelText: 'Commission (₹)'), onChanged: (_) => setDlgState(() {}))),
                      ],
                    ),
                    const SizedBox(height: 10),
                    Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(color: AppColors.background, borderRadius: BorderRadius.circular(10), border: Border.all(color: AppColors.border)),
                      child: Column(
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              const Text('Net Payable:', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                              Text('₹${netPayable.toStringAsFixed(2)}', style: const TextStyle(fontWeight: FontWeight.bold, color: AppColors.primary, fontSize: 14)),
                            ],
                          ),
                          const Divider(height: 16),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              const Text('Remaining Outstanding:', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                              Text('₹${balance.toStringAsFixed(2)}', style: TextStyle(fontWeight: FontWeight.bold, color: balance > 0 ? AppColors.danger : AppColors.success, fontSize: 14)),
                            ],
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 10),
                    TextField(controller: paidCtrl, keyboardType: TextInputType.number, decoration: const InputDecoration(labelText: 'Amount Paid Now (₹)'), onChanged: (_) => setDlgState(() {})),
                    const SizedBox(height: 12),
                    SlipImagePicker(
                      label: 'Attach Signed Settlement Voucher / Bilty',
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
                  if (tripNoCtrl.text.isEmpty) return;
                  final payload = {
                    'tripNo': tripNoCtrl.text.trim(),
                    'grossFreight': gross,
                    'dieselAmount': diesel,
                    'advanceAmount': adv,
                    'commission': comm,
                    'netPayable': netPayable,
                    'totalPaid': paid,
                    'outstanding': balance,
                    'settlementDate': DateTime.now().toIso8601String().split('T')[0],
                    'slipImage': slipImage,
                  };
                  try {
                    await ApiClient().post('/settlements', data: payload);
                  } catch (_) {}
                  if (mounted) Navigator.pop(ctx);
                  _loadSettlements();
                },
                child: const Text('Save Settlement'),
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
                    Text('Driver & Trip Settlements', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                    Text('Gross Freight − Diesel Advance − Commission = Net Balance', style: TextStyle(fontSize: 12, color: AppColors.textMuted)),
                  ],
                ),
                ElevatedButton.icon(
                  onPressed: _showNewSettlementDialog,
                  icon: const Icon(Icons.add, size: 16),
                  label: const Text('New Settlement'),
                ),
              ],
            ),
            const SizedBox(height: 16),
            Expanded(
              child: _loading
                  ? const Center(child: CircularProgressIndicator())
                  : _settlements.isEmpty
                      ? const Center(child: Text('No settlements recorded.', style: TextStyle(color: AppColors.textMuted)))
                      : ListView.separated(
                          itemCount: _settlements.length,
                          separatorBuilder: (_, __) => const SizedBox(height: 8),
                          itemBuilder: (ctx, i) {
                            final s = _settlements[i];
                            final out = double.tryParse((s['outstanding'] ?? 0).toString()) ?? 0;
                            final paid = double.tryParse((s['total_paid'] ?? 0).toString()) ?? 0;
                            final hasSlip = s['slip_image'] != null && s['slip_image'] != '';

                            return Card(
                              child: ListTile(
                                leading: const CircleAvatar(backgroundColor: AppColors.background, child: Icon(Icons.receipt_long, color: AppColors.success, size: 20)),
                                title: Text(s['trip_no'] != null ? 'Trip: ${s['trip_no']}' : 'Settlement #${s['id']}', style: const TextStyle(fontWeight: FontWeight.bold)),
                                subtitle: Text('Paid: ₹${paid.toStringAsFixed(2)} • Status: ${s['status'] ?? 'SETTLED'}', style: const TextStyle(fontSize: 12)),
                                trailing: Row(
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    if (hasSlip)
                                      IconButton(
                                        icon: const Icon(Icons.image_outlined, color: AppColors.primary, size: 20),
                                        onPressed: () => _viewSlip(s['slip_image']),
                                        tooltip: 'View Settlement Voucher Photo',
                                      ),
                                    Text(
                                      out > 0 ? 'Pending: ₹${out.toStringAsFixed(2)}' : '₹0.00 (PAID)',
                                      style: TextStyle(
                                        fontWeight: FontWeight.bold,
                                        color: out > 0 ? AppColors.danger : AppColors.success,
                                        fontSize: 13,
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
        ),
      ),
    );
  }
}
