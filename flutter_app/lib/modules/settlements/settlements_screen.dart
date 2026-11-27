import 'dart:convert';
import 'package:flutter/material.dart';
import '../../core/api/api_client.dart';
import '../../core/theme/app_theme.dart';
import '../../components/layout/erp_header.dart';
import '../../context/company_context.dart';
import '../../context/navigation_context.dart';
import 'new_settlement_form.dart';
import 'settlement_table_row.dart';
import 'settlement_mobile_card.dart';

class SettlementsScreen extends StatefulWidget {
  final Function(int)? onNavigate;
  const SettlementsScreen({super.key, this.onNavigate});

  @override
  State<SettlementsScreen> createState() => _SettlementsScreenState();
}

class _SettlementsScreenState extends State<SettlementsScreen> {
  bool _isCreatingNew = false;
  Map<String, dynamic>? _prefillParams;
  List<Map<String, dynamic>> _settlements = [];
  bool _loading = true;
  String _search = '';

  @override
  void initState() {
    super.initState();
    NavigationContext().addListener(_onNavParamsChanged);
    CompanyState().addListener(_loadSettlements);
    _checkPendingNav();
    _loadSettlements();
  }

  @override
  void dispose() {
    NavigationContext().removeListener(_onNavParamsChanged);
    CompanyState().removeListener(_loadSettlements);
    super.dispose();
  }

  void _onNavParamsChanged() {
    if (NavigationContext().currentIndex == 4) _checkPendingNav();
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

  Future<void> _loadSettlements() async {
    if (!mounted) return;
    setState(() => _loading = true);
    try {
      final code = CompanyState().activeCompany.codeStr;
      final res = await ApiClient().get('/settlements?companyCode=$code');
      if (mounted && res.data is List) {
        setState(() => _settlements = List<Map<String, dynamic>>.from(res.data));
      }
    } catch (_) {} finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<void> _deleteSettlement(String? id) async {
    if (id == null) return;
    final confirm = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Delete Settlement', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
        content: const Text('Are you sure you want to delete this trip settlement?'),
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
        await ApiClient().delete('/settlements/$id');
        _loadSettlements();
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
          title: 'Settlement Management',
          subtitle: 'Disbursement settlements, truck balances & payment vouchers',
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
            label: Text(_isCreatingNew ? 'View Settlements' : '+ New Settlement', style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
          ),
        ),
        Expanded(
          child: _isCreatingNew
              ? NewSettlementFormView(
                  initialParams: _prefillParams,
                  onSaved: () {
                    setState(() {
                      _isCreatingNew = false;
                      _prefillParams = null;
                    });
                    _loadSettlements();
                  },
                )
              : _buildResponsiveView(),
        ),
      ],
    );
  }

  Widget _buildResponsiveView() {
    final q = _search.toLowerCase();
    final filtered = _settlements.where((s) {
      final trip = (s['trip_no'] ?? s['tripNo'] ?? '').toString().toLowerCase();
      final truck = (s['truck_no'] ?? s['truckNo'] ?? '').toString().toLowerCase();
      final dest = (s['destination_name'] ?? s['destination'] ?? '').toString().toLowerCase();
      return trip.contains(q) || truck.contains(q) || dest.contains(q);
    }).toList();

    return LayoutBuilder(
      builder: (context, constraints) {
        final isMobile = constraints.maxWidth < 768;

        if (isMobile) {
          return Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            child: Column(
              children: [
                _buildSearchHeader(filtered.length, isMobile: true),
                const SizedBox(height: 8),
                Expanded(
                  child: _loading
                      ? const Center(child: CircularProgressIndicator())
                      : filtered.isEmpty
                          ? const Center(child: Text('No settlements recorded yet', style: TextStyle(color: AppColors.textMuted)))
                          : ListView.builder(
                              itemCount: filtered.length,
                              itemBuilder: (ctx, i) {
                                final s = filtered[i];
                                final out = num.tryParse((s['outstanding'] ?? 0).toString()) ?? 0;
                                return SettlementMobileCard(
                                  settlement: s,
                                  onViewSlip: () => _viewSlip(s['slip_image']),
                                  onRecordPayment: () => NavigationContext().navigateTo(5, params: {'settlementId': s['id'], 'outstanding': out}),
                                  onDelete: () => _deleteSettlement(s['id']?.toString()),
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
                _buildSearchHeader(filtered.length, isMobile: false),
                _buildTableHeader(),
                Expanded(
                  child: _loading
                      ? const Center(child: CircularProgressIndicator())
                      : filtered.isEmpty
                          ? const Center(child: Text('No settlements recorded yet', style: TextStyle(color: AppColors.textMuted)))
                          : ListView.builder(
                              itemCount: filtered.length,
                              itemBuilder: (ctx, i) {
                                final s = filtered[i];
                                final out = num.tryParse((s['outstanding'] ?? 0).toString()) ?? 0;
                                return SettlementTableRow(
                                  settlement: s,
                                  onViewSlip: () => _viewSlip(s['slip_image']),
                                  onRecordPayment: () => NavigationContext().navigateTo(5, params: {'settlementId': s['id'], 'outstanding': out}),
                                  onDelete: () => _deleteSettlement(s['id']?.toString()),
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

  Widget _buildSearchHeader(int count, {required bool isMobile}) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: const Color(0xFFF8FAFC),
        borderRadius: isMobile ? BorderRadius.circular(12) : BorderRadius.zero,
        border: isMobile ? Border.all(color: const Color(0xFFE2E8F0)) : const Border(bottom: BorderSide(color: Color(0xFFE2E8F0))),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            height: 38,
            child: TextField(
              decoration: InputDecoration(
                hintText: 'Search by trip #, truck plate, or destination...',
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
          if (isMobile) ...[
            const SizedBox(height: 6),
            Align(
              alignment: Alignment.centerRight,
              child: Text('Showing $count of ${_settlements.length} records', style: const TextStyle(fontSize: 11, color: Color(0xFF64748B))),
            ),
          ],
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
          SizedBox(width: 110, child: Text('TRIP NO', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 10, color: Color(0xFF64748B)))),
          SizedBox(width: 120, child: Text('TRUCK NO', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 10, color: Color(0xFF64748B)))),
          SizedBox(width: 120, child: Text('DESTINATION', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 10, color: Color(0xFF64748B)))),
          SizedBox(width: 100, child: Text('GROSS FREIGHT', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 10, color: Color(0xFF64748B)))),
          SizedBox(width: 95, child: Text('DIESEL (₹)', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 10, color: Color(0xFF64748B)))),
          SizedBox(width: 105, child: Text('NET PAYABLE', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 10, color: Color(0xFF64748B)))),
          SizedBox(width: 95, child: Text('PAID (₹)', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 10, color: Color(0xFF64748B)))),
          Expanded(child: Text('OUTSTANDING (₹)', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 10, color: Color(0xFF64748B)))),
          SizedBox(width: 105, child: Text('STATUS', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 10, color: Color(0xFF64748B)))),
          SizedBox(width: 130, child: Text('ACTION', textAlign: TextAlign.right, style: TextStyle(fontWeight: FontWeight.bold, fontSize: 10, color: Color(0xFF64748B)))),
        ],
      ),
    );
  }
}
