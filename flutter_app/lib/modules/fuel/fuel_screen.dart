import 'dart:convert';
import 'package:flutter/material.dart';
import '../../core/api/api_client.dart';
import '../../core/database/local_storage.dart';
import '../../core/theme/app_theme.dart';
import '../../components/layout/erp_header.dart';
import 'new_fuel_form.dart';

class FuelScreen extends StatefulWidget {
  const FuelScreen({super.key});

  @override
  State<FuelScreen> createState() => _FuelScreenState();
}

class _FuelScreenState extends State<FuelScreen> {
  bool _isCreatingNew = true;
  List<Map<String, dynamic>> _slips = [];
  bool _loading = true;
  String _search = '';

  @override
  void initState() {
    super.initState();
    _loadFuel();
  }

  Future<void> _loadFuel() async {
    setState(() => _loading = true);
    try {
      final res = await ApiClient().get('/fuel');
      if (res.statusCode == 200 && res.data is List) {
        final list = List<Map<String, dynamic>>.from(res.data);
        _slips = list;
        await LocalStorage().saveFuel(list);
      } else {
        _slips = await LocalStorage().getFuel();
      }
    } catch (_) {
      _slips = await LocalStorage().getFuel();
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
          title: _isCreatingNew ? 'Add Diesel Entry' : 'Fuel & Diesel Ledger',
          subtitle: _isCreatingNew ? 'Record fuel slip, link truck & update pump ledger' : 'List of fuel dispense slips across registered petrol pumps',
          actions: Row(
            children: [
              OutlinedButton.icon(
                style: OutlinedButton.styleFrom(
                  foregroundColor: _isCreatingNew ? AppColors.primary : AppColors.textMain,
                  side: BorderSide(color: _isCreatingNew ? AppColors.primary : AppColors.border),
                ),
                onPressed: () => setState(() => _isCreatingNew = true),
                icon: const Icon(Icons.add_circle_outline, size: 16),
                label: const Text('New Fuel Entry'),
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
                  _loadFuel();
                },
                icon: const Icon(Icons.list_alt, size: 16),
                label: Text('Slips List (${_slips.length})'),
              ),
            ],
          ),
        ),
        Expanded(
          child: _isCreatingNew
              ? NewFuelFormView(
                  onSaved: () {
                    setState(() => _isCreatingNew = false);
                    _loadFuel();
                  },
                )
              : _buildListView(),
        ),
      ],
    );
  }

  Widget _buildListView() {
    final filtered = _slips.where((s) {
      final q = _search.toLowerCase();
      final truck = (s['truck_no'] ?? s['truckNo'] ?? '').toString().toLowerCase();
      final pump = (s['pump_name'] ?? s['pumpName'] ?? '').toString().toLowerCase();
      return truck.contains(q) || pump.contains(q);
    }).toList();

    return Padding(
      padding: const EdgeInsets.all(20),
      child: Column(
        children: [
          TextField(
            decoration: const InputDecoration(
              prefixIcon: Icon(Icons.search, size: 20),
              hintText: 'Search by truck plate, pump name...',
            ),
            onChanged: (v) => setState(() => _search = v),
          ),
          const SizedBox(height: 16),
          Expanded(
            child: _loading
                ? const Center(child: CircularProgressIndicator())
                : filtered.isEmpty
                    ? const Center(child: Text('No fuel slips recorded yet.', style: TextStyle(color: AppColors.textMuted)))
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
                              leading: const CircleAvatar(backgroundColor: Color(0xFFF59E0B), child: Icon(Icons.local_gas_station, color: Colors.white, size: 18)),
                              title: Text(item['truck_no'] ?? item['truckNo'] ?? 'UNKNOWN TRUCK', style: const TextStyle(fontWeight: FontWeight.bold)),
                              subtitle: Text('Pump: ${item['pump_name'] ?? item['pumpName'] ?? '-'} • Date: ${item['date'] ?? '-'} • Qty: ${item['liters'] ?? 0} L'),
                              trailing: Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  if (hasSlip)
                                    IconButton(
                                      icon: const Icon(Icons.image_outlined, color: AppColors.primary, size: 20),
                                      onPressed: () => _viewSlip(item['slip_image']),
                                      tooltip: 'View Receipt',
                                    ),
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                    decoration: BoxDecoration(color: const Color(0xFFFFFBEB), borderRadius: BorderRadius.circular(8)),
                                    child: Text('₹${item['amount'] ?? 0}', style: const TextStyle(color: Color(0xFFB45309), fontWeight: FontWeight.bold, fontSize: 13)),
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
