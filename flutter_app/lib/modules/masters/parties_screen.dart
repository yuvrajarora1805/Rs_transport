import 'package:flutter/material.dart';
import '../../core/api/api_client.dart';
import '../../core/theme/app_theme.dart';
import '../../components/layout/erp_header.dart';

class PartiesScreen extends StatefulWidget {
  const PartiesScreen({super.key});

  @override
  State<PartiesScreen> createState() => _PartiesScreenState();
}

class _PartiesScreenState extends State<PartiesScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;
  List<Map<String, dynamic>> _parties = [];
  List<Map<String, dynamic>> _pendingList = [];
  bool _loading = true;
  String _search = '';

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
    _loadData();
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  Future<void> _loadData() async {
    setState(() => _loading = true);
    try {
      final resP = await ApiClient().get('/masters/parties');
      final resPend = await ApiClient().get('/masters/parties/pending-payments');
      if (mounted) {
        setState(() {
          if (resP.data is List) _parties = List<Map<String, dynamic>>.from(resP.data);
          if (resPend.data is List) _pendingList = List<Map<String, dynamic>>.from(resPend.data);
        });
      }
    } catch (_) {} finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<void> _addPartyDialog() async {
    final nameCtrl = TextEditingController();
    final destCtrl = TextEditingController();
    final phoneCtrl = TextEditingController();

    await showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Add New Party', style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold)),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(controller: nameCtrl, decoration: const InputDecoration(labelText: 'Party / Client Name *')),
            const SizedBox(height: 10),
            TextField(controller: destCtrl, decoration: const InputDecoration(labelText: 'Linked Destination')),
            const SizedBox(height: 10),
            TextField(controller: phoneCtrl, decoration: const InputDecoration(labelText: 'Contact Phone Number')),
          ],
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cancel')),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: AppColors.primary),
            onPressed: () async {
              if (nameCtrl.text.trim().isEmpty) return;
              try {
                await ApiClient().post('/masters/parties', data: {'name': nameCtrl.text.trim(), 'destination': destCtrl.text.trim(), 'contactNo': phoneCtrl.text.trim()});
                Navigator.pop(ctx);
                _loadData();
              } catch (_) {}
            },
            child: const Text('Save Party', style: TextStyle(color: Colors.white)),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        ERPHeader(
          title: 'Parties Master & Reconciliation',
          subtitle: 'Business Parties, Freight Ledger & Pending Client Receivables',
          actions: ElevatedButton.icon(
            style: ElevatedButton.styleFrom(backgroundColor: AppColors.primary, foregroundColor: Colors.white, padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8)),
            onPressed: _addPartyDialog,
            icon: const Icon(Icons.add, size: 14),
            label: const Text('Add Party', style: TextStyle(fontSize: 11)),
          ),
        ),
        Container(
          color: Colors.white,
          child: TabBar(
            controller: _tabController,
            labelColor: AppColors.primary,
            unselectedLabelColor: AppColors.textMuted,
            indicatorColor: AppColors.primary,
            tabs: [Tab(text: 'Directory (${_parties.length})'), Tab(text: 'Pending Receivables (${_pendingList.length})')],
          ),
        ),
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
          child: TextField(
            decoration: const InputDecoration(prefixIcon: Icon(Icons.search, size: 20), hintText: 'Search by client name, destination, or contact...'),
            onChanged: (v) => setState(() => _search = v),
          ),
        ),
        Expanded(
          child: _loading
              ? const Center(child: CircularProgressIndicator())
              : TabBarView(
                  controller: _tabController,
                  children: [_buildList(_parties, true), _buildList(_pendingList, false)],
                ),
        ),
      ],
    );
  }

  Widget _buildList(List<Map<String, dynamic>> source, bool isDirectory) {
    final q = _search.toLowerCase();
    final list = source.where((p) {
      final name = (p[isDirectory ? 'name' : 'party_name'] ?? '').toString().toLowerCase();
      final sub = (p[isDirectory ? 'destination_name' : 'trip_no'] ?? '').toString().toLowerCase();
      return name.contains(q) || sub.contains(q);
    }).toList();

    if (list.isEmpty) return const Center(child: Text('No records found.', style: TextStyle(color: AppColors.textMuted)));

    return ListView.separated(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      itemCount: list.length,
      separatorBuilder: (_, __) => const SizedBox(height: 8),
      itemBuilder: (ctx, i) {
        final it = list[i];
        final name = it[isDirectory ? 'name' : 'party_name'] ?? 'PARTY';
        final sub = isDirectory ? 'Dest: ${it['destination_name'] ?? 'All'} • Trips: ${it['trip_count'] ?? 0}' : 'Trip #${it['trip_no'] ?? '-'} • Truck: ${it['truck_no'] ?? '-'}';
        final out = it[isDirectory ? 'total_outstanding' : 'outstanding'] ?? 0;

        return Card(
          elevation: 0,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12), side: const BorderSide(color: AppColors.border)),
          child: Padding(
            padding: const EdgeInsets.all(12),
            child: Row(
              children: [
                CircleAvatar(
                  radius: 18,
                  backgroundColor: isDirectory ? const Color(0xFFF3E8FF) : const Color(0xFFFFF1F2),
                  child: Icon(isDirectory ? Icons.business : Icons.receipt_long, color: isDirectory ? Colors.purple : const Color(0xFFE11D48), size: 18),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(name, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                      const SizedBox(height: 2),
                      Text(sub, style: const TextStyle(fontSize: 11, color: AppColors.textMuted)),
                    ],
                  ),
                ),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    const Text('Due', style: TextStyle(fontSize: 9, color: AppColors.textMuted)),
                    Text('₹$out', style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: (num.tryParse(out.toString()) ?? 0) > 0 ? const Color(0xFFDC2626) : const Color(0xFF059669))),
                  ],
                ),
              ],
            ),
          ),
        );
      },
    );
  }
}
