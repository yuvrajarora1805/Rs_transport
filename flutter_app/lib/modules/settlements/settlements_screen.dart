import 'dart:convert';
import 'package:flutter/material.dart';
import '../../core/api/api_client.dart';
import '../../core/database/local_storage.dart';
import '../../core/theme/app_theme.dart';
import '../../components/layout/erp_header.dart';
import 'new_settlement_form.dart';

class SettlementsScreen extends StatefulWidget {
  const SettlementsScreen({super.key});

  @override
  State<SettlementsScreen> createState() => _SettlementsScreenState();
}

class _SettlementsScreenState extends State<SettlementsScreen> {
  bool _isCreatingNew = true;
  List<Map<String, dynamic>> _settlements = [];
  bool _loading = true;
  String _search = '';

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
        final list = List<Map<String, dynamic>>.from(res.data);
        _settlements = list;
        await LocalStorage().saveSettlements(list);
      } else {
        _settlements = await LocalStorage().getSettlements();
      }
    } catch (_) {
      _settlements = await LocalStorage().getSettlements();
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
    return Column(
      children: [
        ERPHeader(
          title: _isCreatingNew ? 'Create Trip Settlement' : 'Driver Freight Settlements',
          subtitle: _isCreatingNew ? 'Calculate freight deductions, commission & net payable balance' : 'List of all settled freight trips and driver vouchers',
          actions: Row(
            children: [
              OutlinedButton.icon(
                style: OutlinedButton.styleFrom(
                  foregroundColor: _isCreatingNew ? AppColors.primary : AppColors.textMain,
                  side: BorderSide(color: _isCreatingNew ? AppColors.primary : AppColors.border),
                ),
                onPressed: () => setState(() => _isCreatingNew = true),
                icon: const Icon(Icons.add_circle_outline, size: 16),
                label: const Text('New Settlement'),
              ),
              const SizedBox(width: 8),
              ElevatedButton.icon(
                style: ElevatedButton.styleFrom(
                  backgroundColor: !_isCreatingNew ? AppColors.primary : AppColors.background,
                  foregroundColor: !_isCreatingNew ? Colors.white : AppColors.textMain,
                  elevation: 0,
                ),
                onPressed: () {
                  setState(() => _isCreatingNew = false);
                  _loadSettlements();
                },
                icon: const Icon(Icons.list_alt, size: 16),
                label: Text('Settled List (${_settlements.length})'),
              ),
            ],
          ),
        ),
        Expanded(
          child: _isCreatingNew
              ? NewSettlementFormView(
                  onSaved: () {
                    setState(() => _isCreatingNew = false);
                    _loadSettlements();
                  },
                )
              : _buildListView(),
        ),
      ],
    );
  }

  Widget _buildListView() {
    final filtered = _settlements.where((s) {
      final q = _search.toLowerCase();
      final truck = (s['truck_no'] ?? s['truckNo'] ?? '').toString().toLowerCase();
      final id = (s['id'] ?? '').toString().toLowerCase();
      return truck.contains(q) || id.contains(q);
    }).toList();

    return Padding(
      padding: const EdgeInsets.all(20),
      child: Column(
        children: [
          TextField(
            decoration: const InputDecoration(
              prefixIcon: Icon(Icons.search, size: 20),
              hintText: 'Search settlements by truck plate or voucher ID...',
            ),
            onChanged: (v) => setState(() => _search = v),
          ),
          const SizedBox(height: 16),
          Expanded(
            child: _loading
                ? const Center(child: CircularProgressIndicator())
                : filtered.isEmpty
                    ? const Center(child: Text('No settlements recorded yet.', style: TextStyle(color: AppColors.textMuted)))
                    : ListView.separated(
                        itemCount: filtered.length,
                        separatorBuilder: (_, __) => const SizedBox(height: 8),
                        itemBuilder: (ctx, i) {
                          final item = filtered[i];
                          final hasSlip = item['slip_image'] != null && item['slip_image'] != '';
                          final payable = item['net_payable'] ?? item['netPayable'] ?? 0;
                          return Card(
                            elevation: 0,
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12), side: const BorderSide(color: AppColors.border)),
                            child: ListTile(
                              leading: const CircleAvatar(backgroundColor: Color(0xFF6366F1), child: Icon(Icons.fact_check, color: Colors.white, size: 18)),
                              title: Text(item['truck_no'] ?? item['truckNo'] ?? 'TRUCK SETTLEMENT', style: const TextStyle(fontWeight: FontWeight.bold)),
                              subtitle: Text('Diesel: ₹${item['diesel_amount'] ?? 0} • Advance: ₹${item['advance_amount'] ?? 0} • Comm: ₹${item['commission'] ?? 0}'),
                              trailing: Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  if (hasSlip)
                                    IconButton(
                                      icon: const Icon(Icons.image_outlined, color: AppColors.primary, size: 20),
                                      onPressed: () => _viewSlip(item['slip_image']),
                                      tooltip: 'View Settlement Slip',
                                    ),
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                    decoration: BoxDecoration(color: const Color(0xFFECFDF5), borderRadius: BorderRadius.circular(8)),
                                    child: Text('₹$payable', style: const TextStyle(color: Color(0xFF047857), fontWeight: FontWeight.bold, fontSize: 13)),
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
