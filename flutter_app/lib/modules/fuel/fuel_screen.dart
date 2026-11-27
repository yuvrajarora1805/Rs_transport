import 'dart:convert';
import 'package:flutter/material.dart';
import '../../core/api/api_client.dart';
import '../../core/theme/app_theme.dart';
import '../../components/layout/erp_header.dart';
import '../../context/navigation_context.dart';
import '../../shared/components/module_mobile_search_header.dart';
import 'new_fuel_form.dart';
import 'fuel_table_row.dart';
import 'fuel_mobile_card.dart';

class FuelScreen extends StatefulWidget {
  final Function(int)? onNavigate;
  const FuelScreen({super.key, this.onNavigate});

  @override
  State<FuelScreen> createState() => _FuelScreenState();
}

class _FuelScreenState extends State<FuelScreen> {
  bool _isCreatingNew = false;
  Map<String, dynamic>? _prefillParams;
  List<Map<String, dynamic>> _fuelRecords = [];
  bool _loading = true;
  String _search = '';

  @override
  void initState() {
    super.initState();
    NavigationContext().addListener(_onNavParamsChanged);
    _checkPendingNav();
    _loadFuel();
  }

  @override
  void dispose() {
    NavigationContext().removeListener(_onNavParamsChanged);
    super.dispose();
  }

  void _onNavParamsChanged() {
    if (NavigationContext().currentIndex == 3) _checkPendingNav();
  }

  void _checkPendingNav() {
    final params = NavigationContext().consumeParams();
    if (params.isNotEmpty) {
      setState(() {
        _isCreatingNew = true;
        _prefillParams = params;
      });
    }
  }

