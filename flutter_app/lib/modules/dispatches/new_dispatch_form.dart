import 'package:flutter/material.dart';
import '../../core/api/api_client.dart';
import '../../core/database/local_storage.dart';
import '../../core/theme/app_theme.dart';
import 'order_setup_card.dart';
import 'vehicle_assignment_card.dart';
import 'summary_sidebar.dart';

class NewDispatchFormView extends StatefulWidget {
  final VoidCallback onSaved;
  const NewDispatchFormView({super.key, required this.onSaved});

  @override
  State<NewDispatchFormView> createState() => _NewDispatchFormViewState();
}

class _NewDispatchFormViewState extends State<NewDispatchFormView> {
  bool _isMultiMode = false;
  bool _isSubmitting = false;

  final _dateCtrl = TextEditingController(text: DateTime.now().toIso8601String().split('T')[0]);
  final _srNoCtrl = TextEditingController();
  final _balesCtrl = TextEditingController();
  final _driverPhoneCtrl = TextEditingController();
  final _remarksCtrl = TextEditingController();

  List<Map<String, dynamic>> _trucks = [];
  List<Map<String, dynamic>> _sources = [];
  List<Map<String, dynamic>> _destinations = [];

  String? _selectedTruckId;
  String? _selectedSourceId;
  String? _selectedDestId;
  String _commodity = 'Cotton Bales';
  String? _slipImage;

  final List<Map<String, dynamic>> _multiTruckRows = [
    {'id': 'r1', 'truckId': null, 'bales': '', 'phone': '', 'slip': null},
    {'id': 'r2', 'truckId': null, 'bales': '', 'phone': '', 'slip': null},
  ];

  @override
  void initState() {
    super.initState();
    _loadMasters();
  }

  Future<void> _loadMasters() async {
    try {
      final t = await ApiClient().get('/masters/trucks');
      final s = await ApiClient().get('/masters/sources');
      final d = await ApiClient().get('/masters/destinations');
      if (mounted) {
        setState(() {
          if (t.data is List) _trucks = List<Map<String, dynamic>>.from(t.data);
          if (s.data is List) {
            _sources = List<Map<String, dynamic>>.from(s.data);
            if (_sources.isNotEmpty && _selectedSourceId == null) {
              _selectedSourceId = _sources.first['id']?.toString();
            }
          }
          if (d.data is List) _destinations = List<Map<String, dynamic>>.from(d.data);
        });
      }
    } catch (_) {}
  }

  Map<String, dynamic>? get _curTruck {
    if (_selectedTruckId == null) return null;
    return _trucks.firstWhere((t) => t['id']?.toString() == _selectedTruckId, orElse: () => {});
  }

  Map<String, dynamic>? get _curSource {
    if (_selectedSourceId == null) return null;
    return _sources.firstWhere((s) => s['id']?.toString() == _selectedSourceId, orElse: () => {});
  }

  Map<String, dynamic>? get _curDest {
    if (_selectedDestId == null) return null;
    return _destinations.firstWhere((d) => d['id']?.toString() == _selectedDestId, orElse: () => {});
  }

  int get _calcBales {
    if (!_isMultiMode) return int.tryParse(_balesCtrl.text) ?? 0;
    return _multiTruckRows.fold<int>(0, (sum, r) => sum + (int.tryParse(r['bales'].toString()) ?? 0));
  }

