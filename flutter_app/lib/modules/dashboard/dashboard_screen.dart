import 'package:flutter/material.dart';
import '../../core/api/api_client.dart';
import '../../core/theme/app_theme.dart';
import '../../context/company_context.dart';
import '../../components/layout/erp_header.dart';

class DashboardScreen extends StatefulWidget {
  final Function(int) onNavigate;
  const DashboardScreen({super.key, required this.onNavigate});

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  Map<String, dynamic> _kpis = {};
  List<Map<String, dynamic>> _recentDispatches = [];
  List<Map<String, dynamic>> _recentTrips = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _loadDashboard();
    CompanyState().addListener(_onCompanyChange);
  }

  @override
  void dispose() {
    CompanyState().removeListener(_onCompanyChange);
    super.dispose();
  }

  void _onCompanyChange() {
    _loadDashboard();
  }

  Future<void> _loadDashboard() async {
    setState(() => _loading = true);
    final compCode = CompanyState().activeCompany.codeStr;
    try {
      final resKpi = await ApiClient().get('/dashboard/kpis', queryParameters: {'companyCode': compCode});
      final resRecent = await ApiClient().get('/dashboard/recent', queryParameters: {'companyCode': compCode});
      if (mounted) {
        setState(() {
          if (resKpi.data is Map) _kpis = Map<String, dynamic>.from(resKpi.data);
          if (resRecent.data is Map) {
            _recentDispatches = List<Map<String, dynamic>>.from(resRecent.data['recentDispatches'] ?? []);
            _recentTrips = List<Map<String, dynamic>>.from(resRecent.data['recentTrips'] ?? []);
          }
        });
      }
    } catch (_) {} finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final isMobile = MediaQuery.of(context).size.width < 600;

    return Column(
      children: [
        ERPHeader(
          title: 'Transport ERP Dashboard',
          subtitle: 'Complete Operational & Financial Overview',
          actions: isMobile
              ? IconButton(
                  icon: const Icon(Icons.add_circle, color: AppColors.primary, size: 24),
                  tooltip: 'New Dispatch',
                  padding: EdgeInsets.zero,
                  constraints: const BoxConstraints(minWidth: 32, minHeight: 32),
                  onPressed: () => widget.onNavigate(1),
                )
              : Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    ElevatedButton.icon(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.primary,
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                      ),
                      onPressed: () => widget.onNavigate(1),
                      icon: const Icon(Icons.add, size: 14),
                      label: const Text('New Dispatch', style: TextStyle(fontSize: 11)),
                    ),
                    const SizedBox(width: 6),
                    OutlinedButton.icon(
                      style: OutlinedButton.styleFrom(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                      ),
                      onPressed: () => widget.onNavigate(2),
                      icon: const Icon(Icons.navigation, size: 14),
                      label: const Text('Record Trip', style: TextStyle(fontSize: 11)),
                    ),
                  ],
                ),
        ),
        Expanded(
          child: SingleChildScrollView(
            padding: EdgeInsets.all(isMobile ? 12 : 20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _buildKpiSection(),
                const SizedBox(height: 16),
                _buildFinancialKpiSection(),
                const SizedBox(height: 20),
                _buildRecentTables(),
              ],
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildKpiSection() {
    return LayoutBuilder(
      builder: (context, constraints) {
        final count = constraints.maxWidth >= 900 ? 4 : 2;
        final ratio = constraints.maxWidth < 600 ? 1.4 : 1.6;
        return GridView.count(
          crossAxisCount: count,
          shrinkWrap: true,
          crossAxisSpacing: 10,
          mainAxisSpacing: 10,
          childAspectRatio: ratio,
          physics: const NeverScrollableScrollPhysics(),
          children: [
            _card('Registered Trucks', '${_kpis['totalRegisteredTrucks'] ?? 0}', Icons.directions_car, AppColors.primary),
            _card('Total Dispatches', '${_kpis['totalDispatches'] ?? 0}', Icons.send, const Color(0xFF64748B)),
            _card('Total Trips', '${_kpis['totalTrips'] ?? 0}', Icons.navigation, Colors.purple),
            _card('Pending Settlements', '${_kpis['pendingSettlements'] ?? 0}', Icons.warning_amber, Colors.amber),
          ],
        );
      },
    );
  }

  Widget _buildFinancialKpiSection() {
    return LayoutBuilder(
      builder: (context, constraints) {
        final count = constraints.maxWidth >= 900 ? 4 : 2;
        final ratio = constraints.maxWidth < 600 ? 1.35 : 1.6;
        return GridView.count(
          crossAxisCount: count,
          shrinkWrap: true,
          crossAxisSpacing: 10,
          mainAxisSpacing: 10,
          childAspectRatio: ratio,
          physics: const NeverScrollableScrollPhysics(),
          children: [
            _card('Total Gross Freight', '₹${_kpis['totalGrossFreight'] ?? 0}', Icons.monetization_on, AppColors.primary, sub: 'Billable freight generated'),
            _card('Diesel Deductions', '₹${_kpis['totalDieselAmount'] ?? 0}', Icons.local_gas_station, Colors.amber, sub: 'Fuel provided from pumps'),
            _card('Payments Disbursed', '₹${_kpis['totalPaymentsMade'] ?? 0}', Icons.check_circle, Colors.green, sub: 'Freight paid out to trucks'),
            _card('Net Outstanding', '₹${_kpis['totalOutstanding'] ?? 0}', Icons.account_balance_wallet, Colors.red, sub: 'Payables pending balance'),
          ],
        );
      },
    );
  }

  Widget _card(String title, String val, IconData icon, Color col, {String? sub}) {
    return Card(
      elevation: 0,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12), side: const BorderSide(color: AppColors.border)),
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Expanded(child: Text(title, style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: AppColors.textMuted), overflow: TextOverflow.ellipsis)),
                Icon(icon, color: col, size: 16),
              ],
            ),
            const SizedBox(height: 6),
            Text(val, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w900, color: AppColors.textMain), overflow: TextOverflow.ellipsis),
            if (sub != null) ...[
              const SizedBox(height: 2),
              Text(sub, style: const TextStyle(fontSize: 9, color: AppColors.textMuted), overflow: TextOverflow.ellipsis),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildRecentTables() {
    return LayoutBuilder(
      builder: (context, constraints) {
        final isWide = constraints.maxWidth >= 900;
        final dispatches = _tableCard('Recent Dispatches', _recentDispatches, ['Truck', 'Source', 'Dest', 'Bales'], (d) => [d['truck_no'] ?? '-', d['source_name'] ?? '-', d['destination'] ?? '-', '${d['bales'] ?? 0}'], 1);
        final trips = _tableCard('Recent Trips & Weight Records', _recentTrips, ['Trip #', 'Truck', 'Dest', 'Gross Freight'], (t) => [t['trip_no'] ?? '-', t['truck_no'] ?? '-', t['destination_name'] ?? '-', '₹${t['gross_freight'] ?? 0}'], 2);

        return isWide
            ? Row(crossAxisAlignment: CrossAxisAlignment.start, children: [Expanded(child: dispatches), const SizedBox(width: 16), Expanded(child: trips)])
            : Column(children: [dispatches, const SizedBox(height: 16), trips]);
      },
    );
  }

  Widget _tableCard(String title, List<Map<String, dynamic>> items, List<String> headers, List<String> Function(Map<String, dynamic>) rowMapper, int navTarget) {
    return Card(
      elevation: 0,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12), side: const BorderSide(color: AppColors.border)),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(title, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: AppColors.textMain)),
                InkWell(onTap: () => widget.onNavigate(navTarget), child: const Text('View All', style: TextStyle(fontSize: 11, color: AppColors.primary, fontWeight: FontWeight.bold))),
              ],
            ),
            const Divider(height: 16),
            if (items.isEmpty)
              const Padding(padding: EdgeInsets.symmetric(vertical: 20), child: Text('No records entered yet.', style: TextStyle(fontSize: 11, color: AppColors.textMuted)))
            else
              Table(
                children: [
                  TableRow(children: headers.map((h) => Padding(padding: const EdgeInsets.symmetric(vertical: 4), child: Text(h, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 10, color: AppColors.textMuted)))).toList()),
                  ...items.take(5).map((it) {
                    final cells = rowMapper(it);
                    return TableRow(children: cells.map((c) => Padding(padding: const EdgeInsets.symmetric(vertical: 4), child: Text(c, style: const TextStyle(fontSize: 11), overflow: TextOverflow.ellipsis))).toList());
                  }),
                ],
              ),
          ],
        ),
      ),
    );
  }
}
