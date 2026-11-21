import 'dart:convert';
import 'package:flutter/material.dart';
import '../../core/api/api_client.dart';
import '../../core/database/local_storage.dart';
import '../../core/theme/app_theme.dart';
import '../../components/layout/erp_header.dart';
import 'new_trip_form.dart';

class TripsScreen extends StatefulWidget {
  const TripsScreen({super.key});

  @override
  State<TripsScreen> createState() => _TripsScreenState();
}

class _TripsScreenState extends State<TripsScreen> {
  bool _isCreatingNew = true;
  List<Map<String, dynamic>> _trips = [];
  bool _loading = true;
  String _search = '';

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
        final list = List<Map<String, dynamic>>.from(res.data);
        _trips = list;
        await LocalStorage().saveTrips(list);
      } else {
        _trips = await LocalStorage().getTrips();
      }
    } catch (_) {
      _trips = await LocalStorage().getTrips();
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
          title: _isCreatingNew ? 'Record New Trip' : 'Weighbridge & Freight Trips',
          subtitle: _isCreatingNew ? 'Enter weighbridge unloading weight, rate and freight details' : 'List of all verified delivery slips and freight calculations',
          actions: Row(
            children: [
              OutlinedButton.icon(
                style: OutlinedButton.styleFrom(
                  foregroundColor: _isCreatingNew ? AppColors.primary : AppColors.textMain,
                  side: BorderSide(color: _isCreatingNew ? AppColors.primary : AppColors.border),
                ),
                onPressed: () => setState(() => _isCreatingNew = true),
                icon: const Icon(Icons.add_circle_outline, size: 16),
                label: const Text('New Trip Form'),
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
                  _loadTrips();
                },
                icon: const Icon(Icons.list_alt, size: 16),
                label: Text('Trips List (${_trips.length})'),
              ),
            ],
          ),
        ),
        Expanded(
          child: _isCreatingNew
              ? NewTripFormView(
                  onSaved: () {
                    setState(() => _isCreatingNew = false);
                    _loadTrips();
                  },
                )
              : _buildListView(),
        ),
      ],
    );
  }

  Widget _buildListView() {
    final filtered = _trips.where((t) {
      final q = _search.toLowerCase();
      final truck = (t['truck_no'] ?? t['truckNo'] ?? '').toString().toLowerCase();
      final party = (t['party_name'] ?? t['partyName'] ?? '').toString().toLowerCase();
      final num = (t['trip_no'] ?? t['tripNo'] ?? '').toString().toLowerCase();
      return truck.contains(q) || party.contains(q) || num.contains(q);
    }).toList();

    return Padding(
      padding: const EdgeInsets.all(20),
      child: Column(
        children: [
          TextField(
            decoration: const InputDecoration(
              prefixIcon: Icon(Icons.search, size: 20),
              hintText: 'Search trips by truck number, party, or trip number...',
            ),
            onChanged: (v) => setState(() => _search = v),
          ),
          const SizedBox(height: 16),
          Expanded(
            child: _loading
                ? const Center(child: CircularProgressIndicator())
                : filtered.isEmpty
                    ? const Center(child: Text('No trips recorded yet.', style: TextStyle(color: AppColors.textMuted)))
                    : ListView.separated(
                        itemCount: filtered.length,
                        separatorBuilder: (_, __) => const SizedBox(height: 8),
                        itemBuilder: (ctx, i) {
                          final item = filtered[i];
                          final hasSlip = item['slip_image'] != null && item['slip_image'] != '';
                          final grossFreight = item['gross_freight'] ?? item['grossFreight'] ?? 0;
                          return Card(
                            elevation: 0,
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12), side: const BorderSide(color: AppColors.border)),
                            child: ListTile(
                              leading: const CircleAvatar(backgroundColor: Color(0xFF10B981), child: Icon(Icons.navigation, color: Colors.white, size: 18)),
                              title: Text(item['truck_no'] ?? item['truckNo'] ?? 'UNKNOWN TRUCK', style: const TextStyle(fontWeight: FontWeight.bold)),
                              subtitle: Text('Party: ${item['party_name'] ?? item['partyName'] ?? '-'} • Net: ${item['net_weight'] ?? item['netWeight'] ?? 0} MT • Rate: ₹${item['rate_per_unit'] ?? item['ratePerUnit'] ?? 0}'),
                              trailing: Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  if (hasSlip)
                                    IconButton(
                                      icon: const Icon(Icons.image_outlined, color: AppColors.primary, size: 20),
                                      onPressed: () => _viewSlip(item['slip_image']),
                                      tooltip: 'View Weighbridge Slip',
                                    ),
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                    decoration: BoxDecoration(color: const Color(0xFFEFF6FF), borderRadius: BorderRadius.circular(8)),
                                    child: Text('₹$grossFreight', style: const TextStyle(color: AppColors.primary, fontWeight: FontWeight.bold, fontSize: 13)),
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
