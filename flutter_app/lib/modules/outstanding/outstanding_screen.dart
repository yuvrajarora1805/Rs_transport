import 'package:flutter/material.dart';
import '../../core/api/api_client.dart';
import '../../core/theme/app_theme.dart';
import '../../components/layout/erp_header.dart';
import '../../context/navigation_context.dart';

class OutstandingScreen extends StatefulWidget {
  final Function(int)? onNavigate;
  const OutstandingScreen({super.key, this.onNavigate});

  @override
  State<OutstandingScreen> createState() => _OutstandingScreenState();
}

class _OutstandingScreenState extends State<OutstandingScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;
  Map<String, dynamic> _summary = {};
  bool _loading = true;
  String _search = '';

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
    _loadOutstanding();
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  Future<void> _loadOutstanding() async {
    setState(() => _loading = true);
    try {
      final res = await ApiClient().get('/outstanding/summary');
      if (mounted && res.data is Map) {
        setState(() => _summary = Map<String, dynamic>.from(res.data));
      }
    } catch (_) {} finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  String _formatCurrency(dynamic val) {
    final num numVal = num.tryParse(val?.toString() ?? '0') ?? 0;
    return '₹${numVal.toStringAsFixed(2).replaceAllMapped(RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'), (m) => '${m[1]},')}';
  }

  @override
  Widget build(BuildContext context) {
    final trucks = List<Map<String, dynamic>>.from(_summary['truckOutstanding'] ?? []);
    final parties = List<Map<String, dynamic>>.from(_summary['partyOutstanding'] ?? []);
    final q = _search.toLowerCase();

    final filteredTrucks = trucks.where((t) {
      final no = (t['truck_no'] ?? '').toString().toLowerCase();
      final owner = (t['owner_name'] ?? '').toString().toLowerCase();
      return no.contains(q) || owner.contains(q);
    }).toList();

    final filteredParties = parties.where((p) {
      final name = (p['party_name'] ?? '').toString().toLowerCase();
      return name.contains(q);
    }).toList();

    return Column(
      children: [
        const ERPHeader(
          title: 'Outstanding & Ageing Management',
          subtitle: 'Unpaid Freight Ledgers, Party Receivables & Truck Balance Statements',
        ),
        Container(
          color: Colors.white,
          padding: const EdgeInsets.symmetric(horizontal: 16),
          child: TabBar(
            controller: _tabController,
            labelColor: AppColors.primary,
            unselectedLabelColor: const Color(0xFF64748B),
            indicatorColor: AppColors.primary,
            isScrollable: true,
            tabAlignment: TabAlignment.start,
            labelStyle: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
            unselectedLabelStyle: const TextStyle(fontSize: 13),
            tabs: [
              Tab(text: 'Truck Balances (${filteredTrucks.length})'),
              Tab(text: 'Party Receivables (${filteredParties.length})'),
            ],
          ),
        ),
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
          child: TextField(
            decoration: const InputDecoration(
              prefixIcon: Icon(Icons.search, size: 18),
              hintText: 'Search by truck plate, owner, or party client name...',
              contentPadding: EdgeInsets.symmetric(horizontal: 10, vertical: 8),
            ),
            onChanged: (v) => setState(() => _search = v),
          ),
        ),
        Expanded(
          child: _loading
              ? const Center(child: CircularProgressIndicator())
              : TabBarView(
                  controller: _tabController,
                  children: [
                    _buildTruckList(filteredTrucks),
                    _buildPartyList(filteredParties),
                  ],
                ),
        ),
      ],
    );
  }

  Widget _buildTruckList(List<Map<String, dynamic>> list) {
    if (list.isEmpty) {
      return const Center(child: Text('No outstanding truck balances', style: TextStyle(color: AppColors.textMuted)));
    }
    return ListView.separated(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      itemCount: list.length,
      separatorBuilder: (_, __) => const SizedBox(height: 8),
      itemBuilder: (ctx, i) {
        final t = list[i];
        final amt = num.tryParse((t['outstanding_amount'] ?? 0).toString()) ?? 0;
        final truck = t['truck_no'] ?? '-';
        final owner = t['owner_name'] ?? 'No Owner';
        final pendingTrips = t['pending_settlements'] ?? 0;

        return Card(
          elevation: 0,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12), side: const BorderSide(color: Color(0xFFE2E8F0))),
          child: Padding(
            padding: const EdgeInsets.all(12),
            child: Row(
              children: [
                CircleAvatar(
                  radius: 18,
                  backgroundColor: const Color(0xFFEFF6FF),
                  child: const Icon(Icons.local_shipping, size: 16, color: Color(0xFF2563EB)),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(truck, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Color(0xFF0F172A))),
                      const SizedBox(height: 2),
                      Text('Owner: $owner • Pending: $pendingTrips trips', style: const TextStyle(fontSize: 11, color: Color(0xFF64748B))),
                    ],
                  ),
                ),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    Text(_formatCurrency(amt), style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 13, color: Color(0xFFE11D48))),
                    const SizedBox(height: 4),
                    InkWell(
                      onTap: () => NavigationContext().navigateTo(4, params: {'truckNo': truck}),
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                        decoration: BoxDecoration(color: const Color(0xFFFEF3C7), borderRadius: BorderRadius.circular(4)),
                        child: const Text('Settle Freight →', style: TextStyle(fontSize: 9, fontWeight: FontWeight.bold, color: Color(0xFFD97706))),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _buildPartyList(List<Map<String, dynamic>> list) {
    if (list.isEmpty) {
      return const Center(child: Text('No outstanding party balances', style: TextStyle(color: AppColors.textMuted)));
    }
    return ListView.separated(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      itemCount: list.length,
      separatorBuilder: (_, __) => const SizedBox(height: 8),
      itemBuilder: (ctx, i) {
        final p = list[i];
        final amt = num.tryParse((p['outstanding_amount'] ?? 0).toString()) ?? 0;
        final party = p['party_name'] ?? '-';

        return Card(
          elevation: 0,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12), side: const BorderSide(color: Color(0xFFE2E8F0))),
          child: Padding(
            padding: const EdgeInsets.all(12),
            child: Row(
              children: [
                CircleAvatar(
                  radius: 18,
                  backgroundColor: const Color(0xFFECFDF5),
                  child: const Icon(Icons.account_balance_wallet, size: 16, color: Color(0xFF059669)),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Text(party, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Color(0xFF0F172A))),
                ),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    Text(_formatCurrency(amt), style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 13, color: Color(0xFF059669))),
                    const SizedBox(height: 4),
                    InkWell(
                      onTap: () => NavigationContext().navigateTo(13),
                      child: const Text('View Ledger →', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Color(0xFF2563EB))),
                    ),
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
