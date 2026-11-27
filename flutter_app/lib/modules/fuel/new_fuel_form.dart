import 'package:flutter/material.dart';
import '../../core/api/api_client.dart';
import '../../core/theme/app_theme.dart';
import '../../shared/components/slip_image_picker.dart';
import '../../shared/components/searchable_dropdown.dart';
import 'fuel_impact_sidebar.dart';

class NewFuelFormView extends StatefulWidget {
  final Map<String, dynamic>? initialParams;
  final VoidCallback onSaved;

  const NewFuelFormView({
    super.key,
    this.initialParams,
    required this.onSaved,
  });

  @override
  State<NewFuelFormView> createState() => _NewFuelFormViewState();
}

class _NewFuelFormViewState extends State<NewFuelFormView> {
  final _dateCtrl = TextEditingController(text: DateTime.now().toIso8601String().split('T')[0]);
  final _amountCtrl = TextEditingController();
  final _litersCtrl = TextEditingController();
  final _rateCtrl = TextEditingController();
  final _slipNoCtrl = TextEditingController();

  List<Map<String, dynamic>> _trucks = [];
  List<Map<String, dynamic>> _pumps = [];

  String? _selectedTruckId;
  String? _selectedPumpId;
  String? _linkedTripId;
  String? _slipImage;
  bool _isSubmitting = false;
  String? _error;

  @override
  void initState() {
    super.initState();
    _applyParams();
    _loadMasters();
  }

  void _applyParams() {
    if (widget.initialParams != null) {
      final p = widget.initialParams!;
      if (p['tripId'] != null) _linkedTripId = p['tripId'].toString();
      if (p['truckId'] != null) _selectedTruckId = p['truckId'].toString();
    }
  }

  Future<void> _loadMasters() async {
    try {
      final resT = await ApiClient().get('/masters/trucks');
      final resP = await ApiClient().get('/masters/pumps');
      if (mounted) {
        setState(() {
          if (resT.data is List) _trucks = List<Map<String, dynamic>>.from(resT.data);
          if (resP.data is List) {
            _pumps = List<Map<String, dynamic>>.from(resP.data);
            if (_pumps.isNotEmpty && _selectedPumpId == null) {
              _selectedPumpId = _pumps[0]['id']?.toString();
            }
          }
        });
      }
    } catch (_) {}
  }

  void _calculateTotal() {
    final l = double.tryParse(_litersCtrl.text) ?? 0.0;
    final r = double.tryParse(_rateCtrl.text) ?? 0.0;
    if (l > 0 && r > 0) {
      _amountCtrl.text = (l * r).toStringAsFixed(2);
    }
    setState(() {});
  }

  Future<void> _handleSubmit() async {
    if (_selectedTruckId == null || _selectedPumpId == null || _amountCtrl.text.isEmpty) {
      setState(() => _error = 'Please select Truck, Pump and enter Net Fuel Amount');
      return;
    }
    setState(() { _isSubmitting = true; _error = null; });
    try {
      await ApiClient().post('/fuel', data: {
        'date': _dateCtrl.text,
        'truckId': _selectedTruckId,
        'pumpId': _selectedPumpId,
        'tripId': _linkedTripId,
        'litres': double.tryParse(_litersCtrl.text),
        'rate': double.tryParse(_rateCtrl.text),
        'amount': double.parse(_amountCtrl.text),
        'slip_no': _slipNoCtrl.text,
        'slip_image': _slipImage,
      });
      widget.onSaved();
    } catch (e) {
      setState(() => _error = 'Failed to issue fuel memo: $e');
    } finally {
      if (mounted) setState(() => _isSubmitting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final amt = double.tryParse(_amountCtrl.text) ?? 0.0;
    final selectedPump = _pumps.firstWhere(
      (p) => p['id']?.toString() == _selectedPumpId,
      orElse: () => {'name': 'Selected Pump', 'current_balance': 0},
    );
    final selectedTruck = _trucks.firstWhere(
      (t) => t['id']?.toString() == _selectedTruckId,
      orElse: () => {'truck_no': '-'},
    );

    return LayoutBuilder(
      builder: (context, constraints) {
        final isWide = constraints.maxWidth >= 980;
        final formContent = _buildForm();
        final sidebarContent = SizedBox(
          width: isWide ? 340 : double.infinity,
          child: Column(
            children: [
              FuelImpactSidebar(
                selectedPump: selectedPump,
                selectedTruck: selectedTruck,
                amount: amt,
              ),
              const SizedBox(height: 16),
              ElevatedButton.icon(
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primary,
                  foregroundColor: Colors.white,
                  minimumSize: const Size.fromHeight(48),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                ),
                onPressed: _isSubmitting ? null : _handleSubmit,
                icon: _isSubmitting
                    ? const SizedBox(width: 16, height: 16, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                    : const Icon(Icons.send, size: 16),
                label: Text(_isSubmitting ? 'Saving Slip...' : 'Record Diesel Slip', style: const TextStyle(fontWeight: FontWeight.bold)),
              ),
            ],
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
                const Text('Fuel Memo & Slip Details', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                const Divider(height: 20),
                Row(
                  children: [
                    Expanded(
                      child: TextField(
                        controller: _dateCtrl,
                        decoration: const InputDecoration(labelText: 'Dispense Date', suffixIcon: Icon(Icons.calendar_today, size: 16)),
                      ),
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: TextField(
                        controller: _slipNoCtrl,
                        decoration: const InputDecoration(labelText: 'Pump Slip / Memo #'),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                SearchableDropdown(
                  value: _selectedTruckId,
                  label: 'Assigned Truck',
                  hint: '-- Select Truck Plate --',
                  items: _trucks.map((t) => DropdownSearchItem(id: t['id']?.toString() ?? '', label: t['truck_no'] ?? t['truckNo'] ?? '')).toList(),
                  onChanged: (v) => setState(() => _selectedTruckId = v),
                ),
                const SizedBox(height: 16),
                SearchableDropdown(
                  value: _selectedPumpId,
                  label: 'Petrol Pump Station',
                  hint: '-- Select Pump Account --',
                  items: _pumps.map((p) => DropdownSearchItem(id: p['id']?.toString() ?? '', label: p['name'] ?? '', subtitle: 'Bal: ₹${p['current_balance'] ?? 0}')).toList(),
                  onChanged: (v) => setState(() => _selectedPumpId = v),
                ),
                const SizedBox(height: 16),
                Row(
                  children: [
                    Expanded(
                      child: TextField(
                        controller: _litersCtrl,
                        keyboardType: TextInputType.number,
                        decoration: const InputDecoration(labelText: 'Liters Dispensed'),
                        onChanged: (_) => _calculateTotal(),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: TextField(
                        controller: _rateCtrl,
                        keyboardType: TextInputType.number,
                        decoration: const InputDecoration(labelText: 'Diesel Rate (₹/L)'),
                        onChanged: (_) => _calculateTotal(),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: TextField(
                        controller: _amountCtrl,
                        keyboardType: TextInputType.number,
                        decoration: const InputDecoration(labelText: 'Total Amount (₹)*'),
                        onChanged: (_) => setState(() {}),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                SlipImagePicker(
                  label: 'Attach Pump Memo Slip (Photo)',
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
