import 'package:flutter/material.dart';
import '../../core/api/api_client.dart';
import '../../shared/components/slip_image_picker.dart';
import 'trip_freight_sidebar.dart';

class NewTripFormView extends StatefulWidget {
  final VoidCallback onSaved;
  const NewTripFormView({super.key, required this.onSaved});

  @override
  State<NewTripFormView> createState() => _NewTripFormViewState();
}

class _NewTripFormViewState extends State<NewTripFormView> {
  final bool _isMultiMode = false;
  bool _isSubmitting = false;
  String? _error;

  final _tripNoCtrl = TextEditingController();
  final _dateCtrl = TextEditingController(text: DateTime.now().toIso8601String().split('T')[0]);
  final _grossCtrl = TextEditingController();
  final _tareCtrl = TextEditingController();
  final _netCtrl = TextEditingController();
  final _rateCtrl = TextEditingController();

  List<Map<String, dynamic>> _trucks = [];
  List<Map<String, dynamic>> _destinations = [];
  List<Map<String, dynamic>> _parties = [];
  List<Map<String, dynamic>> _transporters = [];

  String? _selectedTruckId;
  String? _selectedDestId;
  String? _selectedPartyId;
  String? _selectedTransporterId;
  String? _slipImage;

  @override
  void initState() {
    super.initState();
    _loadMasters();
  }

  Future<void> _loadMasters() async {
    try {
      final t = await ApiClient().get('/masters/trucks');
      final d = await ApiClient().get('/masters/destinations');
      final p = await ApiClient().get('/masters/parties');
      final tr = await ApiClient().get('/masters/transporters');
      if (mounted) {
        setState(() {
          if (t.data is List) _trucks = List<Map<String, dynamic>>.from(t.data);
          if (d.data is List) _destinations = List<Map<String, dynamic>>.from(d.data);
          if (p.data is List) _parties = List<Map<String, dynamic>>.from(p.data);
          if (tr.data is List) {
            _transporters = List<Map<String, dynamic>>.from(tr.data);
            if (_transporters.isNotEmpty) _selectedTransporterId = _transporters[0]['id']?.toString();
          }
        });
      }
    } catch (_) {}
  }

  void _calculateNet() {
    final g = double.tryParse(_grossCtrl.text) ?? 0.0;
    final t = double.tryParse(_tareCtrl.text) ?? 0.0;
    if (g > 0 && t > 0 && g >= t) _netCtrl.text = (g - t).toStringAsFixed(3);
    setState(() {});
  }

  double get _grossFreight => (double.tryParse(_netCtrl.text) ?? 0.0) * (double.tryParse(_rateCtrl.text) ?? 0.0);