  Future<void> _submitDispatch() async {
    if (_selectedSourceId == null && _sources.isNotEmpty) {
      _selectedSourceId = _sources.first['id']?.toString();
    }
    setState(() => _isSubmitting = true);
    final srcObj = _curSource;
    final destObj = _curDest;
    final destName = destObj?['name'] ?? _selectedDestId ?? '';

    if (!_isMultiMode) {
      final tObj = _curTruck;
      final payload = {
        'date': _dateCtrl.text.trim(),
        'srNo': _srNoCtrl.text.trim(),
        'sourceId': _selectedSourceId,
        'sourceName': srcObj?['name'] ?? '',
        'destination': destName,
        'material': _commodity,
        'truckId': _selectedTruckId,
        'truckNo': tObj?['truck_no'] ?? tObj?['truckNo'] ?? '',
        'ownerName': tObj?['owner_name'] ?? tObj?['ownerName'] ?? '',
        'bales': int.tryParse(_balesCtrl.text) ?? 0,
        'driverMobile': _driverPhoneCtrl.text.trim(),
        'slipImage': _slipImage,
        'remarks': _remarksCtrl.text.trim(),
      };
      try {
        await ApiClient().post('/dispatches', data: payload);
      } catch (_) {
        await LocalStorage().queueOfflineAction('dispatches', 'CREATE', payload);
      }
    } else {
      for (final row in _multiTruckRows) {
        if (row['truckId'] == null) continue;
        final t = _trucks.firstWhere((k) => k['id']?.toString() == row['truckId'], orElse: () => {});
        final payload = {
          'date': _dateCtrl.text.trim(),
          'srNo': _srNoCtrl.text.trim(),
          'sourceId': _selectedSourceId,
          'sourceName': srcObj?['name'] ?? '',
          'destination': destName,
          'material': _commodity,
          'truckId': row['truckId'],
          'truckNo': t['truck_no'] ?? t['truckNo'] ?? '',
          'ownerName': t['owner_name'] ?? t['ownerName'] ?? '',
          'bales': int.tryParse(row['bales'].toString()) ?? 0,
          'driverMobile': row['phone'] ?? '',
          'slipImage': row['slip'],
          'remarks': _remarksCtrl.text.trim(),
        };
        try {
          await ApiClient().post('/dispatches', data: payload);
        } catch (_) {
          await LocalStorage().queueOfflineAction('dispatches', 'CREATE', payload);
        }
      }
    }

    if (mounted) {
      setState(() => _isSubmitting = false);
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Dispatch order recorded successfully!'), backgroundColor: AppColors.success),
      );
      widget.onSaved();
    }
  }

  @override
  Widget build(BuildContext context) {
    final tObj = _curTruck;
    final sObj = _curSource;
    final dObj = _curDest;
    final isDesktop = MediaQuery.of(context).size.width >= 1024;

    return SingleChildScrollView(
      padding: const EdgeInsets.all(20),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Expanded(
            flex: isDesktop ? 2 : 1,
            child: Column(
              children: [
                OrderSetupCard(
                  isMultiMode: _isMultiMode,
                  dateCtrl: _dateCtrl,
                  srNoCtrl: _srNoCtrl,
                  selectedSourceId: _selectedSourceId,
                  selectedDestId: _selectedDestId,
                  commodity: _commodity,
                  sources: _sources,
                  destinations: _destinations,
                  onModeChanged: (m) => setState(() => _isMultiMode = m),
                  onSourceChanged: (v) => setState(() => _selectedSourceId = v),
                  onDestChanged: (v) => setState(() => _selectedDestId = v),
                  onCommodityChanged: (c) => setState(() => _commodity = c),
                  onSourceAdded: (s) => setState(() {
                    _sources.add(s);
                    _selectedSourceId = s['id']?.toString();
                  }),
                  onDestAdded: (d) => setState(() {
                    _destinations.add(d);
                    _selectedDestId = d['id']?.toString();
                  }),
                ),
                const SizedBox(height: 16),
                VehicleAssignmentCard(
                  isMultiMode: _isMultiMode,
                  selectedTruckId: _selectedTruckId,
                  balesCtrl: _balesCtrl,
                  phoneCtrl: _driverPhoneCtrl,
                  trucks: _trucks,
                  multiTruckRows: _multiTruckRows,
                  onTruckChanged: (v) => setState(() => _selectedTruckId = v),
                  onTruckAdded: (t) => setState(() {
                    _trucks.add(t);
                    _selectedTruckId = t['id']?.toString();
                  }),
                  onSlipSelected: (img) => setState(() => _slipImage = img),
                  onAddMultiRow: () => setState(() => _multiTruckRows.add({'id': 'r_${DateTime.now().millisecondsSinceEpoch}', 'truckId': null, 'bales': '', 'phone': '', 'slip': null})),
                  onRemoveMultiRow: (i) => setState(() => _multiTruckRows.removeAt(i)),
                ),
                const SizedBox(height: 16),
                Card(
                  elevation: 0,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16), side: const BorderSide(color: AppColors.border)),
                  child: Padding(
                    padding: const EdgeInsets.all(20),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text('Remarks / Load Notes', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: AppColors.textMain)),
                        const SizedBox(height: 8),
                        TextField(controller: _remarksCtrl, maxLines: 2, decoration: const InputDecoration(hintText: 'Optional notes regarding driver, bales quality, or transit conditions...')),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),
          if (isDesktop) ...[
            const SizedBox(width: 24),
            SizedBox(
              width: 320,
              child: DispatchSummarySidebarWidget(
                isMultiMode: _isMultiMode,
                selectedTruckNo: tObj?['truck_no'] ?? tObj?['truckNo'] ?? '',
                selectedTruckOwner: tObj?['owner_name'] ?? tObj?['ownerName'] ?? '',
                totalBales: _calcBales,
                selectedSource: sObj?['name'] ?? '',
                selectedDest: dObj?['name'] ?? '',
                multiCount: _multiTruckRows.where((r) => r['truckId'] != null).length,
                isSubmitting: _isSubmitting,
                onSave: _submitDispatch,
              ),
            ),
          ],
        ],
      ),
    );
  }
}
