import 'package:flutter/material.dart';
import 'core/theme/app_theme.dart';
import 'core/database/local_storage.dart';
import 'context/navigation_context.dart';
import 'shared/layout/main_layout.dart';
import 'modules/dashboard/dashboard_screen.dart';
import 'modules/dispatches/dispatches_screen.dart';
import 'modules/trips/trips_screen.dart';
import 'modules/fuel/fuel_screen.dart';
import 'modules/settlements/settlements_screen.dart';
import 'modules/payments/payments_screen.dart';
import 'modules/outstanding/outstanding_screen.dart';
import 'modules/pumps/pumps_screen.dart';
import 'modules/reports/reports_screen.dart';
import 'modules/trucks/trucks_screen.dart';
import 'modules/masters/transporters_screen.dart';
import 'modules/masters/sources_screen.dart';
import 'modules/masters/destinations_screen.dart';
import 'modules/masters/parties_screen.dart';
import 'modules/reconcile/reconcile_screen.dart';
import 'modules/migration/migration_screen.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await LocalStorage().init();
  runApp(const RSTransportApp());
}

class RSTransportApp extends StatelessWidget {
  const RSTransportApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'RS Transport ERP',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.lightTheme,
      home: const RootNavigationHost(),
    );
  }
}

class RootNavigationHost extends StatefulWidget {
  const RootNavigationHost({super.key});

  @override
  State<RootNavigationHost> createState() => _RootNavigationHostState();
}

class _RootNavigationHostState extends State<RootNavigationHost> {
  final _navContext = NavigationContext();

  @override
  void initState() {
    super.initState();
    _navContext.addListener(_onStateChange);
  }

  @override
  void dispose() {
    _navContext.removeListener(_onStateChange);
    super.dispose();
  }

  void _onStateChange() {
    if (mounted) setState(() {});
  }

  void _onNavigate(int index) {
    _navContext.navigateTo(index);
  }

  @override
  Widget build(BuildContext context) {
    final currentIndex = _navContext.currentIndex;
    final screens = [
      DashboardScreen(onNavigate: _onNavigate), // 0: Dashboard
      DispatchesScreen(onNavigate: _onNavigate),// 1: Dispatches
      TripsScreen(onNavigate: _onNavigate),     // 2: Trips & Freight
      const FuelScreen(),                       // 3: Fuel & Diesel
      const SettlementsScreen(),                // 4: Settlements
      const PaymentsScreen(),                   // 5: Payments
      const OutstandingScreen(),                // 6: Outstanding
      const PumpsScreen(),                      // 7: Pump Accounts
      const ReportsScreen(),                    // 8: Reports & Analytics
      const TrucksScreen(),                     // 9: Truck Master
      const TransportersScreen(),               // 10: Transporters
      const SourcesScreen(),                    // 11: Sources Master
      const DestinationsScreen(),               // 12: Destinations
      const PartiesScreen(),                    // 13: Parties
      const ReconcileScreen(),                  // 14: Reconcile Plant Pass
      const MigrationScreen(),                  // 15: Excel Migration
    ];

    return MainLayout(
      currentIndex: currentIndex,
      onNavigate: _onNavigate,
      child: IndexedStack(
        index: currentIndex,
        children: screens,
      ),
    );
  }
}