  Future<void> _handleSubmit() async {
    if (_selectedPartyId == null || _selectedDestId == null) {
      setState(() => _error = 'Please select Destination and Party');
      return;
    }
    setState(() { _isSubmitting = true; _error = null; });
    try {
      await ApiClient().post('/trips', data: {
        'tripNo': _tripNoCtrl.text, 'unloadingDate': _dateCtrl.text, 'truckId': _selectedTruckId,
        'destinationId': _selectedDestId, 'partyId': _selectedPartyId, 'transporterId': _selectedTransporterId,
        'grossWeight': double.tryParse(_grossCtrl.text) ?? 0, 'tareWeight': double.tryParse(_tareCtrl.text) ?? 0,
        'netWeight': double.tryParse(_netCtrl.text) ?? 0, 'ratePerUnit': double.tryParse(_rateCtrl.text) ?? 0,
        'grossFreight': _grossFreight, 'slip_image': _slipImage,
      });
      widget.onSaved();
    } catch (e) {
      setState(() => _error = 'Failed to save trip: $e');
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
          child: TripFreightSidebar(
            netWeight: double.tryParse(_netCtrl.text) ?? 0.0,
            ratePerUnit: double.tryParse(_rateCtrl.text) ?? 0.0,
            grossFreight: _grossFreight,
            isMultiMode: _isMultiMode,
            truckCount: 1,
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
                const Text('Trip Unloading Setup', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                const Divider(height: 20),
                Row(
                  children: [
                    Expanded(child: TextField(controller: _tripNoCtrl, decoration: const InputDecoration(labelText: 'Trip # / SR Reference', hintText: 'e.g. TR-1001'))),
                    const SizedBox(width: 16),
                    Expanded(child: TextField(controller: _dateCtrl, decoration: const InputDecoration(labelText: 'Unloading Date *', suffixIcon: Icon(Icons.calendar_today, size: 16)))),
                  ],
                ),
                const SizedBox(height: 16),
                Row(
                  children: [
                    Expanded(
                      child: DropdownButtonFormField<String>(
                        value: _selectedDestId,
                        isExpanded: true,
                        decoration: const InputDecoration(labelText: 'Destination Place *'),
                        items: _destinations.map((d) => DropdownMenuItem(value: d['id']?.toString(), child: Text(d['name'] ?? '', overflow: TextOverflow.ellipsis))).toList(),
                        onChanged: (v) => setState(() => _selectedDestId = v),
                      ),
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: DropdownButtonFormField<String>(
                        value: _selectedPartyId,
                        isExpanded: true,
                        decoration: const InputDecoration(labelText: 'Party / Mill Consignee *'),
                        items: _parties.map((p) => DropdownMenuItem(value: p['id']?.toString(), child: Text(p['name'] ?? '', overflow: TextOverflow.ellipsis))).toList(),
                        onChanged: (v) => setState(() => _selectedPartyId = v),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                DropdownButtonFormField<String>(
                  value: _selectedTransporterId,
                  isExpanded: true,
                  decoration: const InputDecoration(labelText: 'Unloaded on Transporter'),
                  items: _transporters.map((t) => DropdownMenuItem(value: t['id']?.toString(), child: Text(t['name'] ?? '', overflow: TextOverflow.ellipsis))).toList(),
                  onChanged: (v) => setState(() => _selectedTransporterId = v),
                ),
              ],
            ),
          ),
        ),
        const SizedBox(height: 16),
        Card(
          elevation: 0,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16), side: const BorderSide(color: Color(0xFFE2E8F0))),
          child: Padding(
            padding: const EdgeInsets.all(20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('Weighbridge & Freight Calculation', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                const Divider(height: 20),
                DropdownButtonFormField<String>(
                  value: _selectedTruckId,
                  isExpanded: true,
                  decoration: const InputDecoration(labelText: 'Select Truck *'),
                  items: _trucks.map((t) => DropdownMenuItem(value: t['id']?.toString(), child: Text('${t['truck_no'] ?? t['truckNo']} - ${t['owner_name'] ?? t['ownerName']}', overflow: TextOverflow.ellipsis))).toList(),
                  onChanged: (v) => setState(() => _selectedTruckId = v),
                ),
                const SizedBox(height: 16),
                Row(
                  children: [
                    Expanded(child: TextField(controller: _grossCtrl, keyboardType: TextInputType.number, decoration: const InputDecoration(labelText: 'Gross Wt (MT)'), onChanged: (_) => _calculateNet())),
                    const SizedBox(width: 12),
                    Expanded(child: TextField(controller: _tareCtrl, keyboardType: TextInputType.number, decoration: const InputDecoration(labelText: 'Tare Wt (MT)'), onChanged: (_) => _calculateNet())),
                  ],
                ),
                const SizedBox(height: 16),
                Row(
                  children: [
                    Expanded(child: TextField(controller: _netCtrl, keyboardType: TextInputType.number, decoration: const InputDecoration(labelText: 'Net Wt (MT)'), onChanged: (_) => setState(() {}))),
                    const SizedBox(width: 12),
                    Expanded(child: TextField(controller: _rateCtrl, keyboardType: TextInputType.number, decoration: const InputDecoration(labelText: 'Rate / MT (₹)'), onChanged: (_) => setState(() {}))),
                  ],
                ),
                const SizedBox(height: 16),
                SlipImagePicker(
                  label: 'Attach Dharamkanta / Unloading Scale Slip',
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
