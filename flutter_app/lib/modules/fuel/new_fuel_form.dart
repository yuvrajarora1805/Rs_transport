import 'package:flutter/material.dart';
import '../../core/api/api_client.dart';
import '../../shared/components/slip_image_picker.dart';
import 'fuel_impact_sidebar.dart';

class NewFuelFormView extends StatefulWidget {
  final VoidCallback onSaved;
  const NewFuelFormView({super.key, required this.onSaved});

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
  String? _slipImage;
  bool _isSubmitting = false;
  String? _error;

  @override
  void initState() {
    super.initState();
    _loadMasters();
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
            if (_pumps.isNotEmpty) _selectedPumpId = _pumps[0]['id']?.toString();
          }
        });
      }
    } catch (_) {}
  }

  void _recalcAmount() {
    final l = double.tryParse(_litersCtrl.text) ?? 0.0;
    final r = double.tryParse(_rateCtrl.text) ?? 0.0;
    if (l > 0 && r > 0) {
      _amountCtrl.text = (l * r).toStringAsFixed(2);
    }
    setState(() {});
  }

  Future<void> _handleSubmit() async {
    if (_selectedTruckId == null || _selectedPumpId == null || _amountCtrl.text.isEmpty) {
      setState(() => _error = 'Please select Truck, Pump and enter Amount');
      return;
    }
    setState(() { _isSubmitting = true; _error = null; });
    try {
      await ApiClient().post('/fuel', data: {
        'date': _dateCtrl.text,
        'truckId': _selectedTruckId,
        'pumpId': _selectedPumpId,
        'slipNo': _slipNoCtrl.text,
        'liters': double.tryParse(_litersCtrl.text) ?? 0,
        'rate': double.tryParse(_rateCtrl.text) ?? 0,
        'amount': double.tryParse(_amountCtrl.text) ?? 0,
        'slip_image': _slipImage,
      });
      widget.onSaved();
    } catch (e) {
      setState(() => _error = 'Failed to save fuel slip: $e');
    } finally {
      if (mounted) setState(() => _isSubmitting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final selectedPump = _pumps.cast<Map<String, dynamic>?>().firstWhere((p) => p?['id']?.toString() == _selectedPumpId, orElse: () => null);
    final selectedTruck = _trucks.cast<Map<String, dynamic>?>().firstWhere((t) => t?['id']?.toString() == _selectedTruckId, orElse: () => null);

    return LayoutBuilder(
      builder: (context, constraints) {
        final isWide = constraints.maxWidth >= 980;
        final formContent = _buildForm();
        final sidebarContent = SizedBox(
          width: isWide ? 340 : double.infinity,
          child: FuelImpactSidebar(
            selectedPump: selectedPump,
            selectedTruck: selectedTruck,
            amount: double.tryParse(_amountCtrl.text) ?? 0.0,
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
                const Text('Diesel Dispense Information', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                const Divider(height: 20),
                Row(
                  children: [
                    Expanded(child: TextField(controller: _dateCtrl, decoration: const InputDecoration(labelText: 'Slip Date *', suffixIcon: Icon(Icons.calendar_today, size: 16)))),
                    const SizedBox(width: 16),
                    Expanded(child: TextField(controller: _slipNoCtrl, decoration: const InputDecoration(labelText: 'Pump Slip / Memo Number', hintText: 'e.g. SLIP-8841'))),
                  ],
                ),
                const SizedBox(height: 16),
                Row(
                  children: [
                    Expanded(
                      child: DropdownButtonFormField<String>(
                        value: _selectedPumpId,
                        isExpanded: true,
                        decoration: const InputDecoration(labelText: 'Petrol Pump Station *'),
                        items: _pumps.map((p) => DropdownMenuItem(value: p['id']?.toString(), child: Text(p['name'] ?? '', overflow: TextOverflow.ellipsis))).toList(),
                        onChanged: (v) => setState(() => _selectedPumpId = v),
                      ),
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: DropdownButtonFormField<String>(
                        value: _selectedTruckId,
                        isExpanded: true,
                        decoration: const InputDecoration(labelText: 'Select Truck *'),
                        items: _trucks.map((t) => DropdownMenuItem(value: t['id']?.toString(), child: Text('${t['truck_no'] ?? t['truckNo']} - ${t['owner_name'] ?? t['ownerName']}', overflow: TextOverflow.ellipsis))).toList(),
                        onChanged: (v) => setState(() => _selectedTruckId = v),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                Row(
                  children: [
                    Expanded(child: TextField(controller: _litersCtrl, keyboardType: TextInputType.number, decoration: const InputDecoration(labelText: 'Fuel Quantity (Liters)'), onChanged: (_) => _recalcAmount())),
                    const SizedBox(width: 16),
                    Expanded(child: TextField(controller: _rateCtrl, keyboardType: TextInputType.number, decoration: const InputDecoration(labelText: 'Rate / Liter (₹)'), onChanged: (_) => _recalcAmount())),
                  ],
                ),
                const SizedBox(height: 16),
                TextField(controller: _amountCtrl, keyboardType: TextInputType.number, decoration: const InputDecoration(labelText: 'Total Net Amount (₹) *'), onChanged: (_) => setState(() {})),
                const SizedBox(height: 16),
                SlipImagePicker(
                  label: 'Attach Stamped Pump Cash Memo / Fuel Slip',
                  onImageSelected: (b64) => setState(() => _slipImage = b64),
                ),
                const SizedBox(height: 20),
                Row(
                  mainAxisAlignment: MainAxisAlignment.end,
                  children: [
                    ElevatedButton.icon(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF2563EB),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                      ),
                      onPressed: _isSubmitting ? null : _handleSubmit,
                      icon: const Icon(Icons.send, size: 16, color: Colors.white),
                      label: Text(_isSubmitting ? 'Saving...' : 'Save Diesel Slip', style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.white)),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }
}