  Future<void> _loadFuel() async {
    setState(() => _loading = true);
    try {
      final res = await ApiClient().get('/fuel');
      if (mounted && res.data is List) {
        setState(() => _fuelRecords = List<Map<String, dynamic>>.from(res.data));
      }
    } catch (_) {} finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<void> _deleteFuel(String? id) async {
    if (id == null) return;
    final confirm = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Delete Fuel Memo', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
        content: const Text('Are you sure you want to remove this fuel slip record?'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Cancel')),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFFE11D48)),
            onPressed: () => Navigator.pop(ctx, true),
            child: const Text('Delete', style: TextStyle(color: Colors.white)),
          ),
        ],
      ),
    );
    if (confirm == true) {
      try {
        await ApiClient().delete('/fuel/$id');
        _loadFuel();
      } catch (_) {}
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
          title: 'Fuel & Diesel Register',
          subtitle: 'All recorded diesel slips, pump balances & truck deductions',
          actions: ElevatedButton.icon(
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.primary,
              foregroundColor: Colors.white,
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
            ),
            onPressed: () => setState(() {
              _isCreatingNew = !_isCreatingNew;
              _prefillParams = null;
            }),
            icon: Icon(_isCreatingNew ? Icons.list_alt : Icons.add_circle_outline, size: 15),
            label: Text(_isCreatingNew ? 'View Slips' : '+ Issue Fuel', style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
          ),
        ),
        Expanded(
          child: _isCreatingNew
              ? NewFuelFormView(
                  initialParams: _prefillParams,
                  onSaved: () {
                    setState(() {
                      _isCreatingNew = false;
                      _prefillParams = null;
                    });
                    _loadFuel();
                  },
                )
              : _buildResponsiveView(),
        ),
      ],
    );
  }

  Widget _buildResponsiveView() {
    final q = _search.toLowerCase();
    final filtered = _fuelRecords.where((f) {
      final truck = (f['truck_no'] ?? f['truckNo'] ?? '').toString().toLowerCase();
      final pump = (f['pump_name'] ?? f['pump'] ?? '').toString().toLowerCase();
      final trip = (f['trip_no'] ?? f['tripNo'] ?? '').toString().toLowerCase();
      return truck.contains(q) || pump.contains(q) || trip.contains(q);
    }).toList();

    return LayoutBuilder(
      builder: (context, constraints) {
        final isMobile = constraints.maxWidth < 768;
        if (isMobile) {
          return Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            child: Column(
              children: [
                ModuleMobileSearchHeader(
                  search: _search,
                  onSearchChanged: (v) => setState(() => _search = v),
                  count: filtered.length,
                  total: _fuelRecords.length,
                  hintText: 'Search truck, pump, memo...',
                ),
                const SizedBox(height: 8),
                Expanded(
                  child: _loading
                      ? const Center(child: CircularProgressIndicator())
                      : filtered.isEmpty
                          ? const Center(child: Text('No fuel records found', style: TextStyle(color: AppColors.textMuted)))
                          : ListView.builder(
                              itemCount: filtered.length,
                              itemBuilder: (ctx, i) => FuelMobileCard(
                                fuel: filtered[i],
                                onViewSlip: () => _viewSlip(filtered[i]['slip_image']),
                                onDelete: () => _deleteFuel(filtered[i]['id']?.toString()),
                              ),
                            ),
                ),
              ],
            ),
          );
        }

        return Padding(
          padding: const EdgeInsets.all(16),
          child: Container(
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: const Color(0xFFE2E8F0)),
            ),
            clipBehavior: Clip.antiAlias,
            child: Column(
              children: [
                _buildDesktopSearchHeader(filtered.length),
                _buildTableHeader(),
                Expanded(
                  child: _loading
                      ? const Center(child: CircularProgressIndicator())
                      : filtered.isEmpty
                          ? const Center(child: Text('No fuel records found', style: TextStyle(color: AppColors.textMuted)))
                          : ListView.builder(
                              itemCount: filtered.length,
                              itemBuilder: (ctx, i) => FuelTableRow(
                                fuel: filtered[i],
                                onViewSlip: () => _viewSlip(filtered[i]['slip_image']),
                                onDelete: () => _deleteFuel(filtered[i]['id']?.toString()),
                              ),
                            ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _buildDesktopSearchHeader(int count) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: const BoxDecoration(
        color: Color(0xFFF8FAFC),
        border: Border(bottom: BorderSide(color: Color(0xFFE2E8F0))),
      ),
      child: Row(
        children: [
          Expanded(
            child: SizedBox(
              height: 38,
              child: TextField(
                decoration: InputDecoration(
                  hintText: 'Search by truck plate, pump station, or memo slip #...',
                  hintStyle: const TextStyle(fontSize: 12, color: Color(0xFF94A3B8)),
                  prefixIcon: const Icon(Icons.search, size: 18, color: Color(0xFF64748B)),
                  filled: true,
                  fillColor: Colors.white,
                  contentPadding: EdgeInsets.zero,
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: const BorderSide(color: Color(0xFFCBD5E1))),
                  enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: const BorderSide(color: Color(0xFFCBD5E1))),
                ),
                style: const TextStyle(fontSize: 12),
                onChanged: (v) => setState(() => _search = v),
              ),
            ),
          ),
          const SizedBox(width: 16),
          Text('Showing $count of ${_fuelRecords.length} records', style: const TextStyle(fontSize: 11, color: Color(0xFF64748B))),
        ],
      ),
    );
  }

  Widget _buildTableHeader() {
    return Container(
      color: const Color(0xFFF8FAFC),
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
      child: const Row(
        children: [
          SizedBox(width: 105, child: Text('DATE', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 10, color: Color(0xFF64748B)))),
          SizedBox(width: 120, child: Text('TRUCK NO', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 10, color: Color(0xFF64748B)))),
          Expanded(flex: 2, child: Text('PETROL PUMP', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 10, color: Color(0xFF64748B)))),
          SizedBox(width: 100, child: Text('TRIP REF', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 10, color: Color(0xFF64748B)))),
          SizedBox(width: 80, child: Text('LITRES', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 10, color: Color(0xFF64748B)))),
          SizedBox(width: 80, child: Text('RATE (₹/L)', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 10, color: Color(0xFF64748B)))),
          SizedBox(width: 110, child: Text('AMOUNT', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 10, color: Color(0xFF64748B)))),
          SizedBox(width: 100, child: Text('RECEIPT', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 10, color: Color(0xFF64748B)))),
          SizedBox(width: 95, child: Text('STATUS', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 10, color: Color(0xFF64748B)))),
          SizedBox(width: 50, child: Text('ACTION', textAlign: TextAlign.right, style: TextStyle(fontWeight: FontWeight.bold, fontSize: 10, color: Color(0xFF64748B)))),
        ],
      ),
    );
  }
}
