import 'dart:convert';
import 'package:flutter/material.dart';
import '../../core/api/api_client.dart';
import '../../core/database/local_storage.dart';
import '../../core/theme/app_theme.dart';
import '../../components/layout/erp_header.dart';
import '../../context/company_context.dart';
import '../../context/navigation_context.dart';
import 'new_dispatch_form.dart';
import 'dispatch_order_card.dart';
import 'dispatch_metrics_header.dart';
import 'dispatch_filter_bar.dart';

class DispatchesScreen extends StatefulWidget {
  final Function(int)? onNavigate;
  const DispatchesScreen({super.key, this.onNavigate});

  @override
  State<DispatchesScreen> createState() => _DispatchesScreenState();
}

class _DispatchesScreenState extends State<DispatchesScreen> {
  bool _isCreatingNew = false;
  List<Map<String, dynamic>> _dispatches = [];
  List<Map<String, dynamic>> _sources = [];
  String? _selectedSourceId;
  bool _loading = true;
  String _search = '';
  DateTime? _startDate;
  DateTime? _endDate;

  @override
  void initState() {
    super.initState();
    CompanyState().addListener(_loadData);
    _loadData();
  }

  @override
  void dispose() {
    CompanyState().removeListener(_loadData);
    super.dispose();
  }

  Future<void> _loadData() async {
    if (!mounted) return;
    setState(() => _loading = true);
    try {
      final code = CompanyState().activeCompany.codeStr;
      final q = _selectedSourceId != null && _selectedSourceId!.isNotEmpty
          ? '?sourceId=$_selectedSourceId&companyCode=$code'
          : '?companyCode=$code';
      final resD = await ApiClient().get('/dispatches$q');
      final resS = await ApiClient().get('/masters/sources');
      if (mounted) {
        setState(() {
          if (resD.data is List) {
            _dispatches = List<Map<String, dynamic>>.from(resD.data);
            LocalStorage().saveDispatches(_dispatches);
          }
          if (resS.data is List) _sources = List<Map<String, dynamic>>.from(resS.data);
        });
      }
    } catch (_) {
      _dispatches = await LocalStorage().getDispatches();
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<void> _deleteDispatch(String? id) async {
    if (id == null) return;
    final confirm = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Delete Dispatch Entry', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
        content: const Text('Are you sure you want to remove this dispatch record?'),
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
        await ApiClient().delete('/dispatches/$id');
        _loadData();
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
          title: 'Dispatch Management',
          subtitle: 'Source-wise Truck Bookings & Grouped Fleet Register',
          actions: ElevatedButton.icon(
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.primary,
              foregroundColor: Colors.white,
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
            ),
            onPressed: () => setState(() => _isCreatingNew = !_isCreatingNew),
            icon: Icon(_isCreatingNew ? Icons.list_alt : Icons.add_circle_outline, size: 15),
            label: Text(_isCreatingNew ? 'View Orders (${_dispatches.length})' : '+ New Dispatch', style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
          ),
        ),
        Expanded(
          child: _isCreatingNew
              ? NewDispatchFormView(onSaved: () {
                  setState(() => _isCreatingNew = false);
                  _loadData();
                })
              : _buildOrdersList(),
        ),
      ],
    );
  }

  Widget _buildOrdersList() {
    final q = _search.toLowerCase();
    final filtered = _dispatches.where((d) {
      if (_selectedSourceId != null && _selectedSourceId!.isNotEmpty) {
        final src = d['source_id']?.toString() ?? d['sourceId']?.toString();
        if (src != _selectedSourceId) return false;
      }
      final t = (d['truck_no'] ?? d['truckNo'] ?? '').toString().toLowerCase();
      final dest = (d['destination'] ?? '').toString().toLowerCase();
      final sr = (d['sr_no'] ?? d['srNo'] ?? '').toString().toLowerCase();
      final sName = (d['source_name'] ?? '').toString().toLowerCase();
      if (!t.contains(q) && !dest.contains(q) && !sr.contains(q) && !sName.contains(q)) return false;

      if (_startDate != null || _endDate != null) {
        final dStr = d['date'] ?? d['created_at'];
        if (dStr == null) return false;
        final dateObj = DateTime.tryParse(dStr.toString());
        if (dateObj == null) return false;
        if (_startDate != null && dateObj.isBefore(_startDate!)) return false;
        if (_endDate != null && dateObj.isAfter(_endDate!.add(const Duration(days: 1)))) return false;
      }
      return true;
    }).toList();

    final totalBales = _dispatches.fold<int>(0, (acc, d) => acc + (int.tryParse(d['bales']?.toString() ?? '0') ?? 0));
    final uniqueTrucks = _dispatches.map((d) => d['truck_no'] ?? d['truckId']).where((x) => x != null).toSet().length;

    return SingleChildScrollView(
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 8),
        child: Column(
          children: [
            DispatchMetricsHeader(
              totalOrders: _dispatches.length,
              totalBales: totalBales,
              fleetActive: uniqueTrucks,
              bookingSources: _sources.length,
              onTrucksTap: () => NavigationContext().navigateTo(9),
              onSourcesTap: () => NavigationContext().navigateTo(11),
              onTripsTap: () => NavigationContext().navigateTo(2),
            ),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: Container(
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: const Color(0xFFE2E8F0)),
                  boxShadow: const [BoxShadow(color: Color(0x04000000), blurRadius: 4, offset: Offset(0, 1))],
                ),
                clipBehavior: Clip.antiAlias,
                child: Column(
                  children: [
                    DispatchFilterBar(
                      sources: _sources,
                      selectedSourceId: _selectedSourceId,
                      onSourceChanged: (v) {
                        setState(() => _selectedSourceId = v);
                        _loadData();
                      },
                      search: _search,
                      onSearchChanged: (v) => setState(() => _search = v),
                      startDate: _startDate,
                      endDate: _endDate,
                      onStartDateChanged: (d) => setState(() => _startDate = d),
                      onEndDateChanged: (d) => setState(() => _endDate = d),
                      count: filtered.length,
                      total: _dispatches.length,
                    ),
                    _buildTableHeader(),
                    if (_loading)
                      const Padding(padding: EdgeInsets.all(32), child: Center(child: CircularProgressIndicator()))
                    else if (filtered.isEmpty)
                      const Padding(padding: EdgeInsets.all(32), child: Center(child: Text('No dispatch records found', style: TextStyle(color: AppColors.textMuted))))
                    else
                      ListView.builder(
                        shrinkWrap: true,
                        physics: const NeverScrollableScrollPhysics(),
                        itemCount: filtered.length,
                        itemBuilder: (ctx, i) {
                          final item = filtered[i];
                          return DispatchOrderCard(
                            dispatch: item,
                            onViewSlip: () => _viewSlip(item['slip_image']),
                            onRecordLoading: () {
                              NavigationContext().navigateTo(2, params: {
                                'dispatchId': item['id'],
                                'truckId': item['truck_id'] ?? item['truckId'],
                                'srNo': item['sr_no'] ?? item['srNo'],
                                'destination': item['destination'] ?? item['destination_name'],
                              });
                            },
                            onDelete: () => _deleteDispatch(item['id']?.toString()),
                          );
                        },
                      ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildTableHeader() {
    return Container(
      color: const Color(0xFFF8FAFC),
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
      child: const Row(
        children: [
          SizedBox(width: 85, child: Text('DATE', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 10, color: Color(0xFF64748B)))),
          SizedBox(width: 70, child: Text('SR / REF', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 10, color: Color(0xFF64748B)))),
          SizedBox(width: 90, child: Text('COMMODITY', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 10, color: Color(0xFF64748B)))),
          SizedBox(width: 140, child: Text('SOURCE & DESTINATION', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 10, color: Color(0xFF64748B)))),
          Expanded(child: Text('ASSIGNED FLEET & DHARAMKANTA LOADING', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 10, color: Color(0xFF64748B)))),
          SizedBox(width: 70, child: Text('TOTAL QTY', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 10, color: Color(0xFF64748B)))),
          SizedBox(width: 40, child: Text('ACTION', textAlign: TextAlign.right, style: TextStyle(fontWeight: FontWeight.bold, fontSize: 10, color: Color(0xFF64748B)))),
        ],
      ),
    );
  }
}
