import 'package:flutter/material.dart';
import '../../core/api/api_client.dart';
import '../../shared/components/slip_image_picker.dart';
import '../../shared/components/searchable_dropdown.dart';
import 'settlement_summary_sidebar.dart';

class NewSettlementFormView extends StatefulWidget {
  final Map<String, dynamic>? initialParams;
  final VoidCallback onSaved;

  const NewSettlementFormView({
    super.key,
    this.initialParams,
    required this.onSaved,
  });

  @override
  State<NewSettlementFormView> createState() => _NewSettlementFormViewState();
}

class _NewSettlementFormViewState extends State<NewSettlementFormView> {
  List<Map<String, dynamic>> _trips = [];
  Map<String, dynamic>? _selectedTrip;
  String? _selectedTripId;

  final _dieselCtrl = TextEditingController(text: '0');
  final _advanceCtrl = TextEditingController(text: '0');
  final _commissionCtrl = TextEditingController(text: '700');
  final _otherCtrl = TextEditingController(text: '0');
  String? _slipImage;

  bool _isSubmitting = false;
  String? _error;

  @override
  void initState() {
    super.initState();
    _loadTrips();
  }

  Future<void> _loadTrips() async {
    try {
      final res = await ApiClient().get('/trips');
      if (mounted && res.data is List) {
        setState(() {
          _trips = List<Map<String, dynamic>>.from(res.data);
          if (widget.initialParams != null && widget.initialParams!['tripId'] != null) {
            final tId = widget.initialParams!['tripId'].toString();
            _selectedTripId = tId;
            _selectedTrip = _trips.firstWhere((t) => t['id']?.toString() == tId, orElse: () => {});
            if (_selectedTrip != null) {
              final d = _selectedTrip!['total_diesel'] ?? 0;
              if (d > 0) _dieselCtrl.text = d.toString();
            }
          }
        });
      }
    } catch (_) {}
  }

  double get _gross => (_selectedTrip?['gross_freight'] ?? _selectedTrip?['grossFreight'] ?? 0.0).toDouble();
  double get _diesel => double.tryParse(_dieselCtrl.text) ?? 0.0;
  double get _advance => double.tryParse(_advanceCtrl.text) ?? 0.0;
  double get _comm => double.tryParse(_commissionCtrl.text) ?? 0.0;
  double get _other => double.tryParse(_otherCtrl.text) ?? 0.0;
  double get _netPayable => _gross - (_diesel + _advance + _comm + _other);

  Future<void> _handleSubmit() async {
    if (_selectedTripId == null) {
      setState(() => _error = 'Please select a Trip to settle');
      return;
    }
    setState(() { _isSubmitting = true; _error = null; });
    try {
      await ApiClient().post('/settlements', data: {
        'tripId': _selectedTripId,
        'dieselAmount': _diesel,
        'advanceAmount': _advance,
        'commission': _comm,
        'otherDeductions': _other,
        'netPayable': _netPayable,
        'slip_image': _slipImage,
      });
      widget.onSaved();
    } catch (e) {
      setState(() => _error = 'Failed to record settlement: $e');
    } finally {
      if (mounted) setState(() => _isSubmitting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (context, constraints) {
        final isWide = constraints.maxWidth >= 980;
        final formContent = _buildForm();
        final sidebarContent = SizedBox(
          width: isWide ? 340 : double.infinity,
          child: SettlementSummarySidebar(
            selectedTrip: _selectedTrip,
            gross: _gross,
            diesel: _diesel,
            advance: _advance,
            commission: _comm,
            otherDeductions: _other,
            netPayable: _netPayable,
            isSubmitting: _isSubmitting,
            onSave: _handleSubmit,
          ),
        );

        return SingleChildScrollView(
          padding: const EdgeInsets.all(20),
          child: isWide
              ? Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Expanded(child: formContent),
                    const SizedBox(width: 20),
                    sidebarContent,
                  ],
                )
              : Column(
                  children: [
                    formContent,
                    const SizedBox(height: 20),
                    sidebarContent,
                  ],
                ),
        );
      },
    );
  }

  Widget _buildForm() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        if (_error != null)
          Container(
            margin: const EdgeInsets.only(bottom: 16),
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(color: const Color(0xFFFFF1F2), borderRadius: BorderRadius.circular(8)),
            child: Text(_error!, style: const TextStyle(color: Color(0xFFE11D48), fontSize: 12)),
          ),
        Card(
          elevation: 0,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16), side: const BorderSide(color: Color(0xFFE2E8F0))),
          child: Padding(
            padding: const EdgeInsets.all(20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('Trip Selection & Deductions', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                const Divider(height: 20),
                SearchableDropdown(
                  value: _selectedTripId,
                  label: 'Trip to Settle',
                  hint: '-- Type trip # or truck plate to search --',
                  items: _trips.map((t) {
                    final no = t['trip_no'] ?? t['tripNo'] ?? '-';
                    final truck = t['truck_no'] ?? t['truckNo'] ?? '-';
                    final gross = t['gross_freight'] ?? t['grossFreight'] ?? 0;
                    return DropdownSearchItem(
                      id: t['id']?.toString() ?? '',
                      label: 'Trip #$no | Truck: $truck',
                      subtitle: 'Gross Freight: ₹$gross',
                    );
                  }).toList(),
                  onChanged: (v) {
                    setState(() {
                      _selectedTripId = v;
                      _selectedTrip = v != null ? _trips.firstWhere((t) => t['id']?.toString() == v, orElse: () => {}) : null;
                      if (_selectedTrip != null) {
                        final d = _selectedTrip!['total_diesel'] ?? 0;
                        if (d > 0) _dieselCtrl.text = d.toString();
                      }
                    });
                  },
                ),
                const SizedBox(height: 16),
                Row(
                  children: [
                    Expanded(child: TextField(controller: _dieselCtrl, keyboardType: TextInputType.number, decoration: const InputDecoration(labelText: 'Diesel Deductions (₹)'), onChanged: (_) => setState(() {}))),
                    const SizedBox(width: 16),
                    Expanded(child: TextField(controller: _advanceCtrl, keyboardType: TextInputType.number, decoration: const InputDecoration(labelText: 'Cash Advances (₹)'), onChanged: (_) => setState(() {}))),
                  ],
                ),
                const SizedBox(height: 16),
                Row(
                  children: [
                    Expanded(child: TextField(controller: _commissionCtrl, keyboardType: TextInputType.number, decoration: const InputDecoration(labelText: 'Commission (₹)'), onChanged: (_) => setState(() {}))),
                    const SizedBox(width: 16),
                    Expanded(child: TextField(controller: _otherCtrl, keyboardType: TextInputType.number, decoration: const InputDecoration(labelText: 'Other Adjustments (₹)'), onChanged: (_) => setState(() {}))),
                  ],
                ),
                const SizedBox(height: 16),
                SlipImagePicker(
                  label: 'Attach Settlement Voucher / Slip (Photo)',
                  initialBase64: _slipImage,
                  onImageSelected: (b64) => setState(() => _slipImage = b64),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }
}
