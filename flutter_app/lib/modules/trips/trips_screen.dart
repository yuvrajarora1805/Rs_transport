import 'dart:convert';
import 'package:flutter/material.dart';
import '../../core/api/api_client.dart';
import '../../core/theme/app_theme.dart';
import '../../components/layout/erp_header.dart';
import '../../context/company_context.dart';
import '../../context/navigation_context.dart';
import 'new_trip_form.dart';
import 'trip_table_row.dart';
import 'trip_mobile_card.dart';
import 'trip_filter_bar.dart';

class TripsScreen extends StatefulWidget {
  final Function(int)? onNavigate;
  const TripsScreen({super.key, this.onNavigate});

  @override
  State<TripsScreen> createState() => _TripsScreenState();
}

class _TripsScreenState extends State<TripsScreen> {
  bool _isCreatingNew = false;
  Map<String, dynamic>? _prefillParams;
  List<Map<String, dynamic>> _trips = [];
  bool _loading = true;
  String _search = '';
  DateTime? _startDate;
  DateTime? _endDate;

  @override
  void initState() {
    super.initState();
    NavigationContext().addListener(_onNavParamsChanged);
    CompanyState().addListener(_loadTrips);
    _checkPendingNav();
    _loadTrips();
  }

  @override
  void dispose() {
    NavigationContext().removeListener(_onNavParamsChanged);
    CompanyState().removeListener(_loadTrips);
    super.dispose();
  }

