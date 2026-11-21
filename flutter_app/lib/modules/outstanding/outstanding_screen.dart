import 'package:flutter/material.dart';
import '../../core/api/api_client.dart';
import '../../core/theme/app_theme.dart';
import '../../components/layout/erp_header.dart';

class OutstandingScreen extends StatefulWidget {
  const OutstandingScreen({super.key});

  @override
  State<OutstandingScreen> createState() => _OutstandingScreenState();
}

class _OutstandingScreenState extends State<OutstandingScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;
  Map<String, dynamic> _summary = {};
  bool _loading = true;

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

  @override
  Widget build(BuildContext context) {
    final trucks = List<Map<String, dynamic>>.from(_summary['truckOutstanding'] ?? []);
    final parties = List<Map<String, dynamic>>.from(_summary['partyOutstanding'] ?? []);

    return Column(
      children: [
        const ERPHeader(
          title: 'Outstanding & Ageing Management',
          subtitle: 'Unpaid Freight Ledgers, Party Payables & Ageing Brackets',
        ),
        Container(
          color: Colors.white,
          child: TabBar(
            controller: _tabController,
            labelColor: AppColors.primary,
            unselectedLabelColor: AppColors.textMuted,
            indicatorColor: AppColors.primary,
            tabs: [
              Tab(text: 'Truck-wise Payables (${trucks.length})'),
              Tab(text: 'Party Pending Receivables (${parties.length})'),
            ],
          ),
        ),
        Expanded(
          child: _loading
              ? const Center(child: CircularProgressIndicator())
              : TabBarView(
                  controller: _tabController,
                  children: [
                    _buildList(trucks, 'truck_no', 'owner_name', 'pending_settlements', 'outstanding_amount', true),
                    _buildList(parties, 'party_name', null, null, 'outstanding_amount', false),
                  ],
                ),
        ),
      ],
    );
  }

  Widget _buildList(List<Map<String, dynamic>> list, String titleKey, String? subKey, String? badgeKey, String amtKey, bool isTruck) {
    if (list.isEmpty) {
      return Center(child: Text(isTruck ? 'No outstanding truck balances' : 'No outstanding party balances', style: const TextStyle(color: AppColors.textMuted)));
    }
    return ListView.separated(
      padding: const EdgeInsets.all(20),
      itemCount: list.length,
      separatorBuilder: (_, __) => const SizedBox(height: 8),
      itemBuilder: (ctx, i) {
        final item = list[i];
        final amt = item[amtKey] ?? 0;
        return Card(
          elevation: 0,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12), side: const BorderSide(color: AppColors.border)),
          child: ListTile(
            leading: CircleAvatar(
              backgroundColor: isTruck ? const Color(0xFFEFF6FF) : const Color(0xFFF3E8FF),
              child: Icon(isTruck ? Icons.local_shipping : Icons.business, color: isTruck ? AppColors.primary : Colors.purple, size: 18),
            ),
            title: Text(item[titleKey] ?? '-', style: const TextStyle(fontWeight: FontWeight.bold)),
            subtitle: subKey != null ? Text('Owner: ${item[subKey] ?? '-'}') : null,
            trailing: Text('₹$amt', style: const TextStyle(fontWeight: FontWeight.w900, color: Color(0xFFE11D48), fontSize: 14)),
          ),
        );
      },
    );
  }
}