  void _onNavParamsChanged() {
    if (NavigationContext().currentIndex == 2) _checkPendingNav();
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

  Future<void> _loadTrips() async {
    if (!mounted) return;
    setState(() => _loading = true);
    try {
      final code = CompanyState().activeCompany.codeStr;
      final res = await ApiClient().get('/trips?companyCode=$code');
      if (mounted && res.data is List) {
        setState(() => _trips = List<Map<String, dynamic>>.from(res.data));
      }
    } catch (_) {} finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<void> _deleteTrip(String? id) async {
    if (id == null) return;
    final confirm = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Delete Trip Entry', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
        content: const Text('Are you sure you want to delete this trip weighbridge record? Linked settlements and advances will also be cleared.'),
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
        await ApiClient().delete('/trips/$id');
        _loadTrips();
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
          title: 'Trip & Weighbridge Register',
          subtitle: 'Unloading Weights, Freight Calculation & Destination Records',
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
            label: Text(_isCreatingNew ? 'View Trips' : '+ New Trip', style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
          ),
        ),
        Expanded(
          child: _isCreatingNew
              ? NewTripFormView(
                  initialParams: _prefillParams,
                  onSaved: () {
                    setState(() {
                      _isCreatingNew = false;
                      _prefillParams = null;
                    });
                    _loadTrips();
                  },
                )
              : _buildResponsiveView(),
        ),
      ],
    );
  }

  Widget _buildResponsiveView() {
    final q = _search.toLowerCase();
    final filtered = _trips.where((t) {
      final tripNo = (t['trip_no'] ?? t['tripNo'] ?? '').toString().toLowerCase();
      final truck = (t['truck_no'] ?? t['truckNo'] ?? '').toString().toLowerCase();
      final dest = (t['destination_name'] ?? t['destination'] ?? '').toString().toLowerCase();
      final party = (t['party_name'] ?? t['party'] ?? '').toString().toLowerCase();
      if (!tripNo.contains(q) && !truck.contains(q) && !dest.contains(q) && !party.contains(q)) return false;

      if (_startDate != null || _endDate != null) {
        final dStr = t['unloading_date'] ?? t['unloadingDate'];
        if (dStr == null) return false;
        final d = DateTime.tryParse(dStr.toString());
        if (d == null) return false;
        if (_startDate != null && d.isBefore(_startDate!)) return false;
        if (_endDate != null && d.isAfter(_endDate!.add(const Duration(days: 1)))) return false;
      }
      return true;
    }).toList();

    return LayoutBuilder(
      builder: (context, constraints) {
        final isMobile = constraints.maxWidth < 768;

        if (isMobile) {
          return Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            child: Column(
              children: [
                TripFilterBar(
                  search: _search,
                  onSearchChanged: (v) => setState(() => _search = v),
                  startDate: _startDate,
                  endDate: _endDate,
                  onStartDateChanged: (d) => setState(() => _startDate = d),
                  onEndDateChanged: (d) => setState(() => _endDate = d),
                  count: filtered.length,
                  total: _trips.length,
                ),
                const SizedBox(height: 8),
                Expanded(
                  child: _loading
                      ? const Center(child: CircularProgressIndicator())
                      : filtered.isEmpty
                          ? const Center(child: Text('No trips registered yet', style: TextStyle(color: AppColors.textMuted)))
                          : ListView.builder(
                              itemCount: filtered.length,
                              itemBuilder: (ctx, i) {
                                final t = filtered[i];
                                final truckId = t['truck_id'] ?? t['truckId'] ?? '';
                                return TripMobileCard(
                                  trip: t,
                                  onViewSlip: () => _viewSlip(t['slip_image']),
                                  onAddFuel: () => NavigationContext().navigateTo(3, params: {'tripId': t['id'], 'truckId': truckId}),
                                  onSettle: () => NavigationContext().navigateTo(4, params: {'tripId': t['id']}),
                                  onDelete: () => _deleteTrip(t['id']?.toString()),
                                );
                              },
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
              boxShadow: const [BoxShadow(color: Color(0x05000000), blurRadius: 4, offset: Offset(0, 1))],
            ),
            clipBehavior: Clip.antiAlias,
            child: Column(
              children: [
                TripFilterBar(
                  search: _search,
                  onSearchChanged: (v) => setState(() => _search = v),
                  startDate: _startDate,
                  endDate: _endDate,
                  onStartDateChanged: (d) => setState(() => _startDate = d),
                  onEndDateChanged: (d) => setState(() => _endDate = d),
                  count: filtered.length,
                  total: _trips.length,
                ),
                _buildTableHeader(),
                Expanded(
                  child: _loading
                      ? const Center(child: CircularProgressIndicator())
                      : filtered.isEmpty
                          ? const Center(child: Text('No trips registered yet', style: TextStyle(color: AppColors.textMuted)))
                          : ListView.builder(
                              itemCount: filtered.length,
                              itemBuilder: (ctx, i) {
                                final t = filtered[i];
                                final truckId = t['truck_id'] ?? t['truckId'] ?? '';
                                return TripTableRow(
                                  trip: t,
                                  onViewSlip: () => _viewSlip(t['slip_image']),
                                  onAddFuel: () => NavigationContext().navigateTo(3, params: {'tripId': t['id'], 'truckId': truckId}),
                                  onSettle: () => NavigationContext().navigateTo(4, params: {'tripId': t['id']}),
                                  onDelete: () => _deleteTrip(t['id']?.toString()),
                                );
                              },
                            ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _buildTableHeader() {
    return Container(
      color: const Color(0xFFF8FAFC),
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
      child: const Row(
        children: [
          SizedBox(width: 110, child: Text('TRIP / SR NO', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 10, color: Color(0xFF64748B)))),
          SizedBox(width: 105, child: Text('UNLOAD DATE', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 10, color: Color(0xFF64748B)))),
          SizedBox(width: 125, child: Text('TRUCK NO', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 10, color: Color(0xFF64748B)))),
          SizedBox(width: 120, child: Text('DESTINATION', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 10, color: Color(0xFF64748B)))),
          Expanded(flex: 2, child: Text('PARTY / TRANSPORTER', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 10, color: Color(0xFF64748B)))),
          SizedBox(width: 90, child: Text('WEIGHT (MT)', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 10, color: Color(0xFF64748B)))),
          SizedBox(width: 90, child: Text('RATE (₹/MT)', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 10, color: Color(0xFF64748B)))),
          SizedBox(width: 110, child: Text('GROSS FREIGHT', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 10, color: Color(0xFF64748B)))),
          SizedBox(width: 120, child: Text('ATTACHED DIESEL', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 10, color: Color(0xFF64748B)))),
          SizedBox(width: 130, child: Text('SETTLEMENT', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 10, color: Color(0xFF64748B)))),
          SizedBox(width: 70, child: Text('ACTION', textAlign: TextAlign.right, style: TextStyle(fontWeight: FontWeight.bold, fontSize: 10, color: Color(0xFF64748B)))),
        ],
      ),
    );
  }
}
